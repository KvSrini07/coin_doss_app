from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.db import get_db
from app.models.tables import User
from app.utils.auth import create_access_token

router = APIRouter()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")  # bcrypt fixed

class RegisterIn(BaseModel):
    username: str
    password: str

class LoginIn(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    # hashed = pwd_context.hash(data.password)
    hashed = pwd_context.hash(data.password[:72])
    user = User(username=data.username, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username}

@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}
