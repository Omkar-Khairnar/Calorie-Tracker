from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.MealLog)
def create_meal(
    *,
    db: Session = Depends(deps.get_db),
    meal_in: schemas.MealLogCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    return crud.meal_create(db, obj_in=meal_in, user_id=current_user.id)

@router.get("/", response_model=schemas.Page[schemas.MealLog])
def read_meals(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    meal_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=100),
) -> Any:
    items = crud.meal_get_multi(
        db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        meal_type=meal_type,
        skip=skip,
        limit=limit
    )
    total = crud.meal_count(
        db,
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        meal_type=meal_type,
    )
    return {"items": items, "total": total, "skip": skip, "limit": limit}

@router.get("/{id}", response_model=schemas.MealLog)
def read_meal(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    meal = crud.meal_get(db, id=id, user_id=current_user.id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal

@router.put("/{id}", response_model=schemas.MealLog)
def update_meal(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    meal_in: schemas.MealLogUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    meal = crud.meal_get(db, id=id, user_id=current_user.id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return crud.meal_update(db, db_obj=meal, obj_in=meal_in)

@router.delete("/{id}", response_model=schemas.MealLog)
def delete_meal(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    meal = crud.meal_remove(db, id=id, user_id=current_user.id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal
