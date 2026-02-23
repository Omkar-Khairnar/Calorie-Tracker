from typing import Any, List
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.services import pdf_service

router = APIRouter()

@router.post("/pdf", response_model=List[schemas.MealLog])
async def import_pdf_history(
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Bulk import nutrition history from a PDF file.
    """
    contents = await file.read()
    raw_meals = pdf_service.extract_meals_from_pdf(contents)
    
    created_meals = []
    for meal_data in raw_meals:
        # Convert to schema and save
        try:
            meal_in = schemas.MealLogCreate(**meal_data)
            db_meal = crud.meal_create(db, obj_in=meal_in, user_id=current_user.id)
            created_meals.append(db_meal)
        except Exception:
            continue
            
    return created_meals
