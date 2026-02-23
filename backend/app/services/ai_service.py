import google.generativeai as genai
import json
from typing import List, Dict, Any, Optional
from PIL import Image
import io
from app.core.config import settings

def configure_gemini():
    """
    Lazily configures Gemini with the API key from settings.
    """
    key = settings.GOOGLE_API_KEY
    if not key:
        print("WARNING: GOOGLE_API_KEY is not set in environment or settings.")
        return False
    
    try:
        genai.configure(api_key=key)
        return True
    except Exception as e:
        print(f"ERROR: Failed to configure Gemini: {e}")
        return False

def extract_nutrition_from_photo(image_data: bytes) -> List[Dict[str, Any]]:
    """
    Uses Gemini Vision to extract food items and their estimated calories/macros.
    """
    if not configure_gemini():
        # Fallback/Mock for testing if no key provided
        print("DEBUG: Using mock fallback for nutrition extraction (No API Key)")
        return [{"name": "Detected Food (Mock)", "quantity": 1, "unit": "serving", "calories": 500, "protein": 20, "carbs": 50, "fat": 20}]

    import google.generativeai as genai

    model = genai.GenerativeModel('gemini-flash-latest')
    
    prompt = """
    Analyze this food image and extract a list of food items.
    For each item, provide:
    - name
    - quantity
    - unit
    - estimated calories
    - estimated protein (g)
    - estimated carbs (g)
    - estimated fat (g)
    
    Return the result strictly as a JSON array of objects.
    Example: [{"name": "Apple", "quantity": 1, "unit": "large", "calories": 95, "protein": 0.5, "carbs": 25, "fat": 0.3}]
    """
    
    image = Image.open(io.BytesIO(image_data))
    response = model.generate_content([prompt, image])
    
    try:
        # Extract JSON from markdown response if needed
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        return json.loads(text)
    except Exception:
        return []

def chat_with_nutritionist(query: str, history: List[Dict[str, str]] = []) -> str:
    """
    Conversational AI for nutrition advice and calorie queries.
    """
    if not configure_gemini():
        return "AI features are currently unavailable. Please check your GOOGLE_API_KEY in the backend .env file."

    import google.generativeai as genai

    model = genai.GenerativeModel('gemini-flash-latest')
    chat = model.start_chat(history=history)
    response = chat.send_message(query)
    return response.text

def chat_with_nutritionist_stream(query: str, history: List[Dict[str, str]] = []):
    """
    Streaming version of conversational AI for nutrition advice.
    """
    if not configure_gemini():
        yield "AI features are currently unavailable. Please check your GOOGLE_API_KEY in the backend .env file."
        return

    import google.generativeai as genai

    model = genai.GenerativeModel('gemini-flash-latest')
    chat = model.start_chat(history=history)
    response = chat.send_message(query, stream=True)
    
    for chunk in response:
        if chunk.text:
            yield chunk.text

def parse_pdf_food_diary(pdf_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Accepts a PDF food diary as bytes, extracts text using pdfplumber,
    then asks Gemini to parse it into a structured list of MealLog entries.

    Returns a list of dicts compatible with MealLogCreate:
    [{ "meal_type": "Breakfast", "consumed_at": "2024-01-15T08:00:00", "items": [...] }]
    """
    import pdfplumber

    # ── 1. Extract all text + table content from every page ──────────────
    extracted_parts: List[str] = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            # Try to get tables (most nutrition exports are tabular)
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    for row in table:
                        if row:
                            extracted_parts.append("\t".join(
                                cell.strip() if cell else "" for cell in row
                            ))
            else:
                # Fallback to raw text
                text = page.extract_text()
                if text:
                    extracted_parts.append(text)

    full_text = "\n".join(extracted_parts).strip()
    if not full_text:
        return []

    # ── 2. Send to Gemini for structured parsing ─────────────────────────
    if not configure_gemini():
        return []

    import google.generativeai as genai

    model = genai.GenerativeModel('gemini-flash-latest')

    prompt = f"""
You are a nutrition data parser. The following text was extracted from a food diary or nutrition history PDF.

Parse ALL meal entries you can find and return them as a JSON array. Each entry must follow this exact schema:
{{
  "meal_type": "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Other",
  "consumed_at": "<ISO-8601 datetime, e.g. 2024-01-15T08:00:00>",
  "items": [
    {{
      "name": "<food name>",
      "quantity": <number>,
      "unit": "<g | ml | oz | cup | serving | piece | etc>",
      "calories": <number>,
      "protein": <number or 0>,
      "carbs": <number or 0>,
      "fat": <number or 0>
    }}
  ]
}}

Rules:
- If a date is missing, use today's date: {__import__('datetime').date.today().isoformat()}
- If a time is missing, use 08:00:00 for Breakfast, 12:00:00 for Lunch, 19:00:00 for Dinner, 15:00:00 for Snack
- If meal type is ambiguous, infer from time or use "Other"
- Calorie values must be positive numbers
- Do NOT include markdown fences — return ONLY the raw JSON array

Extracted text:
\"\"\"
{full_text[:12000]}
\"\"\"
"""

    response = model.generate_content(prompt)

    try:
        text = response.text.strip()
        # Strip markdown fences if Gemini adds them anyway
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip().rstrip("```")
        parsed = json.loads(text)
        # Validate basic structure
        if not isinstance(parsed, list):
            return []
        return parsed
    except Exception as e:
        print(f"ERROR: Failed to parse Gemini PDF response: {e}\nRaw: {response.text[:500]}")
        return []
