"""
SF Board of Supervisors Legistar Scraper
Fetches upcoming meetings and legislation from the Legistar API
"""
import httpx
from datetime import datetime, timedelta
from typing import Optional

LEGISTAR_BASE_URL = "https://webapi.legistar.com/v1/sfgov"

# Map Legistar event types to impact tags
BODY_TO_TAGS = {
    "Board of Supervisors": ["legislation", "city_policy"],
    "Budget and Finance Committee": ["budget", "taxes", "city_services"],
    "Land Use and Transportation Committee": ["housing", "zoning", "transportation"],
    "Public Safety and Neighborhood Services Committee": ["public_safety", "police", "neighborhoods"],
    "Government Audit and Oversight Committee": ["oversight", "accountability"],
    "Rules Committee": ["procedures", "appointments"],
    "Youth, Young Adult, and Families Committee": ["families", "youth", "education"],
}


def calculate_urgency(event_date: Optional[datetime]) -> str:
    """Calculate urgency based on days until event"""
    if not event_date:
        return "Medium"

    days_until = (event_date - datetime.now(event_date.tzinfo)).days

    if days_until <= 2:
        return "High"
    elif days_until <= 7:
        return "Medium"
    else:
        return "Low"


def get_impact_tags(body_name: str) -> list[str]:
    """Map committee/body name to relevant impact tags"""
    for key, tags in BODY_TO_TAGS.items():
        if key.lower() in body_name.lower():
            return tags
    return ["city_policy"]


async def fetch_upcoming_events(days_ahead: int = 30) -> list[dict]:
    """Fetch upcoming meetings from Legistar API"""

    today = datetime.now().strftime("%Y-%m-%d")
    future = (datetime.now() + timedelta(days=days_ahead)).strftime("%Y-%m-%d")

    url = f"{LEGISTAR_BASE_URL}/Events"
    params = {
        "$filter": f"EventDate ge datetime'{today}' and EventDate le datetime'{future}'",
        "$orderby": "EventDate"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=30)
        response.raise_for_status()
        events = response.json()

    civic_events = []
    for event in events:
        event_date = None
        if event.get("EventDate"):
            try:
                event_date = datetime.fromisoformat(event["EventDate"].replace("T", " ").split(".")[0])
            except:
                pass

        body_name = event.get("EventBodyName", "Board of Supervisors")

        civic_event = {
            "source_url": f"https://sfgov.legistar.com/MeetingDetail.aspx?ID={event.get('EventId')}",
            "title": f"{body_name} Meeting",
            "summary": event.get("EventComment") or f"Scheduled meeting of the {body_name}",
            "impact_tags": get_impact_tags(body_name),
            "urgency": calculate_urgency(event_date),
            "event_date": event_date.isoformat() if event_date else None,
            "source_type": "legistar",
            "location": event.get("EventLocation"),
            "raw_data": event
        }
        civic_events.append(civic_event)

    return civic_events


async def fetch_recent_legislation(days_back: int = 30) -> list[dict]:
    """Fetch recently introduced legislation"""

    cutoff = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")

    url = f"{LEGISTAR_BASE_URL}/Matters"
    params = {
        "$filter": f"MatterIntroDate ge datetime'{cutoff}'",
        "$orderby": "MatterIntroDate desc",
        "$top": 50
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=30)
        response.raise_for_status()
        matters = response.json()

    civic_events = []
    for matter in matters:
        # Determine impact tags based on matter type and title
        title = matter.get("MatterTitle", "")
        tags = ["legislation"]

        title_lower = title.lower()
        if any(w in title_lower for w in ["housing", "rent", "tenant", "eviction"]):
            tags.append("housing")
        if any(w in title_lower for w in ["transit", "muni", "bike", "parking", "traffic"]):
            tags.append("transportation")
        if any(w in title_lower for w in ["police", "safety", "crime"]):
            tags.append("public_safety")
        if any(w in title_lower for w in ["budget", "tax", "fee"]):
            tags.append("budget")
        if any(w in title_lower for w in ["zoning", "planning", "development"]):
            tags.append("zoning")

        # Use intro date for urgency (newer = more urgent for public comment)
        intro_date = None
        if matter.get("MatterIntroDate"):
            try:
                intro_date = datetime.fromisoformat(matter["MatterIntroDate"].replace("T", " ").split(".")[0])
            except:
                pass

        civic_event = {
            "source_url": f"https://sfgov.legistar.com/LegislationDetail.aspx?ID={matter.get('MatterId')}",
            "title": matter.get("MatterTitle", "Untitled Legislation"),
            "summary": matter.get("MatterName") or matter.get("MatterTitle", ""),
            "impact_tags": tags,
            "urgency": "Medium",  # Legislation typically has more time
            "event_date": intro_date.isoformat() if intro_date else None,
            "source_type": "legistar",
            "location": "City Hall, 1 Dr Carlton B Goodlett Pl",
            "raw_data": matter
        }
        civic_events.append(civic_event)

    return civic_events


async def scrape_all() -> list[dict]:
    """Fetch all civic events from Legistar (meetings + legislation)"""
    events = await fetch_upcoming_events()
    legislation = await fetch_recent_legislation()
    return events + legislation


if __name__ == "__main__":
    import asyncio

    async def main():
        events = await scrape_all()
        print(f"Found {len(events)} civic events from Legistar")
        for e in events[:5]:
            print(f"  - {e['title']} ({e['urgency']})")

    asyncio.run(main())
