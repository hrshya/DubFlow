import logging
import json
import uuid
import subprocess
from pathlib import Path
from typing import Literal
from uuid import UUID

import yt_dlp
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from service.gnani.main import synthesize_audio
from service.groq.main import transcribe_with_groq, translate_segments_with_groq
from service.gemini.main import localize_and_condense_segments, SUPPORTED_LANGUAGES
from utils.output_paths import OUTPUT_DIR, get_job_output_dir, get_output_url

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")

# Simple in-memory status tracker
jobs = {}
logger = logging.getLogger(__name__)

TargetLanguageCode = Literal[
    "hi-IN",
    "en-IN",
    "ta-IN",
    "te-IN",
    "kn-IN",
    "ml-IN",
    "mr-IN",
    "pa-IN",
    "bn-IN",
    "gu-IN",
    "hi-en",
]
SubtitleOutputFormat = Literal["SRT", "VTT", "TXT", "JSON"]


class DubRequest(BaseModel):
    youtube_url: str
    user_id: UUID
    target_language: TargetLanguageCode = "hi-IN"


class SubtitleRequest(DubRequest):
    subtitle_format: SubtitleOutputFormat = "SRT"


MAX_SUBTITLE_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024
SUPPORTED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}


def download_video(youtube_url: str, output_path: Path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    ydl_opts = {
        "format": "bestvideo[ext=mp4]/best[ext=mp4]",
        "outtmpl": str(output_path),
        "merge_output_format": "mp4",
        "quiet": True,
        "no_warnings": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])


