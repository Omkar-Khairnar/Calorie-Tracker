from typing import Optional
from sqlalchemy.orm import Session
from app import models, schemas
from app.utils.security import get_password_hash, verify_password

def get_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def create(db: Session, obj_in: schemas.UserCreate) -> models.User:
    db_obj = models.User(
        email=obj_in.email,
        password_hash=get_password_hash(obj_in.password),
        timezone=obj_in.timezone,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def authenticate(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
