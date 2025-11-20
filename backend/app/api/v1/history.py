from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.tables import Toss
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    tosses = (
        db.query(Toss)
        .filter(Toss.user_id == current_user.id)
        .order_by(Toss.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": t.id,
            "result": t.result,
            "user_id": t.user_id,
            "created_at": t.created_at.isoformat()
        }
        for t in tosses
    ]
