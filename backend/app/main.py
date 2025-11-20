from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.coin_toss import router as toss_router
from app.api.v1.auth import router as auth_router
from app.api.v1.history import router as history_router
from app.db import init_db

app = FastAPI(title="Coin Toss API")
# init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(toss_router, prefix="/api/v1/toss", tags=["toss"])
app.include_router(history_router, prefix="/api/v1/history", tags=["history"])

@app.on_event("startup")
def on_startup():
    init_db()
