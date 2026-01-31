"""
OpenAI Web Search for SF Civic Data

Uses OpenAI's web search capabilities to find current San Francisco
legislation, bills, ballot measures, and civic events.
"""
import os
import json
from openai import OpenAI
from datetime import datetime

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def search_sf_legislation() -> dict:
    """
    Use OpenAI with web search to find current SF legislation and bills.
    Returns comprehensive data about recent civic activity.
    """

    today = datetime.now().strftime("%B %d, %Y")

    prompt = f"""Today is {today}. Search the web and provide a comprehensive report on current San Francisco civic activity.

I need DETAILED information on ALL of the following categories. For each item found, include as much detail as possible:

## 1. CURRENT SF BOARD OF SUPERVISORS LEGISLATION
Search for recent ordinances, resolutions, and motions. Include:
- Bill/file number
- Title and full description
- Sponsor(s)
- Current status (introduced, committee, passed, etc.)
- Key dates (introduction, hearings, votes)
- Which neighborhoods/populations are affected
- Links to official sources

## 2. UPCOMING BALLOT MEASURES (2024-2026)
Search for San Francisco ballot propositions and measures. Include:
- Proposition letter/number
- Official title
- What it would do (detailed explanation)
- Who supports and opposes it
- Fiscal impact
- Election date

## 3. SFMTA / TRANSPORTATION PROPOSALS
Search for transit, bike lane, parking, and traffic proposals. Include:
- Project name
- Description and scope
- Affected streets/neighborhoods
- Timeline
- Public comment opportunities

## 4. HOUSING & DEVELOPMENT
Search for major housing developments, zoning changes, rent control updates. Include:
- Project name and address
- Number of units
- Affordable housing percentage
- Current status
- Community meetings scheduled

## 5. PUBLIC SAFETY INITIATIVES
Search for police reform, community safety, and emergency services updates. Include:
- Policy name
- What it changes
- Implementation timeline

## 6. UPCOMING PUBLIC MEETINGS
Search for scheduled Board of Supervisors meetings, Planning Commission hearings, community meetings. Include:
- Date and time
- Location
- Agenda topics
- How to participate

## 7. RECENT VOTES & DECISIONS
Search for legislation that was recently passed or rejected. Include:
- What was decided
- Vote count
- Effective date
- Impact

For EACH item, assign:
- impact_tags: Array of relevant tags from [housing, transportation, public_safety, budget, education, environment, technology, healthcare, small_business, neighborhoods, families, seniors, tenants, parking, bike_lanes, transit, zoning, police, homelessness, mental_health]
- urgency: "High" (action needed within 7 days), "Medium" (within 30 days), "Low" (informational)
- affected_neighborhoods: Array of SF neighborhoods affected

Provide as much detail as possible. I want comprehensive civic intelligence for San Francisco residents."""

    print("Searching the web for SF civic data...")
    print("This may take a moment...\n")

    response = client.responses.create(
        model="gpt-4o",
        tools=[{"type": "web_search_preview"}],
        input=prompt,
        tool_choice={"type": "web_search_preview"},
    )

    # Extract the response
    result = {
        "search_date": today,
        "raw_response": "",
        "sources": [],
        "events": []
    }

    for output in response.output:
        if output.type == "message":
            for content in output.content:
                if hasattr(content, 'text'):
                    result["raw_response"] = content.text
        elif output.type == "web_search_call":
            if hasattr(output, 'results'):
                for r in output.results:
                    result["sources"].append({
                        "title": getattr(r, 'title', ''),
                        "url": getattr(r, 'url', ''),
                        "snippet": getattr(r, 'snippet', '')
                    })

    return result