def download_audio_as_wav(youtube_url: str, output_path: Path):
    """
    Download audio and convert it to WAV using yt-dlp postprocessing.
    Note: FFmpeg is still required under the hood for conversion.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": str(output_path.with_suffix(".%(ext)s")),
        "quiet": True,
        "no_warnings": True,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])


def get_media_duration(media_path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(media_path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def assemble_dubbed_audio(
    segment_audio_paths: list[Path],
    localized_segments: list[dict],
    output_path: Path,
    total_duration: float,
) -> None:
    if len(segment_audio_paths) != len(localized_segments):
        raise ValueError("Each synthesized clip must have a matching transcript segment")
    if total_duration <= 0:
        raise ValueError("Source media duration must be greater than zero")
    if not segment_audio_paths:
        raise ValueError("No speech segments were available to synthesize")

    command = ["ffmpeg", "-y"]
    for segment_audio_path in segment_audio_paths:
        command.extend(["-i", str(segment_audio_path)])

    filters = []
    delayed_inputs = []
    for index, (_, segment) in enumerate(
        zip(segment_audio_paths, localized_segments)
    ):
        start_time = max(float(segment["start_time"]), 0.0)
        end_time = min(float(segment["end_time"]), total_duration)
        segment_duration = end_time - start_time
        if segment_duration <= 0:
            continue
        synthesized_duration = get_media_duration(segment_audio_paths[index])
        if synthesized_duration <= 0:
            raise ValueError(
                f"Synthesized segment {index} has an invalid duration"
            )
        speed_factor = synthesized_duration / segment_duration
        tempo_filters = []
        while speed_factor > 2.0:
            tempo_filters.append("atempo=2.0")
            speed_factor /= 2.0
        while speed_factor < 0.5:
            tempo_filters.append("atempo=0.5")
            speed_factor /= 0.5
        if abs(speed_factor - 1.0) > 0.01:
            tempo_filters.append(f"atempo={speed_factor:.4f}")
        tempo_chain = f",{','.join(tempo_filters)}" if tempo_filters else ""
        delay_ms = round(start_time * 1000)
        filters.append(
            f"[{index}:a]asetpts=PTS-STARTPTS{tempo_chain},"
            f"atrim=duration={segment_duration:.3f},"
            f"adelay={delay_ms}:all=1[a{index}]"
        )
        delayed_inputs.append(f"[a{index}]")

    if not delayed_inputs:
        raise ValueError("No transcript segments overlap the source media")

    filters.append(
        f"{''.join(delayed_inputs)}amix=inputs={len(delayed_inputs)}:"
        f"duration=longest:normalize=0,alimiter=limit=0.95,apad,"
        f"atrim=duration={total_duration:.3f}[aout]"
    )
    command.extend(
        [
            "-filter_complex",
            ";".join(filters),
            "-map",
            "[aout]",
            "-t",
            f"{total_duration:.3f}",
            "-c:a",
            "pcm_s16le",
            str(output_path),
        ]
    )
    subprocess.run(command, check=True)


def execute_dubbing_task(job_id: str, youtube_url: str):
    jobs[job_id]["status"] = "downloading"

    user_id = jobs[job_id]["user_id"]
    target_language = jobs[job_id]["target_language"]

    try:
        job_dir = get_job_output_dir(user_id, job_id)
        job_dir.mkdir(parents=True, exist_ok=True)
        video_file = job_dir / "video.mp4"
        audio_in = job_dir / "input_audio.mp3"
        audio_out = job_dir / "dubbed_audio.wav"
        final_file = job_dir / "dubbed_video.mp4"

        # 1. Download video using yt-dlp Python API
        download_video(youtube_url, video_file)

        # 2. Download audio as WAV using yt-dlp Python API
        jobs[job_id]["status"] = "downloading_audio"
        download_audio_as_wav(youtube_url, audio_in)

        # 3. Transcribe source audio and preserve its timestamps.
        jobs[job_id]["status"] = "transcribing"
        transcription = transcribe_with_groq(
            str(audio_in),
            user_id=user_id,
            job_id=job_id,
        )
        transcript_segments = [
            {
                "start_time": segment["start"],
                "end_time": segment["end"],
                "text": segment["text"],
            }
            for segment in transcription["segments"]
            if segment["text"].strip()
        ]
        if not transcript_segments:
            raise ValueError("Groq did not return any speech segments")

        # 4. Translate the timestamped segments in one request, then adapt them
        # to fit their original timing in a second batch request.
        jobs[job_id]["status"] = "translating"
        translated_segments = translate_segments_with_groq(
            transcript_segments,
            source_language=transcription["language"],
            target_language=SUPPORTED_LANGUAGES[target_language]["name"],
            user_id=user_id,
            job_id=job_id,
        )
        jobs[job_id]["status"] = "localizing"
        localized_segments = localize_and_condense_segments(
            translated_segments,
            lang_code=target_language,
            user_id=user_id,
            job_id=job_id,
        )

        # 5. Generate each localized line and place it at its source timestamp.
        jobs[job_id]["status"] = "synthesizing"
        segment_audio_paths = []
        segments_to_assemble = []
        synthesis_language = (
            "hi-IN" if target_language in {"hi-en", "auto"} else target_language
        )
        for index, segment in enumerate(localized_segments):
            if not segment["translated_text"].strip():
                continue
            segment_audio_path = job_dir / f"segment_{index:05d}.wav"
            synthesize_audio(
                segment["translated_text"],
                language=synthesis_language,
                user_id=user_id,
                job_id=job_id,
                filename=segment_audio_path.name,
            )
            segment_audio_paths.append(segment_audio_path)
            segments_to_assemble.append(segment)

        source_duration = get_media_duration(video_file)
        jobs[job_id]["status"] = "assembling"
        assemble_dubbed_audio(
            segment_audio_paths,
            segments_to_assemble,
            audio_out,
            source_duration,
        )

        # 6. Replace the source audio track with the timestamp-aligned dub.
        jobs[job_id]["status"] = "recompiling"
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(video_file),
                "-i",
                str(audio_out),
                "-c:v",
                "copy",
                "-c:a",
                "aac",
                "-map",
                "0:v:0",
                "-map",
                "1:a:0",
                "-shortest",
                str(final_file),
            ],
            check=True,
        )

        if not final_file.is_file() or final_file.stat().st_size == 0:
            raise RuntimeError("FFmpeg completed without producing a dubbed video")

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["output_url"] = get_output_url(final_file)

    except Exception as e:
        logger.exception("Dubbing job %s failed", job_id)
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)

    finally:
        # Clean up temporary raw streams
        # for temp_path in [video_file, audio_in, audio_out]:
        #     if temp_path.exists():
        #         temp_path.unlink()
        print("job done")


def format_subtitle_timestamp(seconds: float, separator: str) -> str:
    milliseconds = max(0, round(seconds * 1000))
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    whole_seconds, milliseconds = divmod(remainder, 1000)
    return (
        f"{hours:02}:{minutes:02}:{whole_seconds:02}"
        f"{separator}{milliseconds:03}"
    )


def write_subtitle_output(
    segments: list[dict],
    subtitle_format: str,
    output_path: Path,
) -> None:
    translated_segments = [
        {
            "start": segment["start"],
            "end": segment["end"],
            "text": segment["translation"],
        }
        for segment in segments
    ]

    if subtitle_format == "JSON":
        output_path.write_text(
            json.dumps(translated_segments, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return
    if subtitle_format == "TXT":
        output_path.write_text(
            "\n".join(segment["text"] for segment in translated_segments),
            encoding="utf-8",
        )
        return

    separator = "," if subtitle_format == "SRT" else "."
    blocks = []
    for index, segment in enumerate(translated_segments, start=1):
        start = format_subtitle_timestamp(segment["start"], separator)
        end = format_subtitle_timestamp(segment["end"], separator)
        blocks.append(
            f"{index}\n{start} --> {end}\n{segment['text']}"
        )

    header = "WEBVTT\n\n" if subtitle_format == "VTT" else ""
    output_path.write_text(
        header + "\n\n".join(blocks) + ("\n" if blocks else ""),
        encoding="utf-8",
    )


def execute_subtitle_task(
    job_id: str,
    youtube_url: str | None = None,
    uploaded_media_path: str | None = None,
):
    job = jobs[job_id]
    job_dir = get_job_output_dir(job["user_id"], job_id)
    audio_in = job_dir / "input_audio.mp3"
    job_dir.mkdir(parents=True, exist_ok=True)
    try:
        job["status"] = "downloading"
        if youtube_url:
            download_audio_as_wav(youtube_url, audio_in)
        elif uploaded_media_path:
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-i",
                    uploaded_media_path,
                    "-vn",
                    "-ac",
                    "1",
                    "-ar",
                    "16000",
                    "-b:a",
                    "128k",
                    str(audio_in),
                ],
                check=True,
                capture_output=True,
                text=True,
            )
        else:
            raise ValueError("A YouTube URL or uploaded video is required")

        job["status"] = "transcribing"
        transcription = transcribe_with_groq(
            str(audio_in),
            user_id=jobs[job_id]["user_id"],
            job_id=job_id,
        )
        transcript_segments = [
            segment
            for segment in transcription["segments"]
            if segment["text"].strip()
        ]
        if not transcript_segments:
            raise ValueError("No speech segments were detected in the video")

        job["status"] = "translating"
        translated_segments = translate_segments_with_groq(
            transcript_segments,
            source_language=transcription["language"],
            target_language=SUPPORTED_LANGUAGES[job["target_language"]]["name"],
            user_id=job["user_id"],
            job_id=job_id,
        )
        suffix = {
            "SRT": ".srt",
            "VTT": ".vtt",
            "TXT": ".txt",
            "JSON": ".json",
        }[job["subtitle_format"]]
        output_path = job_dir / f"subtitles{suffix}"
        write_subtitle_output(translated_segments, job["subtitle_format"], output_path)

        job["status"] = "completed"
        job["output_url"] = get_output_url(output_path)

    except Exception as e:
        logger.exception("Subtitle job %s failed", job_id)
        job["status"] = "failed"
        job["error"] = str(e)

    finally:
        if uploaded_media_path:
            uploaded_media = Path(uploaded_media_path)
            if uploaded_media.exists():
                uploaded_media.unlink()


@app.post("/api/dub")
async def start_dubbing(req: DubRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    user_id = str(req.user_id)
    jobs[job_id] = {
        "status": "queued",
        "output_url": None,
        "error": None,
        "user_id": user_id,
        "target_language": req.target_language,
    }

    background_tasks.add_task(
        execute_dubbing_task, job_id, req.youtube_url
    )
    return {"job_id": job_id}


@app.get("/api/status/{job_id}")
async def get_status(job_id: str, user_id: UUID):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    job = jobs[job_id]
    if job["user_id"] != str(user_id):
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        key: value
        for key, value in job.items()
        if key not in {"target_language", "subtitle_format"}
    }


@app.post("/api/subtitle")
async def generate_subtitle(req: SubtitleRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    user_id = str(req.user_id)
    jobs[job_id] = {
        "status": "queued",
        "output_url": None,
        "error": None,
        "user_id": user_id,
        "target_language": req.target_language,
        "subtitle_format": req.subtitle_format,
    }

    background_tasks.add_task(
        execute_subtitle_task, job_id, req.youtube_url
    )
    return {"job_id": job_id}


@app.post("/api/subtitle/upload")
async def upload_subtitle(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: UUID = Form(...),
    target_language: TargetLanguageCode = Form("hi-IN"),
    subtitle_format: SubtitleOutputFormat = Form("SRT"),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in SUPPORTED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported video type. Upload MP4, MOV, AVI, MKV, WebM, or M4V.",
        )

    job_id = str(uuid.uuid4())
    normalized_user_id = str(user_id)
    job_dir = get_job_output_dir(normalized_user_id, job_id)
    job_dir.mkdir(parents=True, exist_ok=True)
    uploaded_media_path = job_dir / f"source{suffix}"
    uploaded_size = 0
    saved = False

    try:
        with uploaded_media_path.open("wb") as destination:
            while chunk := await file.read(1024 * 1024):
                uploaded_size += len(chunk)
                if uploaded_size > MAX_SUBTITLE_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail="Video upload exceeds the 2 GB limit.",
                    )
                destination.write(chunk)
        if uploaded_size == 0:
            raise HTTPException(status_code=400, detail="Uploaded video is empty.")
        saved = True
    finally:
        await file.close()
        if not saved and uploaded_media_path.exists():
            uploaded_media_path.unlink()

    jobs[job_id] = {
        "status": "queued",
        "output_url": None,
        "error": None,
        "user_id": normalized_user_id,
        "target_language": target_language,
        "subtitle_format": subtitle_format,
    }
    background_tasks.add_task(
        execute_subtitle_task,
        job_id,
        uploaded_media_path=str(uploaded_media_path),
    )
    return {"job_id": job_id}


@app.get("/api/output")
def get_output(user_id: UUID, job_id: UUID):
    job_dir = get_job_output_dir(user_id, job_id)
    audio_path = job_dir / "input_audio.mp3"
    transcript_path = job_dir / "groq_transcription.json"
    try:
        transcription = transcribe_with_groq(
            str(audio_path),
            user_id,
            job_id,
        )
        transcription["output_path"] = get_output_url(transcript_path)
        return transcription
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
