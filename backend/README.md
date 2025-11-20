Backend FastAPI app
- Run:
    python -m venv venv
    source venv/bin/activate  # or .\venv\Scripts\activate on Windows
    pip install -r requirements.txt
    python -c "from app.db import init_db; init_db()"
    uvicorn app.main:app --reload --port 8000
