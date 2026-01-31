"""
Supabase client for Fulcrum.ai
"""
import os
from supabase import create_client, Client
from typing import Optional

_client: Optional[Client] = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "https://voinyofgowlphehfxfnm.supabase.co")
        key = os.getenv("SUPABASE_KEY")
        if not key:
            raise ValueError("SUPABASE_KEY environment variable is required")
        _client = create_client(url, key)
    return _client


async def get_user_by_email(email: str) -> Optional[dict]:
    """Fetch user by email"""
    client = get_supabase()
    response = client.table("users").select("*").eq("email", email).execute()
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None


async def create_or_update_user(user_data: dict) -> dict:
    """Create or update a user profile"""
    client = get_supabase()
    email = user_data.get("email")

    existing = await get_user_by_email(email)

    if existing:
        # Update existing user
        response = client.table("users").update(user_data).eq("email", email).execute()
    else:
        # Create new user
        response = client.table("users").insert(user_data).execute()

    return response.data[0] if response.data else {}


async def get_events_by_tags(tags: list[str], limit: int = 20) -> list[dict]:
    """Fetch events that match any of the given tags"""
    client = get_supabase()

    # Use overlaps operator to find events with matching tags
    # Supabase uses && for array overlap
    response = client.table("civic_events")\
        .select("*")\
        .order("event_date")\
        .limit(limit)\
        .execute()

    # Filter in Python since Supabase array overlap syntax is tricky
    if not response.data:
        return []

    matching_events = []
    for event in response.data:
        event_tags = event.get("impact_tags", [])
        if any(tag in event_tags for tag in tags):
            matching_events.append(event)

    # Sort by urgency (High first) then by date
    urgency_order = {"High": 0, "Medium": 1, "Low": 2}
    matching_events.sort(key=lambda e: (
        urgency_order.get(e.get("urgency", "Low"), 3),
        e.get("event_date") or ""
    ))

    return matching_events


async def get_all_events(limit: int = 20) -> list[dict]:
    """Fetch all upcoming events"""
    client = get_supabase()
    response = client.table("civic_events")\
        .select("*")\
        .order("event_date")\
        .limit(limit)\
        .execute()
    return response.data if response.data else []


async def save_civic_events(events: list[dict]) -> dict:
    """
    Save/upsert civic events to the database.
    Uses source_url as the unique key for upsert.

    Returns:
        {"inserted": int, "updated": int, "errors": list}
    """
    client = get_supabase()
    stats = {"inserted": 0, "updated": 0, "errors": []}

    for event in events:
        try:
            # Ensure required fields
            if not event.get("source_url"):
                stats["errors"].append(f"Missing source_url: {event.get('title', 'Unknown')}")
                continue

            # Prepare event data (remove raw_data if too large, convert to jsonb)
            event_data = {
                "source_url": event["source_url"],
                "title": event.get("title", "Untitled"),
                "summary": event.get("summary"),
                "impact_tags": event.get("impact_tags", []),
                "urgency": event.get("urgency", "Medium"),
                "event_date": event.get("event_date"),
                "source_type": event.get("source_type", "legistar"),
                "location": event.get("location"),
                "raw_data": event.get("raw_data"),
            }

            # Upsert using source_url as conflict key
            response = client.table("civic_events")\
                .upsert(event_data, on_conflict="source_url")\
                .execute()

            if response.data:
                stats["inserted"] += 1

        except Exception as e:
            stats["errors"].append(f"Error saving {event.get('title', 'Unknown')}: {str(e)}")

    return stats


async def clear_old_events(days_old: int = 90) -> int:
    """Remove events older than specified days"""
    from datetime import datetime, timedelta

    client = get_supabase()
    cutoff = (datetime.now() - timedelta(days=days_old)).isoformat()

    response = client.table("civic_events")\
        .delete()\
        .lt("event_date", cutoff)\
        .execute()

    return len(response.data) if response.data else 0
