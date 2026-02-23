from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from app import crud, models, schemas
from app.api import deps

router = APIRouter()


def _get_goal_period(goal_type: str, today: date) -> tuple[date, date]:
    """
    Return (period_start, period_end) for the active goal type.
      daily   → today only
      weekly  → Monday of current ISO week → Sunday of current ISO week
      monthly → 1st of current month → last day of current month
    """
    goal_type_val = goal_type.value if hasattr(goal_type, 'value') else goal_type

    if goal_type_val == 'weekly':
        # ISO weekday: Monday=1 … Sunday=7
        start = today - timedelta(days=today.weekday())   # Monday
        end = start + timedelta(days=6)                   # Sunday
        return start, end

    elif goal_type_val == 'monthly':
        start = today.replace(day=1)
        # Last day of the month
        if today.month == 12:
            end = today.replace(day=31)
        else:
            end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
        return start, end

    else:  # daily (default)
        return today, today


@router.get("/daily-summary")
def read_daily_summary(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    target_date: date = Query(default=date.today())
) -> Any:
    goal = crud.goal_get_active(db, user_id=current_user.id)

    # Determine the correct aggregation period
    period_start, period_end = _get_goal_period(
        goal.goal_type if goal else 'daily',
        target_date
    )

    # Aggregate actual intake across the period
    if period_start == period_end:
        # Optimised path for daily (single day query)
        summary = crud.report_get_daily_summary(db, user_id=current_user.id, target_date=period_start)
    else:
        summary = crud.report_get_period_summary(
            db, user_id=current_user.id,
            period_start=period_start,
            period_end=period_end
        )

    # Properly serialise the ORM goal through Pydantic
    goal_data = jsonable_encoder(schemas.HealthGoal.model_validate(goal)) if goal else None

    return {
        "actual": summary,
        "goal": goal_data,
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat(),
        "status": (
            "met" if goal and summary["calories"] <= goal.calorie_target
            else "over" if goal
            else "no_goal"
        )
    }


@router.get("/weekly-trend")
def read_weekly_trend(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    return crud.report_get_weekly_trend(db, user_id=current_user.id)


@router.get("/macros-breakdown")
def read_macros_breakdown(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
) -> Any:
    return crud.report_get_macros_breakdown(db, user_id=current_user.id, start_date=start_date, end_date=end_date)


@router.get("/micros-summary")
def read_micros_summary(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
) -> Any:
    return crud.report_get_micros_summary(db, user_id=current_user.id, start_date=start_date, end_date=end_date)
