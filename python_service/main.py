import shutil
import uuid
import subprocess
from pathlib import Path

import yt_dlp
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Simple in-memory status tracker
jobs = {}


class DubRequest(BaseModel):
    youtube_url: str


def download_video(youtube_url: str, output_path: Path):
    ydl_opts = {
        "format": "bestvideo[ext=mp4]",
        "outtmpl": str(output_path),
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
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": str(output_path.with_suffix(".%(ext)s")),
        "quiet": True,
        "no_warnings": True,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "wav",
                "preferredquality": "192",
            }
        ],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])


def execute_dubbing_task(job_id: str, youtube_url: str):
    jobs[job_id]["status"] = "downloading"

    video_file = OUTPUT_DIR / f"{job_id}_video.mp4"
    audio_in = OUTPUT_DIR / f"{job_id}_in.wav"
    audio_out = OUTPUT_DIR / f"{job_id}_out.wav"
    final_file = OUTPUT_DIR / f"{job_id}_dubbed.mp4"

    try:
        # 1. Download video using yt-dlp Python API
        download_video(youtube_url, video_file)

        # 2. Download audio as WAV using yt-dlp Python API
        jobs[job_id]["status"] = "downloading_audio"
        download_audio_as_wav(youtube_url, audio_in)

        # 3. Custom AI Dubbing Model Execution
        jobs[job_id]["status"] = "processing_ai"

        # Replace with your real model call
        shutil.copy(audio_in, audio_out)

        # 4. Recompile Video + Dubbed Audio using FFmpeg
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

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["output_url"] = (
            f"http://localhost:8000/outputs/{job_id}_dubbed.mp4"
        )

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)

    finally:
        # Clean up temporary raw streams
        for temp_path in [video_file, audio_in, audio_out]:
            if temp_path.exists():
                temp_path.unlink()


@app.post("/api/dub")
async def start_dubbing(req: DubRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "queued", "output_url": None, "error": None}

    background_tasks.add_task(execute_dubbing_task, job_id, req.youtube_url)
    return {"job_id": job_id}


@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]
