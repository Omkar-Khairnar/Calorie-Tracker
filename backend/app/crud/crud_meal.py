from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from app import models, schemas

def create_with_items(db: Session, obj_in: schemas.MealLogCreate, user_id: UUID) -> models.MealLog:
    db_obj = models.MealLog(
        meal_type=obj_in.meal_type,
        consumed_at=obj_in.consumed_at or datetime.utcnow(),
        user_id=user_id
    )
    db.add(db_obj)
    db.flush() # Get ID for items

    for item_in in obj_in.items:
        db_item = models.FoodItem(
            **item_in.model_dump(),
            meal_log_id=db_obj.id
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_obj)
    return db_obj

def bulk_create(db: Session, meals_in: list, user_id: UUID) -> int:
    """Creates multiple meal logs in a single transaction. Returns count of created meals."""
    created = 0
    for obj_in in meals_in:
        meal_type = obj_in.get("meal_type", "Other")
        consumed_at_raw = obj_in.get("consumed_at")
        try:
            from dateutil.parser import parse as parse_dt
            consumed_at = parse_dt(consumed_at_raw) if consumed_at_raw else datetime.utcnow()
        except Exception:
            consumed_at = datetime.utcnow()

        db_obj = models.MealLog(
            meal_type=meal_type,
            consumed_at=consumed_at,
            user_id=user_id
        )
        db.add(db_obj)
        db.flush()

        for item_in in obj_in.get("items", []):
            db_item = models.FoodItem(
                name=item_in.get("name", "Unknown"),
                quantity=float(item_in.get("quantity", 1)),
                unit=item_in.get("unit", "serving"),
                calories=float(item_in.get("calories", 0)),
                protein=float(item_in.get("protein", 0)),
                carbs=float(item_in.get("carbs", 0)),
                fat=float(item_in.get("fat", 0)),
                meal_log_id=db_obj.id
            )
            db.add(db_item)
        created += 1

    db.commit()
    return created


def get_multi_by_user(
    db: Session, 
    user_id: UUID, 
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None,
    meal_type: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[models.MealLog]:
    query = db.query(models.MealLog).filter(models.MealLog.user_id == user_id)
    if start_date:
        query = query.filter(models.MealLog.consumed_at >= start_date)
    if end_date:
        query = query.filter(models.MealLog.consumed_at <= end_date)
    if meal_type:
        query = query.filter(models.MealLog.meal_type == meal_type)
    return query.order_by(models.MealLog.consumed_at.desc()).offset(skip).limit(limit).all()

def count_by_user(
    db: Session,
    user_id: UUID,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    meal_type: Optional[str] = None,
) -> int:
    query = db.query(models.MealLog).filter(models.MealLog.user_id == user_id)
    if start_date:
        query = query.filter(models.MealLog.consumed_at >= start_date)
    if end_date:
        query = query.filter(models.MealLog.consumed_at <= end_date)
    if meal_type:
        query = query.filter(models.MealLog.meal_type == meal_type)
    return query.count()

def get(db: Session, id: UUID, user_id: UUID) -> Optional[models.MealLog]:
    return db.query(models.MealLog).filter(
        models.MealLog.id == id, 
        models.MealLog.user_id == user_id
    ).first()

def remove(db: Session, id: UUID, user_id: UUID) -> Optional[models.MealLog]:
    obj = get(db, id, user_id)
    if obj:
        db.delete(obj)
        db.commit()
    return obj

def update(db: Session, db_obj: models.MealLog, obj_in: schemas.MealLogUpdate) -> models.MealLog:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
