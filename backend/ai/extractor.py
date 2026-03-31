import base64
import json
import os
import re
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

PROMPT = """You are a receipt data extractor. Analyze this receipt image and extract the following information. Respond ONLY with a valid JSON object, no other text.

Required JSON format:
{
  "vendor": "store/restaurant name or null",
  "date": "YYYY-MM-DD or null",
  "amount": 12.34,
  "currency": "USD",
  "category": "one of: Meals & Entertainment, Transportation, Lodging, Supplies & Materials, Registration & Fees, Other",
  "description": "brief description of purchase or null"
}"""


async def extract_receipt_data(image_bytes: bytes) -> dict:
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    payload = {
        "model": "llava",
        "prompt": PROMPT,
        "images": [image_b64],
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            response.raise_for_status()
            data = response.json()
            raw_text = data.get("response", "")

        # Try to extract JSON from the response
        json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if json_match:
            extracted = json.loads(json_match.group())
            return {
                "vendor": extracted.get("vendor"),
                "date": extracted.get("date"),
                "amount": extracted.get("amount"),
                "currency": extracted.get("currency", "USD"),
                "category": extracted.get("category"),
                "description": extracted.get("description"),
                "raw_response": raw_text,
            }
        else:
            return _empty_result(raw_text)
    except Exception as exc:
        return _empty_result(str(exc))


def _empty_result(raw_response: str = "") -> dict:
    return {
        "vendor": None,
        "date": None,
        "amount": None,
        "currency": "USD",
        "category": None,
        "description": None,
        "raw_response": raw_response,
    }
