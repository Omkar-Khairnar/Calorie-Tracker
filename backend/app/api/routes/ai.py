from typing import Any, List, Dict
from fastapi import APIRouter, Depends, UploadFile, File, Body, HTTPException
from app import models, schemas
from app.api import deps
from app.services import ai_service

router = APIRouter()

@router.post("/extract-photo", response_model=List[schemas.meal.FoodItemCreate])
async def extract_photo(
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Upload a food photo to extract estimated nutrition data.
    """
    contents = await file.read()
    extraction = ai_service.extract_nutrition_from_photo(contents)
    return extraction

@router.post("/parse-pdf-diary")
async def parse_pdf_diary(
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Upload a food diary PDF. Extracts text via pdfplumber and parses entries with Gemini.
    Returns a list of structured meal entries for the user to review before importing.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF.")
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=400, detail="PDF file too large (max 10 MB).")
    entries = ai_service.parse_pdf_food_diary(contents)
    if not entries:
        raise HTTPException(status_code=422, detail="Could not extract any meal entries from the PDF. Make sure it contains a food diary in tabular or text format.")
    return entries

@router.post("/chat")
def ai_chat(
    query: str = Body(..., embed=True),
    history: List[Dict[str, str]] = Body(default=[]),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Conversational interface for nutrition advice.
    """
    response = ai_service.chat_with_nutritionist(query, history)
    return {"response": response}

@router.post("/chat-stream")
async def ai_chat_stream(
    query: str = Body(..., embed=True),
    history: List[Dict[str, str]] = Body(default=[]),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Streaming conversational interface for nutrition advice.
    """
    from fastapi.responses import StreamingResponse
    import json

    def generate_events():
        for chunk in ai_service.chat_with_nutritionist_stream(query, history):
            # SSE format: data: <payload>\n\n
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"

    return StreamingResponse(generate_events(), media_type="text/event-stream")
