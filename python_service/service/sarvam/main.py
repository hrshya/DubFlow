import os
from pathlib import Path
from sarvamai import SarvamAI
from utils.lib import require

SARVAM_API_KEY = require("SARVAM_API_KEY")


def chunk_text(text: str, max_chars: int = 800) -> list[str]:
    """Splits text strictly by word boundaries so no chunk ever exceeds max_chars

    (designed for mayuri:v1 model's 1000 character limit).
    """
    words = text.split(" ")
    chunks = []
    current_chunk = []
    current_length = 0

    for word in words:
        word_len = len(word)
        added_len = word_len + (1 if current_chunk else 0)

        if current_length + added_len <= max_chars:
            current_chunk.append(word)
            current_length += added_len
        else:
            if current_chunk:
                chunks.append(" ".join(current_chunk))

            if word_len > max_chars:
                for i in range(0, word_len, max_chars):
                    chunks.append(word[i : i + max_chars])
                current_chunk = []
                current_length = 0
            else:
                current_chunk = [word]
                current_length = word_len

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def translate_text(
    input_text_path: str,
    source_language_code: str,
    target_language_code: str,
    output_dir: str,
    model: str = "mayura:v1",
) -> str:
    """Translates a .txt file safely using Sarvam AI, chunking text under 800 characters per request."""
    try:
        client = SarvamAI(api_subscription_key=SARVAM_API_KEY)

        # 1. Read input text file
        with open(input_text_path, "r", encoding="utf-8") as f:
            full_text = f.read()

        # 2. Split into strictly <800 character chunks for mayuri:v1
        chunks = chunk_text(full_text, max_chars=800)
        print(
            f"Total characters: {len(full_text)} | Split into {len(chunks)}"
            f" chunk(s) using model '{model}'."
        )

        # 3. Translate each chunk with individual chunk-level exception handling
        translated_chunks = []
        for i, chunk in enumerate(chunks, 1):
            if not chunk.strip():
                continue
            print(
                f"Translating chunk {i}/{len(chunks)} ({len(chunk)}"
                " characters)..."
            )

            try:
                res = client.text.translate(
                    input=chunk,
                    source_language_code=source_language_code,
                    target_language_code=target_language_code,
                    model=model,
                )
                translated_chunks.append(res.translated_text)
            except Exception as chunk_error:
                print(f"Error translating chunk {i}: {chunk_error}")
                raise chunk_error

        # 4. Ensure output directory exists and save file
        out_dir_path = Path(output_dir)
        out_dir_path.mkdir(parents=True, exist_ok=True)

        filename = Path(input_text_path).name
        output_path = out_dir_path / f"translated_{filename}"

        translated_text = " ".join(translated_chunks)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(translated_text)

        print(f"Saved translated text to: {output_path}")
        return str(output_path)

    except Exception as e:
        print(f"Error during translation process: {e}")
        raise
