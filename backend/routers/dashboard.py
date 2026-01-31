"""
GET /dashboard/{email} - Get personalized civic events for user
"""
from fastapi import APIRouter, HTTPException
from ..models import DashboardResponse, UserProfile, CivicEvent
from ..services.supabase_client import get_user_by_email, get_events_by_tags, get_all_events

router = APIRouter()


@router.get("/dashboard/{email}", response_model=DashboardResponse)
async def get_dashboard(email: str):
    """
    Fetch user profile and matching civic events.

    Events are matched based on overlap between user interests
    and event impact_tags, then sorted by urgency.
    """
    try:
        # Fetch user
        user_data = await get_user_by_email(email)

        if not user_data:
            raise HTTPException(status_code=404, detail=f"User not found: {email}")

        user = UserProfile(
            id=user_data.get("id", ""),
            email=user_data.get("email", ""),
            zip_code=user_data.get("zip_code"),
            has_car=user_data.get("has_car"),
            has_kids=user_data.get("has_kids"),
            profession=user_data.get("profession"),
            interests=user_data.get("interests", [])
        )

        # Fetch matching events
        interests = user.interests or []

        # Map user attributes to additional interest tags
        if user.has_kids:
            interests = interests + ["families", "education", "youth"]
        if user.has_car is False:
            interests = interests + ["transportation", "bike_lanes"]
        if user.has_car is True:
            interests = interests + ["parking", "traffic"]

        if interests:
            events_data = await get_events_by_tags(interests)
        else:
            # No interests specified, show all upcoming events
            events_data = await get_all_events()

        events = [
            CivicEvent(
                id=e.get("id", ""),
                source_url=e.get("source_url", ""),
                title=e.get("title", ""),
                summary=e.get("summary"),
                impact_tags=e.get("impact_tags", []),
                urgency=e.get("urgency", "Medium"),
                event_date=e.get("event_date"),
                source_type=e.get("source_type"),
                location=e.get("location")
            )
            for e in events_data
        ]

        # Generate match explanation
        if interests:
            match_explanation = f"Showing events matching your interests: {', '.join(interests[:5])}"
        else:
            match_explanation = "Showing all upcoming civic events"

        return DashboardResponse(
            user=user,
            events=events,
            match_explanation=match_explanation
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dashboard: {str(e)}")
