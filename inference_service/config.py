import os
try:
    from pydantic_settings import BaseSettings
    # from pydantic_core import BaseSettings
except ImportError:
    try:
        from pydantic.v1 import BaseSettings
    except ImportError:
        from pydantic import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Inference Service"
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./models")
    PROMPT_FORMAT: str = os.getenv("PROMPT_FORMAT", "chatml")

    class Config:
        env_file = ".env"

settings = Settings()
