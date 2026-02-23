from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from app import models, schemas

def get_active(db: Session, user_id: UUID) -> Optional[models.HealthGoal]:
    return db.query(models.HealthGoal).filter(
        models.HealthGoal.user_id == user_id,
        models.HealthGoal.is_active == True
    ).first()

def get_history(db: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[models.HealthGoal]:
    return db.query(models.HealthGoal).filter(
        models.HealthGoal.user_id == user_id
    ).order_by(models.HealthGoal.start_date.desc()).offset(skip).limit(limit).all()

def count_history(db: Session, user_id: UUID) -> int:
    return db.query(models.HealthGoal).filter(
        models.HealthGoal.user_id == user_id
    ).count()

def create(db: Session, obj_in: schemas.HealthGoalCreate, user_id: UUID) -> models.HealthGoal:
    # Deactivate current active goal if any
    active_goal = get_active(db, user_id)
    if active_goal:
        active_goal.is_active = False
        db.add(active_goal)

    # Calculate end_date based on goal_type
    start_date = obj_in.start_date
    goal_type_val = obj_in.goal_type.value if hasattr(obj_in.goal_type, 'value') else obj_in.goal_type
    if goal_type_val == 'daily':
        end_date = start_date + timedelta(days=1)
    elif goal_type_val == 'weekly':
        end_date = start_date + timedelta(weeks=1)
    else:  # monthly
        end_date = start_date + timedelta(days=30)

    db_obj = models.HealthGoal(
        **obj_in.model_dump(exclude={"end_date"}),
        end_date=end_date,
        user_id=user_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def deactivate(db: Session, goal_id: UUID, user_id: UUID) -> Optional[models.HealthGoal]:
    goal = db.query(models.HealthGoal).filter(
        models.HealthGoal.id == goal_id,
        models.HealthGoal.user_id == user_id
    ).first()
    if goal:
        goal.is_active = False
        db.add(goal)
        db.commit()
        db.refresh(goal)
    return goal
