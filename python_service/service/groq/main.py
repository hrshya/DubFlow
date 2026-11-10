import os
import json
from typing import Any
from uuid import UUID

from groq import Groq
from utils.output_paths import get_job_output_dir


client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
GROQ_TRANSLATION_MODEL = os.getenv(
    "GROQ_TRANSLATION_MODEL",
    "openai/gpt-oss-120b",
)


def transcribe_with_groq(
    file_path: str,
    user_id: str | UUID,
    job_id: str | UUID,
):
    output_path = get_job_output_dir(user_id, job_id) / "groq_transcription.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "rb") as file:
        transcription = client.audio.transcriptions.create(
            file=(file.name, file.read()),
            model="whisper-large-v3-turbo",
            response_format="verbose_json",
            timestamp_granularities=["segment"]
        )

    segments = []
    for segment in transcription.segments:
        get_value = (
            segment.get
            if isinstance(segment, dict)
            else lambda key: getattr(segment, key)
        )
        segments.append(
            {
                "start": get_value("start"),
                "end": get_value("end"),
                "text": get_value("text").strip(),
            }
        )

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "text": transcription.text,
                "language": transcription.language,
                "segments": segments,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )

    return {
        "text": transcription.text,
        "language": transcription.language,
        "segments": segments
    }


def translate_segments_with_groq(
    segments: list[dict[str, Any]],
    source_language: str,
    target_language: str,
    user_id: str | UUID,
    job_id: str | UUID,
) -> list[dict[str, Any]]:
    if not segments:
        return []

    output_path = get_job_output_dir(str(user_id), str(job_id)) / "translated_segments.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Keep batches small enough to reduce the chance of truncated JSON output.
    BATCH_SIZE = 10
    translated_by_index: dict[int, str] = {}

    for batch_start in range(0, len(segments), BATCH_SIZE):
        batch_end = min(batch_start + BATCH_SIZE, len(segments))
        pending_global_indices = list(range(batch_start, batch_end))

        # Retry an incomplete batch once with only the missing segments.
        for attempt in range(2):
            batch_payload = [
                {"index": local_index, "text": segments[global_index]["text"]}
                for local_index, global_index in enumerate(pending_global_indices)
            ]
            response = client.chat.completions.create(
                model=GROQ_TRANSLATION_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Translate every provided transcript segment into the requested "
                            "target language. Each input index is local to this request. "
                            "Return valid JSON in this shape: "
                            '{"translations":[{"index":0,"text":"..."}]}. '
                            "Return exactly one non-empty translation per input index. "
                            "Do not omit, combine, reorder, or add segments."
                        ),
                    },
                    {
                        "role": "user",
                        "content": json.dumps(
                            {
                                "source_language": source_language,
                                "target_language": target_language,
                                "segments": batch_payload,
                            },
                            ensure_ascii=False,
                        ),
                    },
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
            )

            response_text = response.choices[0].message.content
            if not response_text:
                raise ValueError(
                    f"Groq returned an empty translation response for "
                    f"segments {pending_global_indices}"
                )

            try:
                response_data = json.loads(response_text)
            except json.JSONDecodeError as error:
                raise ValueError(
                    f"Groq returned invalid JSON for segments {pending_global_indices}"
                ) from error

            translations = response_data.get("translations")
            if not isinstance(translations, list):
                raise ValueError(
                    f"Groq response must contain a translations list for "
                    f"segments {pending_global_indices}"
                )

            local_indexes = {
                local_index: global_index
                for local_index, global_index in enumerate(pending_global_indices)
            }
            translated_local_indexes: set[int] = set()
            for translation in translations:
                index = (
                    translation.get("index")
                    if isinstance(translation, dict)
                    else None
                )
                text = (
                    translation.get("text")
                    if isinstance(translation, dict)
                    else None
                )
                if (
                    not isinstance(index, int)
                    or isinstance(index, bool)
                    or index not in local_indexes
                    or index in translated_local_indexes
                    or not isinstance(text, str)
                    or not text.strip()
                ):
                    raise ValueError(
                        f"Groq returned an invalid translation entry for "
                        f"segments {pending_global_indices}: {translation!r}"
                    )

                translated_local_indexes.add(index)
                translated_by_index[local_indexes[index]] = text.strip()

            missing_local_indexes = (
                set(local_indexes) - translated_local_indexes
            )
            pending_global_indices = [
                local_indexes[index]
                for index in sorted(missing_local_indexes)
            ]
            if not pending_global_indices:
                break

        if pending_global_indices:
            raise ValueError(
                "Groq did not translate transcript segment(s): "
                + ", ".join(str(index) for index in pending_global_indices)
            )

    translated_segments = [
        {
            **segment,
            "translation": translated_by_index[index],
        }
        for index, segment in enumerate(segments)
    ]

    with output_path.open("w", encoding="utf-8") as output_file:
        json.dump(translated_segments, output_file, ensure_ascii=False, indent=2)

    return translated_segments
