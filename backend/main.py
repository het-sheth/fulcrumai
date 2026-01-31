"""
Fulcrum.ai Backend - FastAPI Application

Match SF citizens with civic events based on their interests and profile.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from routers import onboard, profile, dashboard, hyperspell, admin

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
        "version": "0.2.0",
        "description": "Civic engagement API for SF citizens - Match users with relevant legislation",
        "endpoints": {
            "POST /onboard": "Enrich user profile from email/LinkedIn and save to database",
            "POST /enrich": "Alias for /onboard",
            "GET /user/{email}": "Get user profile with inferred data",
            "POST /confirm-profile": "Update user profile with confirmed data",
            "GET /dashboard/{email}": "Get personalized civic events matched to user interests",
            "POST /admin/refresh-events": "Fetch latest civic data from Legistar",
            "GET /admin/events-stats": "Get civic events statistics"
        },
        "usage": {
            "step1": "POST /onboard with {email, linkedin_url} - Creates user with Nyne enrichment",
            "step2": "POST /confirm-profile with {email, zip_code, has_car, has_kids} - Updates user preferences",
            "step3": "GET /dashboard/{email} - Returns matched civic events"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
