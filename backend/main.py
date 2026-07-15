import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database.connection import engine, Base, SessionLocal
from backend.database.config import settings
from backend.utils.logger import setup_logger
from backend.models.user import User
from backend.models.domain import Domain
from backend.models.domain_head import DomainHead
from backend.models.complaint import Complaint
from backend.models.notification import Notification

logger = setup_logger(__name__)


def seed_admin_user():
    from backend.auth.hashing import hash_password

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not existing:
            admin = User(
                name=settings.ADMIN_NAME,
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                role="admin",
            )
            db.add(admin)
            db.commit()
            logger.info("Default admin user created: %s", settings.ADMIN_EMAIL)
        else:
            logger.info("Admin user already exists: %s", settings.ADMIN_EMAIL)
    except Exception as e:
        db.rollback()
        logger.error("Failed to seed admin user: %s", str(e))
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Complaint Priority Orchestration System...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified.")
    seed_admin_user()
    yield
    logger.info("Shutting down application...")


app = FastAPI(
    title="Complaint Priority Orchestration System",
    description="AI-powered complaint management with automatic priority assignment and domain routing.",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from backend.routes.auth import router as auth_router
from backend.routes.domain import router as domain_router
from backend.routes.admin import router as admin_router
from backend.routes.complaint import router as complaint_router
from backend.routes.notification import router as notification_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.domain_head import router as domain_head_router

app.include_router(auth_router)
app.include_router(domain_router)
app.include_router(admin_router)
app.include_router(complaint_router)
app.include_router(notification_router)
app.include_router(dashboard_router)
app.include_router(domain_head_router)
frontend_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend"
)
if os.path.isdir(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")
    logger.info("Frontend static files mounted at /static")


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "Complaint Priority Orchestration System"}
