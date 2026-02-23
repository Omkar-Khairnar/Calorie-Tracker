from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

# Food Item Schemas
class FoodItemBase(BaseModel):
    name: str
    quantity: float
    unit: str
    calories: float
    protein: float = 0.0
    carbs: float = 0.0
    fat: float = 0.0
    micros: dict = {}

class FoodItemCreate(FoodItemBase):
    pass

class FoodItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    micros: Optional[dict] = None

class FoodItem(FoodItemBase):
    id: UUID
    meal_log_id: UUID

    class Config:
        from_attributes = True

# Meal Log Schemas
class MealLogBase(BaseModel):
    meal_type: str
    consumed_at: Optional[datetime] = None

class MealLogCreate(MealLogBase):
    items: List[FoodItemCreate]

class MealLogUpdate(BaseModel):
    meal_type: Optional[str] = None
    consumed_at: Optional[datetime] = None

class MealLog(MealLogBase):
    id: UUID
    user_id: UUID
    consumed_at: datetime
    items: List[FoodItem] = []

    class Config:
        from_attributes = True
