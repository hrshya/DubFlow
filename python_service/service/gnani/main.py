from gnani.stt import GnaniSTTBatchClient
from gnani.tts import GnaniTTSStreamClient
import subprocess
import tempfile
from pathlib import Path
from utils.lib import require

API_KEY = require("GNANI_API_KEY")

def transcribe_audio(audio_file_path: str, language: str) -> str:
    try:
        """
        Transcribes the given audio file using the Gnani STT API.

        Args:
            audio_file_path (str): The path to the audio file to be transcribed.
            language (str): The language code for transcription (e.g., 'en', 'hi').

        Returns:
            str: The transcribed text.
        """
        print(f"Transcribing audio: {audio_file_path} in language: {language}")

        client = GnaniSTTBatchClient(API_KEY)

        # 1. Create — POST /stt/v3/batch/jobs
        job = client.create_job(
            f"{audio_file_path}",
            language_code=language,
            start=False,                 # create only; omit to start automatically
        )
        print(job.id, job.status)        # CREATED

        # 2. Start — POST /stt/v3/batch/jobs/{job_id}/start
        job.start()
        print(job.status)                # STARTING

        # 3. Poll until a terminal status — GET /stt/v3/batch/jobs/{job_id}
        job.wait()                       # polls every 10 s
        print(job.status, job.percent)   # COMPLETED 100

        # 4. Fetch transcripts — GET .../files, then each transcript_url
        for f in job.files():
            print(f.name, f.status)
            if f.ok:
                print(f.text)            # full_transcript

        job.save("./outputs")

        #create a file with the transcribed text
        with open("./outputs/transcribed_text.txt", "w") as f:
            f.write(job.files()[0].text)

        return "./outputs/transcribed_text.txt"
    
    except Exception as e:
        print(f"Error during transcription: {e}")
        raise



def chunk_text(text: str, max_chars: int = 800) -> list[str]:
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0

    for word in words:
        if len(word) > max_chars:
            if current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_length = 0
            chunks.extend(
                word[index : index + max_chars]
                for index in range(0, len(word), max_chars)
            )
            continue

        added_length = len(word) + (1 if current_chunk else 0)
        if current_length + added_length > max_chars:
            chunks.append(" ".join(current_chunk))
            current_chunk = [word]
            current_length = len(word)
        else:
            current_chunk.append(word)
            current_length += added_length

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def synthesize_audio(
    text: str,
    language: str,
    output_file_path: str | Path = "confirmation.wav",
) -> str:
    """
    Synthesizes speech from the given text using the Gnani TTS API.

    Args:
        text (str): The text to be converted to speech.
        language (str): The language code for synthesis (e.g., 'en', 'hi').
        output_file_path: The path where the merged audio will be saved.
    """

    try:
        chunks = chunk_text(text)
        if not chunks:
            raise ValueError("Cannot synthesize empty text")

        output_path = Path(output_file_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        client = GnaniTTSStreamClient(API_KEY)

        with tempfile.TemporaryDirectory(
            prefix="tts_chunks_", dir=output_path.parent
        ) as temp_dir:
            chunk_paths = []
            for index, chunk in enumerate(chunks):
                chunk_path = Path(temp_dir) / f"chunk_{index:04d}.wav"
                client.synthesize(
                    chunk,
                    voice="Nalini",
                    model="timbre-v2.5",
                    language=language,
                    output_file=str(chunk_path),
                )
                chunk_paths.append(chunk_path)

            ffmpeg_command = ["ffmpeg", "-y"]
            for chunk_path in chunk_paths:
                ffmpeg_command.extend(["-i", str(chunk_path)])

            audio_inputs = "".join(
                f"[{index}:a]" for index in range(len(chunk_paths))
            )
            ffmpeg_command.extend(
                [
                    "-filter_complex",
                    f"{audio_inputs}concat=n={len(chunk_paths)}:v=0:a=1[out]",
                    "-map",
                    "[out]",
                    str(output_path),
                ]
            )
            subprocess.run(ffmpeg_command, check=True)

        print(f"Audio synthesized successfully to: {output_path}")
        return str(output_path)

    except Exception as e:
        print(f"Error during synthesis: {e}")
        raise