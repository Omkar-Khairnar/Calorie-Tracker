from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.post("/bulk-import")
def bulk_import_meals(
    *,
    db: Session = Depends(deps.get_db),
    meals: List[dict] = Body(...),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Accepts a list of parsed meal entries (from the PDF import flow) and inserts them all.
    Returns the count of meals imported.
    """
    count = crud.meal_bulk_create(db, meals_in=meals, user_id=current_user.id)
    return {"imported": count}
