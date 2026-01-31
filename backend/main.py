"""
Fulcrum.ai Backend - FastAPI Application

Match SF citizens with civic events based on their interests and profile.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from .routers import onboard, profile, dashboard, hyperspell, admin

app = FastAPI(
    title="Fulcrum.ai",
    description="Match SF citizens with civic events that matter to them",
    version="0.1.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(onboard.router, tags=["Onboarding"])
app.include_router(profile.router, tags=["Profile"])
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(hyperspell.router, tags=["Hyperspell"])
app.include_router(admin.router)


@app.get("/")
async def root():
    return {
        "name": "Fulcrum.ai",
        "version": "0.1.0",
        "description": "Civic engagement API for SF citizens",
        "endpoints": {
            "POST /onboard": "Enrich user profile from email/LinkedIn",
            "POST /confirm-profile": "Save confirmed user profile",
            "GET /dashboard/{email}": "Get personalized civic events",
            "POST /admin/refresh-events": "Fetch latest civic data from Legistar",
            "GET /admin/events-stats": "Get civic events statistics"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
