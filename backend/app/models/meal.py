from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.base_class import Base

# 3. Meal Logs (The "Container")
class MealLog(Base):
    __tablename__ = 'meal_logs'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    meal_type = Column(String, nullable=False) # Breakfast, Lunch, etc.
    consumed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", back_populates="meal_logs")
    items = relationship("FoodItem", back_populates="meal_log", cascade="all, delete-orphan")

# 4. Food Items (The "Details")
class FoodItem(Base):
    __tablename__ = 'food_items'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meal_log_id = Column(UUID(as_uuid=True), ForeignKey('meal_logs.id', ondelete='CASCADE'), nullable=False)
    
    name = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    
    # Macronutrients
    calories = Column(Float, nullable=False)
    protein = Column(Float, default=0.0)
    carbs = Column(Float, default=0.0)
    fat = Column(Float, default=0.0)
    
    # Micronutrients (The AI/Flexibility Edge Case)
    micros = Column(JSONB, default={}) 

    meal_log = relationship("MealLog", back_populates="items")
