from gnani.stt import GnaniSTTBatchClient
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

        job.save("../../outputs")
    
    except Exception as e:
        print(f"Error during transcription: {e}")
        raise

