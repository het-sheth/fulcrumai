"""
LLM-powered enrichment for civic matching.
Uses OpenAI to analyze Nyne data and generate deep civic interest profiles.

Inspired by Nyne Deep Research approach.
"""
import os
import json
from typing import Optional
from openai import OpenAI

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Civic-focused analysis prompt
CIVIC_PROFILE_PROMPT = '''You are an expert civic analyst. Your job is to analyze a person's profile data and determine what LOCAL CIVIC ISSUES would matter most to them.

RULES:
1. Every insight MUST cite specific evidence from the data
2. Be specific - don't just say "housing", say "rent control" or "new development"
3. Consider their profession, location, interests, and social media activity
4. Think about how their life situation affects what policies impact them

ANALYZE THIS PERSON AND DETERMINE:

## 1. CIVIC IDENTITY SNAPSHOT
- Who is this person? (1-2 sentences)
- Where do they live/work?
- What's their life situation? (homeowner/renter, has kids, commutes how, etc.)

## 2. TOP 5 CIVIC ISSUES THAT AFFECT THEM
For each issue, explain WHY it matters to them based on evidence:

1. **[Issue Name]** - [Priority: High/Medium/Low]
   - Why this matters to them: [cite specific evidence]
   - Their likely stance: [based on data]

2. **[Issue Name]** - [Priority: High/Medium/Low]
   - Why this matters to them:
   - Their likely stance:

(continue for 5 issues)

## 3. POLICY AREAS BY RELEVANCE
Rate each area 1-10 based on how much it likely affects them:

- Housing/Rent: [1-10] - [brief reason]
- Transportation/Transit: [1-10] - [brief reason]
- Education/Schools: [1-10] - [brief reason]
- Public Safety: [1-10] - [brief reason]
- Environment/Climate: [1-10] - [brief reason]
- Technology/AI Policy: [1-10] - [brief reason]
- Small Business: [1-10] - [brief reason]
- Taxes/Budget: [1-10] - [brief reason]
- Healthcare: [1-10] - [brief reason]
- Parks/Recreation: [1-10] - [brief reason]
- Zoning/Development: [1-10] - [brief reason]

## 4. CIVIC ENGAGEMENT PREDICTION
- How likely are they to vote? (1-10)
- How likely to attend a public meeting? (1-10)
- How likely to contact their representative? (1-10)
- Best way to engage them on civic issues:

## 5. CONVERSATION STARTERS
5 specific civic topics to bring up based on their profile:
1. [Topic with specific angle based on their data]
2. ...

## 6. MATCHING TAGS
Return a JSON array of tags for matching with civic events:
```json
["housing", "transit", "tech_policy", ...]
```

---

HERE IS THE PERSON'S PROFILE DATA:
{data}

Now analyze this person's civic profile. Be specific and cite evidence.'''


QUICK_INTERESTS_PROMPT = '''Analyze this person's data and return ONLY a JSON object with their civic interests.

Based on their profession, location, posts, skills, and any other data, determine:
1. What civic/political issues likely matter to them
2. What policy areas affect their daily life
3. What topics they've shown interest in

Return ONLY valid JSON in this exact format:
{{
  "primary_interests": ["housing", "transportation", ...],  // Top 3-5 most relevant
  "secondary_interests": ["education", "environment", ...], // Other relevant topics
  "likely_stance": {{
    "housing": "pro-development" or "pro-tenant" or "neutral",
    "transportation": "pro-transit" or "pro-car" or "neutral",
    ...
  }},
  "engagement_level": "high" or "medium" or "low",
  "summary": "One sentence about their civic profile"
}}

PERSON DATA:
{data}

Return ONLY the JSON object, no other text.'''


def create_client():
    """Create OpenAI client."""
    if not OPENAI_API_KEY:
        return None
    return OpenAI(api_key=OPENAI_API_KEY)


async def generate_civic_profile(nyne_data: dict) -> Optional[dict]:
    """
    Generate a comprehensive civic profile using LLM analysis.

    Args:
        nyne_data: The parsed Nyne enrichment data

    Returns:
        Dict with civic profile analysis
    """
    client = create_client()
    if not client:
        print("OpenAI API key not set, skipping LLM enrichment")
        return None

    # Remove raw_data to reduce token usage
    clean_data = {k: v for k, v in nyne_data.items() if k != 'raw_data'}

    prompt = CIVIC_PROFILE_PROMPT.format(data=json.dumps(clean_data, indent=2, default=str))

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.7
        )

        content = response.choices[0].message.content

        return {
            "civic_analysis": content,
            "model": "gpt-4o-mini",
            "success": True
        }

    except Exception as e:
        print(f"LLM civic profile generation failed: {e}")
        return {"error": str(e), "success": False}


async def generate_quick_interests(nyne_data: dict) -> Optional[dict]:
    """
    Generate quick civic interests JSON using LLM.
    Faster and cheaper than full profile.

    Args:
        nyne_data: The parsed Nyne enrichment data

    Returns:
        Dict with interests and stance predictions
    """
    client = create_client()
    if not client:
        print("OpenAI API key not set, skipping LLM enrichment")
        return None

    # Remove raw_data and large fields to reduce tokens
    clean_data = {
        "full_name": nyne_data.get("full_name"),
        "profession": nyne_data.get("profession"),
        "headline": nyne_data.get("headline"),
        "bio": nyne_data.get("bio", "")[:500] if nyne_data.get("bio") else None,
        "company": nyne_data.get("company"),
        "industry": nyne_data.get("industry"),
        "city": nyne_data.get("city"),
        "state": nyne_data.get("state"),
        "skills": nyne_data.get("skills", [])[:15],
        "interests": nyne_data.get("interests", []),
        "education": nyne_data.get("education", [])[:2],
        "recent_posts": [p.get("content", "")[:200] for p in nyne_data.get("recent_posts", [])[:3]],
        "causes": nyne_data.get("causes", []),
        "volunteering": nyne_data.get("volunteering", [])[:3],
    }

    prompt = QUICK_INTERESTS_PROMPT.format(data=json.dumps(clean_data, indent=2, default=str))

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.3
        )

        content = response.choices[0].message.content.strip()

        # Try to parse JSON from response
        # Handle markdown code blocks
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]

        result = json.loads(content)
        result["success"] = True
        result["model"] = "gpt-4o-mini"
        return result

    except json.JSONDecodeError as e:
        print(f"Failed to parse LLM response as JSON: {e}")
        return {"error": "Invalid JSON response", "success": False}
    except Exception as e:
        print(f"LLM quick interests generation failed: {e}")
        return {"error": str(e), "success": False}


def enrich_interests_with_llm_sync(nyne_data: dict) -> dict:
    """
    Synchronous wrapper for quick interests generation.
    Updates the nyne_data with LLM-inferred interests.
    """
    import asyncio

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    result = loop.run_until_complete(generate_quick_interests(nyne_data))

    if result and result.get("success"):
        # Merge LLM interests with existing interests
        existing = set(nyne_data.get("interests", []))
        llm_primary = set(result.get("primary_interests", []))
        llm_secondary = set(result.get("secondary_interests", []))

        # Combine all interests
        all_interests = list(existing | llm_primary | llm_secondary)

        nyne_data["interests"] = all_interests[:20]  # Cap at 20
        nyne_data["llm_analysis"] = {
            "primary_interests": result.get("primary_interests", []),
            "secondary_interests": result.get("secondary_interests", []),
            "likely_stance": result.get("likely_stance", {}),
            "engagement_level": result.get("engagement_level", "medium"),
            "summary": result.get("summary", "")
        }

    return nyne_data
