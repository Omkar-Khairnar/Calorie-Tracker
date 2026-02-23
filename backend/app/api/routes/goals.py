from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/active", response_model=schemas.HealthGoal)
def read_active_goal(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    goal = crud.goal_get_active(db, user_id=current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="No active goal found")
    return goal

@router.get("/history", response_model=schemas.Page[schemas.HealthGoal])
def read_goal_history(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
) -> Any:
    items = crud.goal_get_history(db, user_id=current_user.id, skip=skip, limit=limit)
    total = crud.goal_count_history(db, user_id=current_user.id)
    return {"items": items, "total": total, "skip": skip, "limit": limit}

@router.post("/", response_model=schemas.HealthGoal)
def create_goal(
    *,
    db: Session = Depends(deps.get_db),
    goal_in: schemas.HealthGoalCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    return crud.goal_create(db, obj_in=goal_in, user_id=current_user.id)

@router.patch("/{id}/deactivate", response_model=schemas.HealthGoal)
def deactivate_goal(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    goal = crud.goal_deactivate(db, goal_id=id, user_id=current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal
