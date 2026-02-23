from datetime import datetime, timedelta, date
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from uuid import UUID
from app import models, schemas

def get_daily_summary(db: Session, user_id: UUID, target_date: date) -> Dict[str, Any]:
    # Get all food items for the day via join
    day_start = datetime.combine(target_date, datetime.min.time())
    day_end = datetime.combine(target_date, datetime.max.time())

    items = db.query(
        func.sum(models.FoodItem.calories).label("calories"),
        func.sum(models.FoodItem.protein).label("protein"),
        func.sum(models.FoodItem.carbs).label("carbs"),
        func.sum(models.FoodItem.fat).label("fat")
    ).join(
        models.MealLog, models.FoodItem.meal_log_id == models.MealLog.id
    ).filter(
        models.MealLog.user_id == user_id,
        models.MealLog.consumed_at >= day_start,
        models.MealLog.consumed_at <= day_end
    ).first()

    return {
        "calories": items.calories or 0,
        "protein": items.protein or 0,
        "carbs": items.carbs or 0,
        "fat": items.fat or 0
    }

def get_period_summary(db: Session, user_id: UUID, period_start: date, period_end: date) -> Dict[str, Any]:
    """Aggregate nutrition data across an arbitrary date range (inclusive)."""
    start_dt = datetime.combine(period_start, datetime.min.time())
    end_dt = datetime.combine(period_end, datetime.max.time())

    items = db.query(
        func.sum(models.FoodItem.calories).label("calories"),
        func.sum(models.FoodItem.protein).label("protein"),
        func.sum(models.FoodItem.carbs).label("carbs"),
        func.sum(models.FoodItem.fat).label("fat")
    ).join(
        models.MealLog, models.FoodItem.meal_log_id == models.MealLog.id
    ).filter(
        models.MealLog.user_id == user_id,
        models.MealLog.consumed_at >= start_dt,
        models.MealLog.consumed_at <= end_dt
    ).first()

    return {
        "calories": items.calories or 0,
        "protein": items.protein or 0,
        "carbs": items.carbs or 0,
        "fat": items.fat or 0
    }

def get_weekly_trend(db: Session, user_id: UUID) -> List[Dict[str, Any]]:
    today = date.today()
    last_7_days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
    
    trend = []
    for day in last_7_days:
        summary = get_daily_summary(db, user_id, day)
        trend.append({
            "date": day.isoformat(),
            **summary
        })
    return trend

def get_macros_breakdown(db: Session, user_id: UUID, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    items = db.query(
        func.sum(models.FoodItem.protein).label("protein"),
        func.sum(models.FoodItem.carbs).label("carbs"),
        func.sum(models.FoodItem.fat).label("fat")
    ).join(
        models.MealLog, models.FoodItem.meal_log_id == models.MealLog.id
    ).filter(
        models.MealLog.user_id == user_id,
        models.MealLog.consumed_at >= start_date,
        models.MealLog.consumed_at <= end_date
    ).first()

    p = items.protein or 0
    c = items.carbs or 0
    f = items.fat or 0
    total = p + c + f

    if total == 0:
        return {"protein_pct": 0, "carbs_pct": 0, "fat_pct": 0}

    return {
        "protein_pct": round((p / total) * 100, 2),
        "carbs_pct": round((c / total) * 100, 2),
        "fat_pct": round((f / total) * 100, 2),
        "total_grams": total
    }

def get_micros_summary(db: Session, user_id: UUID, start_date: datetime, end_date: datetime) -> Dict[str, float]:
    # Micros are stored in JSONB. We need to fetch and aggregate in Python or 
    # use Postgres JSONB aggregation if performance is critical.
    # For now, simple Python aggregation.
    
    logs = db.query(models.FoodItem).join(
        models.MealLog, models.FoodItem.meal_log_id == models.MealLog.id
    ).filter(
        models.MealLog.user_id == user_id,
        models.MealLog.consumed_at >= start_date,
        models.MealLog.consumed_at <= end_date
    ).all()
    
    micros_total = {}
    for item in logs:
        if item.micros:
            for key, val in item.micros.items():
                # Convert to float if possible
                try:
                    if isinstance(val, (int, float)):
                        num_val = float(val)
                    elif isinstance(val, str):
                        # Strip non-numeric chars for common units like 'mg', 'g', 'mcg'
                        import re
                        match = re.search(r"(\d+\.?\d*)", val)
                        num_val = float(match.group(1)) if match else 0.0
                    else:
                        num_val = 0.0
                    
                    micros_total[key] = micros_total.get(key, 0.0) + num_val
                except (ValueError, TypeError):
                    continue
                    
    return micros_total
