from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded from the .env file.
    All non-database fields have safe, local-first defaults so the application
    starts cleanly even without external API credentials.
    """

    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "ai_product_reordering"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""

    APP_NAME: str = "AI-Based Product Reordering System"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # External LLM configuration (Optional; defaults to 100% local deterministic engine)
    GEMINI_API_KEY: str = ""
    LLM_PROVIDER: str = "local"

    # Procurement authorization
    PROCUREMENT_API_KEY: str = "sk-procurement-dev-key"
    REQUIRE_AUTH: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
