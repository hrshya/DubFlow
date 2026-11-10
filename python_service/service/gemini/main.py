import json
from typing import TypedDict
from uuid import UUID

from google import genai
from google.genai import types

from utils.lib import require
from utils.output_paths import get_job_output_dir

GEMINI_API_KEY = require("GEMINI_API_KEY")

SUPPORTED_LANGUAGES = {
    "auto": {
        "name": "Auto-detect",
        "cps": 14.5,
        "instructions": "Detect original script language and match target pacing accordingly."
    },
    "hi-IN": {
        "name": "Hindi",
        "cps": 15.0,
        "instructions": "Use clear Devanagari Hindi (Standard conversational tone)."
    },
    "en-IN": {
        "name": "Indian English",
        "cps": 14.0,
        "instructions": "Use natural Indian English phrasing."
    },
    "ta-IN": {
        "name": "Tamil",
        "cps": 15.5,
        "instructions": "Use natural conversational Tamil in Tamil script."
    },
    "te-IN": {
        "name": "Telugu",
        "cps": 15.5,
        "instructions": "Use natural conversational Telugu in Telugu script."
    },
    "kn-IN": {
        "name": "Kannada",
        "cps": 15.0,
        "instructions": "Use natural conversational Kannada in Kannada script."
    },
    "ml-IN": {
        "name": "Malayalam",
        "cps": 14.0,
        "instructions": "Use standard Malayalam in Malayalam script."
    },
    "mr-IN": {
        "name": "Marathi",
        "cps": 14.5,
        "instructions": "Use conversational Marathi in Devanagari script."
    },
    "pa-IN": {
        "name": "Punjabi",
        "cps": 14.5,
        "instructions": "Use standard Punjabi in Gurmukhi script."
    },
    "bn-IN": {
        "name": "Bengali",
        "cps": 14.0,
        "instructions": "Use natural Bengali in Bengali script."
    },
    "gu-IN": {
        "name": "Gujarati",
        "cps": 14.5,
        "instructions": "Use standard Gujarati in Gujarati script."
    },
    "hi-en": {
        "name": "Hinglish (Code-Mixed Hindi-English)",
        "cps": 15.5,
        "instructions": "Use Roman script mixing Hindi speech with common English nouns/verbs (e.g., 'Aaj ke video mein hum lip sync tool build karenge')."
    }
}


client = genai.Client(api_key=GEMINI_API_KEY)


class TranscriptSegment(TypedDict):
    text: str
    start_time: float
    end_time: float
    translation: str


def localize_and_condense_segments(
    segments: list[TranscriptSegment],
    lang_code: str,
    user_id: str | UUID,
    job_id: str | UUID,
) -> list[dict]:
    """Localizes multiple transcript segments in one Gemini request."""
    if not segments:
        return []

    lang_info = SUPPORTED_LANGUAGES.get(lang_code, SUPPORTED_LANGUAGES["hi-IN"])
    segment_data = []
    for index, segment in enumerate(segments):
        duration = max(segment["end_time"] - segment["start_time"], 0.5)
        char_budget = int(duration * lang_info["cps"])
        segment_data.append(
            {
                "index": index,
                "text": segment["translation"],
                "duration_sec": round(duration, 2),
                "max_characters": char_budget,
            }
        )

    system_instruction = f"""
    You are an expert film dubbing localization engineer for Indian languages.
    Target Language: {lang_info['name']}
    Formatting & Tone Rule: {lang_info['instructions']}

    Each input text is already translated into the target language. Adapt that
    draft to natural dubbing language and condense it to no more than that
    segment's max_characters. Do not translate it into a different language.
    Preserve the original meaning, emotion, and tone.
    Return one translation for every input index, in this exact JSON format:
    {{"translations": [{{"index": 0, "text": "..."}}]}}
    Output valid JSON only, with no markdown or additional properties.
    """

    user_prompt = json.dumps({"segments": segment_data}, ensure_ascii=False)
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.1,
            response_mime_type="application/json",
        )
    )

    if not response.text:
        raise ValueError("Gemini returned an empty batch translation response")

    response_data = json.loads(response.text)
    translations = (
        response_data.get("translations")
        if isinstance(response_data, dict)
        else None
    )
    if not isinstance(translations, list):
        raise ValueError("Gemini response must contain a translations list")

    translated_by_index = {}
    for translation in translations:
        if not isinstance(translation, dict):
            raise ValueError("Each Gemini translation must be an object")
        index = translation.get("index")
        translated_text = translation.get("text")
        if (
            not isinstance(index, int)
            or isinstance(index, bool)
            or not isinstance(translated_text, str)
        ):
            raise ValueError("Each Gemini translation must have an integer index and text")
        if index in translated_by_index or index < 0 or index >= len(segments):
            raise ValueError(f"Gemini returned an invalid or duplicate segment index: {index}")
        translated_by_index[index] = translated_text.strip().strip('"')

    if set(translated_by_index) != set(range(len(segments))):
        raise ValueError("Gemini did not return a translation for every segment")

    results = []
    for index, segment in enumerate(segments):
        duration = max(segment["end_time"] - segment["start_time"], 0.5)
        char_budget = int(duration * lang_info["cps"])
        translated_text = translated_by_index[index]
        results.append({
            "original_text": segment["text"],
            "start_time": segment["start_time"],
            "end_time": segment["end_time"],
            "translated_text": translated_text,
            "duration_sec": round(duration, 2),
            "char_budget": char_budget,
            "actual_char_count": len(translated_text),
            "lang_code": lang_code,
            "fits_budget": len(translated_text) <= char_budget
        })

    output_dir = get_job_output_dir(user_id, job_id)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "localized_segments.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    return results


def localize_and_condense_segment(
    text: str,
    start_time: float,
    end_time: float,
    lang_code: str,
    user_id: str | UUID,
    job_id: str | UUID,
) -> dict:
    """Localizes one segment; use localize_and_condense_segments for batch processing."""
    return localize_and_condense_segments(
        [{
            "text": text,
            "translation": text,
            "start_time": start_time,
            "end_time": end_time,
        }],
        lang_code,
        user_id,
        job_id,
    )[0]
