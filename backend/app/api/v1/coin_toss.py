from fastapi import APIRouter, Depends, HTTPException, Header
import random
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.tables import Toss, User
from app.utils.auth import get_current_user_optional

router = APIRouter()

@router.get("/")
def toss_coin(db: Session = Depends(get_db), authorization: str | None = Header(default=None)):
    """Public toss endpoint. If Authorization header with Bearer token is present and valid, toss is saved with that user."""
    result = random.choice(["HEADS", "TAILS"])
    # try to resolve user if token present
    user = None
    if authorization:
        try:
            user = get_current_user_optional(authorization)
        except Exception:
            user = None
    # Save toss
    toss = Toss(result=result, user_id=user.id if user else None)
    db.add(toss)
    db.commit()
    db.refresh(toss)
    return {"result": result, "id": toss.id}