def parse_to_civic_events(search_result: dict) -> list[dict]:
    """
    Use OpenAI to parse the search results into structured civic events.
    """

    prompt = f"""Parse the following civic data into a JSON array of civic events.

RAW DATA:
{search_result.get('raw_response', '')}

For each distinct civic item (bill, meeting, ballot measure, project, etc.), create an object with:
{{
    "title": "Short descriptive title",
    "summary": "Detailed description (2-4 sentences)",
    "source_url": "URL if available, otherwise construct from sfgov.org",
    "impact_tags": ["tag1", "tag2"],  // from: housing, transportation, public_safety, budget, education, environment, technology, healthcare, small_business, neighborhoods, families, seniors, tenants, parking, bike_lanes, transit, zoning, police, homelessness, mental_health, legislation, ballot_measure
    "urgency": "High" or "Medium" or "Low",
    "event_date": "YYYY-MM-DD if known, null if not",
    "source_type": "board_of_supervisors" or "ballot_measure" or "sfmta" or "planning" or "public_safety" or "community_meeting",
    "location": "Location if applicable",
    "sponsors": "Sponsors/authors if known",
    "status": "Current status if known",
    "affected_neighborhoods": ["neighborhood1", "neighborhood2"]
}}

Extract as many distinct events as possible. Return ONLY valid JSON array, no markdown."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=8000
    )

    try:
        text = response.choices[0].message.content.strip()
        # Remove markdown code blocks if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        events = json.loads(text)
        return events if isinstance(events, list) else []
    except Exception as e:
        print(f"Parse error: {e}")
        return []


async def search_and_store() -> dict:
    """
    Search for SF civic data and store in Supabase.
    """
    from services.supabase_client import save_civic_events

    # Step 1: Web search
    print("=" * 60)
    print("STEP 1: Searching the web for SF civic data...")
    print("=" * 60)

    search_result = search_sf_legislation()

    print("\n" + "=" * 60)
    print("RAW SEARCH RESULTS")
    print("=" * 60)
    print(search_result.get("raw_response", "No response")[:5000])

    if search_result.get("sources"):
        print("\n" + "-" * 40)
        print("SOURCES FOUND:")
        for s in search_result["sources"][:10]:
            print(f"  - {s.get('title', 'Untitled')}")
            print(f"    {s.get('url', '')}")

    # Step 2: Parse into structured events
    print("\n" + "=" * 60)
    print("STEP 2: Parsing into structured civic events...")
    print("=" * 60)

    events = parse_to_civic_events(search_result)

    print(f"\nParsed {len(events)} civic events")

    for i, event in enumerate(events, 1):
        print(f"\n{i}. [{event.get('urgency', 'Medium')}] {event.get('title', 'Untitled')}")
        print(f"   Tags: {event.get('impact_tags', [])}")
        print(f"   Summary: {event.get('summary', '')[:100]}...")

    # Step 3: Store in Supabase
    print("\n" + "=" * 60)
    print("STEP 3: Storing in Supabase...")
    print("=" * 60)

    # Format for our schema
    formatted_events = []
    for event in events:
        formatted = {
            "source_url": event.get("source_url") or f"https://sfgov.org/civic/{hash(event.get('title', ''))}",
            "title": event.get("title", "Untitled"),
            "summary": event.get("summary", ""),
            "impact_tags": event.get("impact_tags", ["legislation"]),
            "urgency": event.get("urgency", "Medium"),
            "event_date": event.get("event_date"),
            "source_type": event.get("source_type", "other"),
            "location": event.get("location"),
            "raw_data": {
                "sponsors": event.get("sponsors"),
                "status": event.get("status"),
                "affected_neighborhoods": event.get("affected_neighborhoods"),
                "search_date": search_result.get("search_date")
            }
        }
        formatted_events.append(formatted)

    result = await save_civic_events(formatted_events)
    print(f"\nSave result: {result}")

    return {
        "events_found": len(events),
        "events": events,
        "save_result": result,
        "raw_response": search_result.get("raw_response", "")
    }


def run_search():
    """Run the search synchronously (for testing)."""
    print("\n" + "=" * 60)
    print("SF CIVIC DATA WEB SEARCH")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 60 + "\n")

    result = search_sf_legislation()

    print("\n" + "=" * 60)
    print("COMPREHENSIVE SF CIVIC REPORT")
    print("=" * 60 + "\n")

    print(result.get("raw_response", "No response"))

    print("\n" + "=" * 60)
    print("WEB SOURCES")
    print("=" * 60)

    for source in result.get("sources", []):
        print(f"\n📰 {source.get('title', 'Untitled')}")
        print(f"   🔗 {source.get('url', 'No URL')}")
        if source.get('snippet'):
            print(f"   📝 {source.get('snippet')[:200]}...")

    # Parse into events
    print("\n" + "=" * 60)
    print("PARSING INTO CIVIC EVENTS...")
    print("=" * 60)

    events = parse_to_civic_events(result)

    print(f"\nExtracted {len(events)} civic events:\n")

    for i, event in enumerate(events, 1):
        print(f"{'='*50}")
        print(f"EVENT {i}: {event.get('title', 'Untitled')}")
        print(f"{'='*50}")
        print(f"Urgency: {event.get('urgency', 'Medium')}")
        print(f"Tags: {', '.join(event.get('impact_tags', []))}")
        print(f"Type: {event.get('source_type', 'unknown')}")
        print(f"Date: {event.get('event_date', 'TBD')}")
        print(f"Location: {event.get('location', 'N/A')}")
        print(f"Sponsors: {event.get('sponsors', 'N/A')}")
        print(f"Status: {event.get('status', 'N/A')}")
        print(f"Neighborhoods: {', '.join(event.get('affected_neighborhoods', []))}")
        print(f"\nSummary:\n{event.get('summary', 'No summary')}")
        print(f"\nSource: {event.get('source_url', 'N/A')}")
        print()

    return events


if __name__ == "__main__":
    run_search()
