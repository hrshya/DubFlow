from gnani.stt import GnaniSTTBatchClient
from gnani.tts import GnaniTTSStreamClient
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



def synthesize_audio(text: str, language: str, output_file_path: str) -> None:
    """
    Synthesizes speech from the given text using the Gnani TTS API.

    Args:
        text (str): The text to be converted to speech.
        language (str): The language code for synthesis (e.g., 'en', 'hi').
        output_file_path (str): The path where the synthesized audio will be saved.
    """
    if not text or not text.strip():
        raise ValueError("Cannot synthesize audio: Provided text is empty or missing.")

    try:
        client = GnaniTTSStreamClient(api_key=API_KEY)

        with open(output_file_path, "wb") as f:
            for chunk in client.synthesize_stream(
                text,
                voice="Deepak",
                model="timbre-v2.5",
                language=language,
            ):
                f.write(chunk)

        print(f"Audio synthesized successfully to: {output_file_path}")

    except Exception as e:
        print(f"Error during synthesis: {e}")
        raise