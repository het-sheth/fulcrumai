"""
Admin endpoints for managing civic data
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.scrapers.legistar import scrape_all, fetch_upcoming_events, fetch_recent_legislation
from services.supabase_client import save_civic_events, clear_old_events

router = APIRouter(prefix="/admin", tags=["admin"])


class RefreshResponse(BaseModel):
    success: bool
    message: str
    events_fetched: int
    events_saved: int
    errors: list[str] = []


class RefreshRequest(BaseModel):
    days_ahead: int = 30
    days_back: int = 30
    clear_old: bool = False
    clear_days: int = 90


@router.post("/refresh-events", response_model=RefreshResponse)
async def refresh_civic_events(request: Optional[RefreshRequest] = None):
    """
    Fetch latest civic events from Legistar API and save to database.

    This endpoint:
    1. Fetches upcoming meetings (next 30 days by default)
    2. Fetches recent legislation (last 30 days by default)
    3. Upserts all events to Supabase (updates if source_url exists)
    4. Optionally clears old events

    Run this periodically (e.g., daily via cron) to keep data fresh.
    """
    if request is None:
        request = RefreshRequest()

    try:
        # Fetch from Legistar
        print(f"Fetching events from Legistar API...")
        events = await scrape_all()
        print(f"Fetched {len(events)} events from Legistar")

        # Save to Supabase
        print(f"Saving events to Supabase...")
        stats = await save_civic_events(events)

        # Optionally clear old events
        cleared = 0
        if request.clear_old:
            cleared = await clear_old_events(request.clear_days)
            print(f"Cleared {cleared} old events")

        message = f"Refreshed {len(events)} events from Legistar"
        if cleared > 0:
            message += f", cleared {cleared} old events"

        return RefreshResponse(
            success=True,
            message=message,
            events_fetched=len(events),
            events_saved=stats["inserted"],
            errors=stats["errors"]
        )

    except Exception as e:
        print(f"Error refreshing events: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to refresh events: {str(e)}")


@router.get("/events-stats")
async def get_events_stats():
    """Get statistics about civic events in the database"""
    from services.supabase_client import get_supabase

    client = get_supabase()

    # Count total events
    total = client.table("civic_events").select("id", count="exact").execute()

    # Count by source type
    by_source = client.table("civic_events")\
        .select("source_type")\
        .execute()

    source_counts = {}
    for event in by_source.data or []:
        source = event.get("source_type", "unknown")
        source_counts[source] = source_counts.get(source, 0) + 1

    # Count by urgency
    by_urgency = client.table("civic_events")\
        .select("urgency")\
        .execute()

    urgency_counts = {}
    for event in by_urgency.data or []:
        urgency = event.get("urgency", "unknown")
        urgency_counts[urgency] = urgency_counts.get(urgency, 0) + 1

    return {
        "total_events": total.count if total.count else len(total.data or []),
        "by_source": source_counts,
        "by_urgency": urgency_counts
    }
