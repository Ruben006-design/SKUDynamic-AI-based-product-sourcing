import json
import logging

from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMClient:
    """
    Gemini LLM client.

    Generates AI weights using Google Gemini.
    """

    MODEL_NAME = "gemini-2.5-flash"

    @staticmethod
    def generate_weights(prompt: str) -> dict:
        """
        Generate weight distribution using Gemini.
        """

        client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        full_prompt = f"""
You are an AI inventory optimization assistant.

Read the following prompt carefully.

Return ONLY valid JSON.

The JSON must contain exactly these fields:

{{
  "sales_volume_weight": float,
  "lead_time_weight": float,
  "supplier_quality_weight": float,
  "popularity_weight": float,
  "weather_weight": float,
  "festival_demand_weight": float,
  "durability_weight": float,
  "expiry_weight": float
}}

Rules:
- Every value must be between 0 and 1.
- The total must equal exactly 1.00.
- Do NOT return markdown.
- Do NOT wrap the JSON inside ``` blocks.
- Do NOT provide explanations.

Business Context:

{prompt}
"""

        try:
            response = client.models.generate_content(
                model=LLMClient.MODEL_NAME,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            print("\n========== GEMINI RAW RESPONSE ==========")
            print(response.text)
            print("=========================================\n")

            text = response.text.strip()

            logger.info(
                "Gemini response received successfully."
            )

            return json.loads(text)

        except Exception as ex:
            logger.exception(
                "Gemini weight generation failed."
            )
            raise RuntimeError(
                f"Gemini API Error: {ex}"
            )
