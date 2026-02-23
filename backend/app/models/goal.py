from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey, Enum, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
import uuid
from app.db.base_class import Base

# Enum for Goal Types
class GoalType(enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class HealthGoal(Base):
    __tablename__ = 'health_goals'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    goal_type = Column(Enum(GoalType), default=GoalType.DAILY, nullable=False)
    
    # Nutritional Targets
    calorie_target = Column(Integer, nullable=False)
    protein_target_g = Column(Float, default=0.0)
    carb_target_g = Column(Float, default=0.0)
    fat_target_g = Column(Float, default=0.0)
    weight_target_kg = Column(Float, nullable=True)
    
    # Date Range Constraints
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="goals")

    __table_args__ = (
        CheckConstraint('calorie_target > 0', name='check_positive_calories'),
        CheckConstraint('end_date > start_date', name='check_valid_range'),
    )
