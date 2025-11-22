from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "your-secret-key"  # Change this in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Add type annotation (required)
    # DATABASE_URL: str = "mysql+pymysql://root:Srini%4036%2327%2Ak@localhost:3306/coin_db"
    DATABASE_URL: str = "mysql+pymysql://root:Srini%4036%2327%2Ak@mysql.railway.internal:3306/railway"
    


    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }

settings = Settings()
