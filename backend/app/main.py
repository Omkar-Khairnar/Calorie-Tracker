from datetime import datetime
from app.core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import meals, auth, goals, reports, ai, import_data, bulk
from app.db.base_class import Base
from app.db.session import engine

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_prefix = settings.API_STR

app.include_router(auth.router, prefix=f"{api_prefix}/auth", tags=["auth"])
app.include_router(goals.router, prefix=f"{api_prefix}/goals", tags=["goals"])
app.include_router(meals.router, prefix=f"{api_prefix}/meals", tags=["meals"])
app.include_router(bulk.router, prefix=f"{api_prefix}/meals", tags=["meals"])
app.include_router(reports.router, prefix=f"{api_prefix}/reports", tags=["reports"])
app.include_router(ai.router, prefix=f"{api_prefix}/ai", tags=["ai"])
app.include_router(import_data.router, prefix=f"{api_prefix}/import", tags=["import"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
