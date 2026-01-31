"""
LegiScan California Legislation Scraper using OpenAI Web Search

Fetches comprehensive California state legislation data from LegiScan,
focusing on bills relevant to San Francisco residents.
"""
import os
import json
from openai import OpenAI
from datetime import datetime

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def scrape_legiscan_california() -> dict:
    """
    Use OpenAI with web search to scrape LegiScan California legislation.
    Returns comprehensive data about CA state bills.
    """

    today = datetime.now().strftime("%B %d, %Y")

    prompt = f"""Today is {today}.

Visit and analyze https://legiscan.com/CA/legislation and related pages to find ALL current California state legislation.

I need you to search extensively and provide MAXIMUM DETAIL on California bills. Go through multiple pages and links.

## SEARCH INSTRUCTIONS:
1. First, visit https://legiscan.com/CA/legislation to see the main list
2. Look for bills introduced in 2025-2026 legislative session
3. Click into individual bill pages to get full details
4. Search for bills in these categories that affect San Francisco:

## CATEGORIES TO SEARCH:

### HOUSING & RENT
- Tenant protections
- Rent control
- Affordable housing requirements
- ADU/granny flat laws
- Eviction protections
- Housing development streamlining

### TRANSPORTATION
- Public transit funding
- Bike infrastructure
- Electric vehicle mandates
- Congestion pricing
- Ride-share regulations

### ENVIRONMENT & CLIMATE
- Emissions standards
- Building electrification
- Clean energy requirements
- Plastic bans
- Water conservation

### TECHNOLOGY & AI
- AI regulation
- Data privacy
- Gig worker classification
- Tech company regulations

### PUBLIC SAFETY
- Police reform
- Criminal justice reform
- Gun control
- Drug policy
- Mental health crisis response

### LABOR & EMPLOYMENT
- Minimum wage
- Worker protections
- Paid leave requirements
- Union rights

### HEALTHCARE
- Healthcare access
- Mental health services
- Drug pricing
- Reproductive rights

### EDUCATION
- School funding
- Higher education
- Childcare

### TAXES & BUDGET
- Tax policy changes
- Budget allocations
- Local government funding

## FOR EACH BILL, PROVIDE:
1. **Bill Number** (e.g., AB 123, SB 456)
2. **Title** - Official title
3. **Author(s)** - Legislator(s) who introduced it
4. **Status** - Where it is in the process (Introduced, Committee, Passed Assembly, etc.)
5. **Summary** - 2-4 sentence description of what it does
6. **Full Text Link** - URL to the bill
7. **Key Dates** - Introduction date, hearing dates, vote dates
8. **Impact on SF** - How this affects San Francisco specifically
9. **Support/Opposition** - Known supporters and opponents
10. **Category Tags** - Relevant categories

Search as many pages as possible. I want at least 30-50 bills if available.

Return the data in a structured format with clear sections."""

    print("=" * 60)
    print("SCRAPING LEGISCAN CALIFORNIA LEGISLATION")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 60)
    print("\nSearching LegiScan for California bills...")
    print("This may take a moment as we search multiple pages...\n")

    response = client.responses.create(
        model="gpt-4o",
        tools=[{"type": "web_search_preview"}],
        input=prompt,
        tool_choice={"type": "web_search_preview"},
    )

    result = {
        "search_date": today,
        "raw_response": "",
        "sources": []
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


def search_specific_category(category: str, keywords: list[str]) -> dict:
    """
    Search LegiScan for bills in a specific category.
    """
    today = datetime.now().strftime("%B %d, %Y")

    keywords_str = ", ".join(keywords)

    prompt = f"""Today is {today}.

Search LegiScan California (https://legiscan.com/CA/legislation) for bills related to: {category}

Keywords to search: {keywords_str}

Find ALL bills in the current 2025-2026 session related to these topics.

For EACH bill found, provide:
- Bill Number (AB/SB number)
- Full Title
- Author(s)
- Current Status
- Detailed Summary (3-5 sentences)
- How it affects San Francisco residents
- Key dates
- LegiScan URL

Search thoroughly and return as many relevant bills as possible."""

    response = client.responses.create(
        model="gpt-4o",
        tools=[{"type": "web_search_preview"}],
        input=prompt,
        tool_choice={"type": "web_search_preview"},
    )

    result = {"category": category, "raw_response": "", "sources": []}

    for output in response.output:
        if output.type == "message":
            for content in output.content:
                if hasattr(content, 'text'):
                    result["raw_response"] = content.text

    return result


def parse_bills_to_events(raw_data: str) -> list[dict]:
    """
    Parse the raw LegiScan data into structured civic events.
    """

    prompt = f"""Parse the following California legislation data into a JSON array.

RAW DATA:
{raw_data}

For EACH bill mentioned, create a JSON object with these EXACT fields:
{{
    "bill_number": "AB 123 or SB 456",
    "title": "Official bill title",
    "summary": "Detailed 2-4 sentence summary of what the bill does",
    "authors": "Legislator names who authored the bill",
    "status": "Current status (Introduced, In Committee, Passed Assembly, etc.)",
    "source_url": "LegiScan URL for the bill",
    "impact_tags": ["tag1", "tag2"],
    "urgency": "High/Medium/Low based on how soon action is needed",
    "event_date": "Next key date if known (YYYY-MM-DD) or null",
    "sf_impact": "How this specifically affects San Francisco residents",
    "supporters": "Known supporters",
    "opponents": "Known opponents"
}}

IMPORTANT:
- Extract EVERY bill mentioned
- Use these tags: housing, transportation, environment, technology, public_safety, healthcare, education, budget, labor, small_business, tenants, police, transit, zoning, families, seniors, homelessness, mental_health, gun_control, drug_policy, climate, ai_policy, privacy, gig_workers
- Set urgency to "High" if vote is imminent, "Medium" if in active committee, "Low" if just introduced
- Return ONLY valid JSON array, no markdown or explanation"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=16000
    )

    try:
        text = response.choices[0].message.content.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()
        bills = json.loads(text)
        return bills if isinstance(bills, list) else []
    except Exception as e:
        print(f"Parse error: {e}")
        return []


def run_comprehensive_scrape():
    """
    Run a comprehensive scrape of LegiScan California legislation.
    """
    print("\n" + "=" * 70)
    print("COMPREHENSIVE CALIFORNIA LEGISLATION SCRAPE")
    print(f"Started: {datetime.now().isoformat()}")
    print("=" * 70)

    # Main scrape
    print("\n[1/4] Running main LegiScan search...")
    main_result = scrape_legiscan_california()

    print("\n" + "-" * 50)
    print("MAIN SEARCH RESULTS:")
    print("-" * 50)
    print(main_result.get("raw_response", "No response")[:8000])

    # Category-specific searches for more coverage
    categories = [
        ("Housing & Tenants", ["housing", "rent control", "tenant", "eviction", "affordable housing", "ADU"]),
        ("Transportation & Climate", ["transit", "electric vehicle", "emissions", "bike", "SFMTA"]),
        ("Tech & AI Regulation", ["artificial intelligence", "data privacy", "gig worker", "tech regulation"]),
    ]

    all_raw_data = main_result.get("raw_response", "")

    for i, (category, keywords) in enumerate(categories, 2):
        print(f"\n[{i}/4] Searching for {category} bills...")
        cat_result = search_specific_category(category, keywords)
        all_raw_data += "\n\n" + cat_result.get("raw_response", "")
        print(f"  Found additional data for {category}")

    # Parse all results
    print("\n" + "=" * 50)
    print("PARSING INTO STRUCTURED BILLS...")
    print("=" * 50)

    bills = parse_bills_to_events(all_raw_data)

    print(f"\nExtracted {len(bills)} California bills:\n")

    for i, bill in enumerate(bills, 1):
        print(f"{'='*60}")
        print(f"BILL {i}: {bill.get('bill_number', 'Unknown')} - {bill.get('title', 'Untitled')}")
        print(f"{'='*60}")
        print(f"Authors: {bill.get('authors', 'N/A')}")
        print(f"Status: {bill.get('status', 'Unknown')}")
        print(f"Urgency: {bill.get('urgency', 'Medium')}")
        print(f"Tags: {', '.join(bill.get('impact_tags', []))}")
        print(f"\nSummary:\n{bill.get('summary', 'No summary')}")
        print(f"\nSF Impact:\n{bill.get('sf_impact', 'N/A')}")
        print(f"\nURL: {bill.get('source_url', 'N/A')}")
        print()

    return bills


def format_for_supabase(bills: list[dict]) -> list[dict]:
    """
    Format parsed bills for insertion into civic_events table.
    """
    events = []

    for bill in bills:
        bill_num = bill.get("bill_number", "")

        event = {
            "source_url": bill.get("source_url") or f"https://legiscan.com/CA/bill/{bill_num.replace(' ', '')}/2025",
            "title": f"[CA] {bill_num}: {bill.get('title', 'Untitled')}"[:200],
            "summary": f"{bill.get('summary', '')} SF Impact: {bill.get('sf_impact', 'Affects California residents including San Francisco.')}",
            "impact_tags": bill.get("impact_tags", ["legislation"]),
            "urgency": bill.get("urgency", "Medium"),
            "event_date": bill.get("event_date"),
            "source_type": "other",  # state legislation
            "location": "California State Legislature",
            "raw_data": {
                "bill_number": bill_num,
                "authors": bill.get("authors"),
                "status": bill.get("status"),
                "supporters": bill.get("supporters"),
                "opponents": bill.get("opponents"),
                "sf_impact": bill.get("sf_impact"),
                "source": "legiscan"
            }
        }
        events.append(event)

    return events


async def scrape_and_store():
    """
    Run full scrape and store in Supabase.
    """
    from services.supabase_client import save_civic_events

    # Run comprehensive scrape
    bills = run_comprehensive_scrape()

    if not bills:
        print("No bills found!")
        return {"events_found": 0, "save_result": None}

    # Format for database
    events = format_for_supabase(bills)

    print(f"\n{'='*50}")
    print(f"STORING {len(events)} BILLS IN SUPABASE...")
    print(f"{'='*50}")

    result = await save_civic_events(events)

    print(f"Save result: {result}")

    return {
        "events_found": len(bills),
        "bills": bills,
        "save_result": result
    }


if __name__ == "__main__":
    bills = run_comprehensive_scrape()
    print(f"\n\nTOTAL: {len(bills)} California bills extracted")
