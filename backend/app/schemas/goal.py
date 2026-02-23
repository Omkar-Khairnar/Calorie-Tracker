from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from app.models.goal import GoalType

class HealthGoalBase(BaseModel):
    goal_type: GoalType = GoalType.DAILY
    calorie_target: int = Field(..., gt=0)
    protein_target_g: float = 0.0
    carb_target_g: float = 0.0
    fat_target_g: float = 0.0
    weight_target_kg: Optional[float] = None
    start_date: datetime
    end_date: datetime
    is_active: bool = True

class HealthGoalCreate(HealthGoalBase):
    end_date: Optional[datetime] = None

class HealthGoalUpdate(BaseModel):
    goal_type: Optional[GoalType] = None
    calorie_target: Optional[int] = Field(None, gt=0)
    protein_target_g: Optional[float] = None
    carb_target_g: Optional[float] = None
    fat_target_g: Optional[float] = None
    weight_target_kg: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class HealthGoal(HealthGoalBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True
