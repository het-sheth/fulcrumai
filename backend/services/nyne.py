"""
Nyne.ai API client for comprehensive user profile enrichment
https://nyne.ai - Professional data enrichment

Uses THREE Nyne endpoints for maximum data:
1. /person/enrichment - Profile, career, education, social profiles, LinkedIn posts
2. /person/interactions - Twitter following list for psychographic analysis
3. /person/articlesearch - Press mentions, interviews, media coverage

The API is asynchronous - we submit requests, then poll for results.
"""
import os
import asyncio
import httpx
from typing import Optional

NYNE_API_KEY = os.getenv("NYNE_API_KEY")
NYNE_API_SECRET = os.getenv("NYNE_API_SECRET")
NYNE_BASE_URL = "https://api.nyne.ai"

# Endpoints
ENRICHMENT_URL = f"{NYNE_BASE_URL}/person/enrichment"
INTERACTIONS_URL = f"{NYNE_BASE_URL}/person/interactions"
ARTICLE_SEARCH_URL = f"{NYNE_BASE_URL}/person/articlesearch"

# Polling configuration
POLL_INTERVAL = 4  # seconds between polls
POLL_TIMEOUT = 180  # max seconds to wait (3 min for complex lookups)


async def enrich_profile(email: str, linkedin_url: Optional[str] = None) -> dict:
    """
    Call Nyne.ai to infer user profile from email/LinkedIn.

    Returns:
        {
            "profession": "Software Engineer",
            "likely_location": "San Francisco, SoMa",
            "interests": ["Tech Policy", "Startups"],
            "company": "Acme Inc",
            "seniority": "Senior",
            "full_name": "John Doe",
            "raw_data": { ... full nyne response ... }
        }
    """
    if NYNE_API_KEY and NYNE_API_SECRET:
        return await _call_nyne_api(email, linkedin_url)
    else:
        print("Warning: NYNE_API_KEY or NYNE_API_SECRET not set, using mock")
        return _mock_enrichment(email, linkedin_url)


async def _call_nyne_api(email: str, linkedin_url: Optional[str]) -> dict:
    """
    Call ALL THREE Nyne API endpoints for maximum data:
    1. /person/enrichment - Profile, career, education, posts (first - gives us name, company, twitter)
    2. /person/interactions - Twitter following (needs Twitter URL from step 1)
    3. /person/articlesearch - Press mentions (needs name + company from step 1)

    API docs: https://github.com/MichaelFanous2/nyne-deep-research
    """
    headers = {
        "X-API-Key": NYNE_API_KEY,
        "X-API-Secret": NYNE_API_SECRET,
        "Content-Type": "application/json"
    }

    # Base payload - best results with both email AND LinkedIn
    enrichment_payload = {}
    if email:
        enrichment_payload["email"] = email
    if linkedin_url:
        enrichment_payload["social_media_url"] = linkedin_url

    print(f"Calling Nyne API for: {email}, LinkedIn: {linkedin_url}")

    async with httpx.AsyncClient() as client:
        try:
            # Step 1: Call enrichment first to get name, company, twitter URL
            print("Step 1: Calling /person/enrichment...")
            enrichment_data = await _call_enrichment(client, headers, enrichment_payload)

            if not enrichment_data:
                print("Enrichment returned no data, using mock")
                return _mock_enrichment(email, linkedin_url)

            # Extract Twitter URL and name/company for follow-up calls
            twitter_url = None
            social_profiles = enrichment_data.get("social_profiles") or {}
            if isinstance(social_profiles, dict):
                twitter_url = social_profiles.get("twitter") or social_profiles.get("twitter_url")
            # Also check top-level
            if not twitter_url:
                twitter_url = enrichment_data.get("twitter_url") or enrichment_data.get("twitter")

            full_name = enrichment_data.get("name") or enrichment_data.get("full_name")
            if not full_name:
                first = enrichment_data.get("first_name") or ""
                last = enrichment_data.get("last_name") or ""
                full_name = f"{first} {last}".strip()

            company = enrichment_data.get("company") or enrichment_data.get("company_name")

            # Step 2 & 3: Call interactions and article search in parallel (if we have the needed data)
            interactions_data = {}
            articles_data = {}

            tasks = []
            task_names = []

            if twitter_url:
                print(f"Step 2: Calling /person/interactions with Twitter: {twitter_url}")
                tasks.append(_call_interactions(client, headers, twitter_url))
                task_names.append("interactions")
            else:
                print("Step 2: Skipping interactions (no Twitter URL found)")

            if full_name and company:
                print(f"Step 3: Calling /person/articlesearch for: {full_name} @ {company}")
                tasks.append(_call_article_search(client, headers, full_name, company))
                task_names.append("articles")
            else:
                print(f"Step 3: Skipping article search (name={full_name}, company={company})")

            if tasks:
                results = await asyncio.gather(*tasks, return_exceptions=True)
                for i, result in enumerate(results):
                    if isinstance(result, Exception):
                        print(f"{task_names[i]} failed: {result}")
                    elif task_names[i] == "interactions":
                        interactions_data = result or {}
                    elif task_names[i] == "articles":
                        articles_data = result or {}

            # Combine all data
            combined_data = {
                **enrichment_data,
                "social_interactions": interactions_data,
                "press_mentions": articles_data
            }

            return _parse_nyne_response(combined_data)

        except Exception as e:
            print(f"Nyne API error: {e}")
            return _mock_enrichment(email, linkedin_url)


async def _call_enrichment(client: httpx.AsyncClient, headers: dict, payload: dict) -> dict:
    """Call /person/enrichment endpoint."""
    # Enable ALL enhanced features for maximum data
    payload["ai_enhanced_search"] = True
    payload["probability_score"] = True
    # Request newsfeed from ALL available social networks
    payload["newsfeed"] = ["LinkedIn", "Twitter", "Instagram", "GitHub", "Facebook"]

    try:
        response = await client.post(ENRICHMENT_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        result = response.json()
        data = result.get("data", {})

        # Handle async polling if queued
        if data.get("status") == "queued":
            request_id = data.get("request_id")
            print(f"Enrichment queued, polling... (request_id: {request_id})")
            return await _poll_for_results(client, headers, request_id, ENRICHMENT_URL)

        if result.get("success") and data and "status" not in data:
            print("Enrichment completed")
            return data

        return {}
    except Exception as e:
        print(f"Enrichment error: {e}")
        return {}


async def _call_interactions(client: httpx.AsyncClient, headers: dict, twitter_url: str) -> dict:
    """
    Call /person/interactions endpoint for Twitter following list.

    Requires a Twitter URL (not email/LinkedIn).
    """
    payload = {
        "type": "following",
        "social_media_url": twitter_url,
        "max_results": 500
    }

    try:
        response = await client.post(INTERACTIONS_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        result = response.json()
        data = result.get("data", {})

        # Handle async polling if queued
        if data.get("status") == "queued":
            request_id = data.get("request_id")
            print(f"Interactions queued, polling... (request_id: {request_id})")
            return await _poll_for_results(client, headers, request_id, INTERACTIONS_URL)

        if result.get("success") and data and "status" not in data:
            print("Interactions completed")
            return data

        return {}
    except Exception as e:
        print(f"Interactions error: {e}")
        return {}


async def _call_article_search(client: httpx.AsyncClient, headers: dict, name: str, company: str) -> dict:
    """
    Call /person/articlesearch endpoint for press mentions.

    Requires name and company (not email/LinkedIn).
    """
    payload = {
        "name": name,
        "company": company,
        "sort": "recent",
        "limit": 20
    }

    try:
        response = await client.post(ARTICLE_SEARCH_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        result = response.json()
        data = result.get("data", {})

        # Handle async polling if queued
        if data.get("status") == "queued":
            request_id = data.get("request_id")
            print(f"Article search queued, polling... (request_id: {request_id})")
            return await _poll_for_results(client, headers, request_id, ARTICLE_SEARCH_URL)

        if result.get("success") and data and "status" not in data:
            print("Article search completed")
            return data

        return {}
    except Exception as e:
        print(f"Article search error: {e}")
        return {}


async def _poll_for_results(client: httpx.AsyncClient, headers: dict, request_id: str, base_url: str) -> dict:
    """
    Poll the Nyne API for results (works for all endpoints).
    Returns raw data dict, NOT parsed - parsing happens after combining all sources.
    """
    poll_url = f"{base_url}?request_id={request_id}"
    elapsed = 0

    while elapsed < POLL_TIMEOUT:
        await asyncio.sleep(POLL_INTERVAL)
        elapsed += POLL_INTERVAL

        try:
            response = await client.get(poll_url, headers=headers, timeout=30)
            response.raise_for_status()
            result = response.json()

            # Nyne wraps responses: {success: true, data: {...}}
            data = result.get("data", {})
            status = data.get("status", "").lower() if isinstance(data, dict) else ""

            # Completed - return raw data
            if status == "completed" or (result.get("success") and data and "status" not in data):
                print(f"Request completed after {elapsed}s")
                return data

            elif status in ["failed", "not_found", "error"]:
                print(f"Request failed: {data.get('error', status)}")
                return {}

            elif status in ["queued", "processing", "pending"]:
                print(f"Still processing... ({elapsed}s elapsed)")
                continue

            else:
                # Unknown status - check if we have data (no status field = actual data)
                if data and "status" not in data and isinstance(data, dict):
                    print(f"Got data after {elapsed}s")
                    return data
                print(f"Unknown status: {status}, continuing to poll...")

        except Exception as e:
            print(f"Poll error: {e}")

    print(f"Polling timeout after {POLL_TIMEOUT}s")
    return {}


def _parse_nyne_response(data: dict) -> dict:
    """
    Parse the Nyne API response - extract EVERYTHING available.

    Nyne wraps enrichment data in a 'result' object with field names like:
    - firstname, lastname (not first_name)
    - headline, summary (bio)
    - schools_info (not education)
    - positions_info (not work_history)
    - address.city, address.state
    """
    # Nyne wraps the actual data in a 'result' key
    if "result" in data:
        data = {**data, **data["result"]}
    profile = {
        # Basic info
        "full_name": None,
        "first_name": None,
        "last_name": None,
        "email_verified": None,
        "phone": None,
        "profile_photo": None,
        "headline": None,
        "bio": None,
        "birthday": None,

        # Professional
        "profession": None,
        "company": None,
        "company_domain": None,
        "company_size": None,
        "company_industry": None,
        "industry": None,
        "seniority": None,
        "years_experience": None,

        # Location
        "likely_location": None,
        "city": None,
        "state": None,
        "country": None,
        "timezone": None,
        "address": None,

        # Social profiles
        "social_profiles": {
            "linkedin": None,
            "twitter": None,
            "github": None,
            "facebook": None,
            "instagram": None,
            "strava": None,
            "pinterest": None,
            "flickr": None,
            "other": []
        },

        # History
        "work_history": [],
        "education": [],
        "skills": [],
        "languages": [],
        "certifications": [],

        # LinkedIn specific
        "linkedin_posts": [],
        "recommendations": [],
        "volunteering": [],
        "causes": [],

        # Personal
        "vehicle_ownership": None,

        # Social interactions (from /person/interactions)
        "twitter_following": [],  # Who they follow - psychographic gold

        # Press mentions (from /person/articlesearch)
        "press_mentions": [],

        # Newsfeed - recent posts from social networks
        "recent_posts": [],

        # Civic matching
        "interests": [],

        # Metadata
        "confidence_score": None,
        "data_source": "nyne_api",
        "raw_data": data
    }

    # === Extract Basic Info ===
    # Nyne uses 'firstname'/'lastname' not 'first_name'/'last_name'
    profile["first_name"] = data.get("firstname") or data.get("first_name") or data.get("firstName")
    profile["last_name"] = data.get("lastname") or data.get("last_name") or data.get("lastName")

    if data.get("name"):
        profile["full_name"] = data["name"]
    elif profile["first_name"] or profile["last_name"]:
        profile["full_name"] = f"{profile['first_name'] or ''} {profile['last_name'] or ''}".strip()

    profile["email_verified"] = data.get("email") or data.get("email_verified")
    profile["phone"] = data.get("phone") or data.get("phone_number") or data.get("mobile")
    profile["profile_photo"] = (data.get("photo") or data.get("profile_photo") or data.get("photo_url") or
                                 data.get("avatar") or data.get("image_url") or data.get("picture"))
    profile["headline"] = data.get("headline") or data.get("tagline")
    profile["bio"] = data.get("bio") or data.get("summary") or data.get("about")

    # === Extract Professional Info ===
    profile["profession"] = (data.get("job_title") or data.get("title") or
                              data.get("position") or data.get("headline"))
    profile["company"] = data.get("company") or data.get("company_name") or data.get("organization")
    profile["company_domain"] = data.get("company_domain") or data.get("company_website")
    profile["company_size"] = data.get("company_size") or data.get("company_employees")
    profile["company_industry"] = data.get("company_industry")
    profile["industry"] = data.get("industry") or data.get("sector")
    profile["seniority"] = data.get("seniority") or data.get("level") or data.get("job_level")

    # Calculate years of experience from work history
    # Nyne uses 'positions_info' or 'positions'
    work_history = data.get("positions_info") or data.get("positions") or data.get("work_history") or data.get("experience") or []
    if work_history and isinstance(work_history, list):
        try:
            earliest_year = None
            for job in work_history:
                start = job.get("start_date") or job.get("start") or job.get("startDate")
                if start and isinstance(start, str) and len(start) >= 4:
                    year = int(start[:4])
                    if earliest_year is None or year < earliest_year:
                        earliest_year = year
            if earliest_year:
                from datetime import datetime
                profile["years_experience"] = datetime.now().year - earliest_year
        except:
            pass

    # === Extract Location ===
    # Nyne puts location in an 'address' object
    address = data.get("address") or {}
    if isinstance(address, dict):
        profile["city"] = address.get("city") or data.get("city")
        profile["state"] = address.get("state") or data.get("state") or data.get("region")
        profile["country"] = address.get("country") or data.get("country") or data.get("country_code")
    else:
        profile["city"] = data.get("city")
        profile["state"] = data.get("state") or data.get("region")
        profile["country"] = data.get("country") or data.get("country_code")

    profile["timezone"] = data.get("timezone") or data.get("time_zone")

    if data.get("location"):
        profile["likely_location"] = data["location"]
    elif profile["city"]:
        parts = [profile["city"], profile["state"], profile["country"]]
        profile["likely_location"] = ", ".join(p for p in parts if p)

    # === Extract Social Profiles ===
    social = data.get("social_profiles") or data.get("socials") or {}
    if isinstance(social, dict):
        profile["social_profiles"]["linkedin"] = social.get("linkedin") or social.get("linkedin_url")
        profile["social_profiles"]["twitter"] = social.get("twitter") or social.get("twitter_url")
        profile["social_profiles"]["github"] = social.get("github") or social.get("github_url")
        profile["social_profiles"]["facebook"] = social.get("facebook") or social.get("facebook_url")
        profile["social_profiles"]["instagram"] = social.get("instagram") or social.get("instagram_url")

    # Check top-level for social URLs
    for platform in ["linkedin", "twitter", "github", "facebook", "instagram"]:
        url = data.get(f"{platform}_url") or data.get(platform)
        if url and not profile["social_profiles"][platform]:
            profile["social_profiles"][platform] = url

    # Collect other social profiles
    other_socials = []
    for key in ["medium", "youtube", "website", "blog", "personal_website", "stackoverflow", "dribbble", "behance"]:
        if data.get(key):
            other_socials.append({"platform": key, "url": data[key]})
    profile["social_profiles"]["other"] = other_socials

    # === Extract Work History ===
    for job in work_history:
        if isinstance(job, dict):
            profile["work_history"].append({
                "company": job.get("company") or job.get("company_name") or job.get("organization"),
                "title": job.get("title") or job.get("job_title") or job.get("position"),
                "description": job.get("description") or job.get("summary"),
                "start_date": job.get("start_date") or job.get("start") or job.get("startDate"),
                "end_date": job.get("end_date") or job.get("end") or job.get("endDate"),
                "is_current": job.get("is_current") or job.get("current") or (job.get("end_date") is None),
                "location": job.get("location")
            })

    # === Extract Education ===
    # Nyne uses 'schools_info' with 'title' for degree and 'degree' for field
    education_data = data.get("schools_info") or data.get("education") or data.get("schools") or []
    if isinstance(education_data, list):
        for edu in education_data:
            if isinstance(edu, dict):
                profile["education"].append({
                    "school": edu.get("name") or edu.get("school") or edu.get("institution"),
                    "degree": edu.get("title") or edu.get("degree") or edu.get("degree_name"),
                    "field_of_study": edu.get("degree") or edu.get("field_of_study") or edu.get("major") or edu.get("field"),
                    "graduation_year": edu.get("graduation_year") or edu.get("end_date") or edu.get("year"),
                    "description": edu.get("description"),
                    "logo_url": edu.get("logo_url")
                })

    # === Extract Skills ===
    # Nyne puts skills in 'interests.skills'
    interests_obj = data.get("interests") or {}
    if isinstance(interests_obj, dict):
        skills_data = interests_obj.get("skills") or []
    else:
        skills_data = data.get("skills") or data.get("expertise") or data.get("technologies") or []

    if isinstance(skills_data, list):
        for skill in skills_data:
            if isinstance(skill, str):
                profile["skills"].append(skill)
            elif isinstance(skill, dict):
                profile["skills"].append(skill.get("name") or skill.get("skill") or str(skill))

    # === Extract Languages ===
    languages_data = data.get("languages") or []
    if isinstance(languages_data, list):
        for lang in languages_data:
            if isinstance(lang, str):
                profile["languages"].append(lang)
            elif isinstance(lang, dict):
                profile["languages"].append(lang.get("name") or lang.get("language") or str(lang))

    # === Extract Certifications ===
    certs_data = data.get("certifications") or data.get("certificates") or []
    if isinstance(certs_data, list):
        for cert in certs_data:
            if isinstance(cert, str):
                profile["certifications"].append(cert)
            elif isinstance(cert, dict):
                profile["certifications"].append({
                    "name": cert.get("name") or cert.get("title"),
                    "issuer": cert.get("issuer") or cert.get("authority"),
                    "date": cert.get("date") or cert.get("issued_date")
                })

    # === Extract Birthday ===
    profile["birthday"] = data.get("birthday") or data.get("birth_date") or data.get("dob")

    # === Extract Address ===
    profile["address"] = data.get("address") or data.get("street_address")

    # === Extract Vehicle Ownership ===
    profile["vehicle_ownership"] = data.get("vehicle") or data.get("car") or data.get("vehicle_ownership")

    # === Extract LinkedIn Recommendations ===
    recommendations = data.get("recommendations") or data.get("linkedin_recommendations") or []
    if isinstance(recommendations, list):
        for rec in recommendations[:10]:
            if isinstance(rec, dict):
                profile["recommendations"].append({
                    "recommender": rec.get("recommender") or rec.get("name") or rec.get("from"),
                    "relationship": rec.get("relationship") or rec.get("title"),
                    "text": rec.get("text") or rec.get("recommendation") or rec.get("content")
                })
            elif isinstance(rec, str):
                profile["recommendations"].append({"text": rec})

    # === Extract Volunteering ===
    volunteering = data.get("volunteering") or data.get("volunteer_experience") or []
    if isinstance(volunteering, list):
        for vol in volunteering:
            if isinstance(vol, dict):
                profile["volunteering"].append({
                    "organization": vol.get("organization") or vol.get("org") or vol.get("company"),
                    "role": vol.get("role") or vol.get("title"),
                    "cause": vol.get("cause") or vol.get("category"),
                    "description": vol.get("description")
                })

    # === Extract Causes ===
    causes = data.get("causes") or data.get("supported_causes") or []
    if isinstance(causes, list):
        profile["causes"] = [c if isinstance(c, str) else c.get("name", str(c)) for c in causes]

    # === Extract Additional Social Profiles ===
    for platform in ["strava", "pinterest", "flickr"]:
        url = data.get(f"{platform}_url") or data.get(platform)
        if url:
            profile["social_profiles"][platform] = url

    # === Extract Twitter Following (from /person/interactions) ===
    social_interactions = data.get("social_interactions") or {}
    following = social_interactions.get("following") or social_interactions.get("twitter_following") or []
    if isinstance(following, list):
        for account in following[:100]:  # Cap at 100
            if isinstance(account, dict):
                profile["twitter_following"].append({
                    "name": account.get("name") or account.get("screen_name"),
                    "handle": account.get("handle") or account.get("screen_name") or account.get("username"),
                    "bio": account.get("bio") or account.get("description"),
                    "followers": account.get("followers") or account.get("follower_count"),
                    "category": account.get("category")  # If Nyne categorizes them
                })

    # === Extract Press Mentions (from /person/articlesearch) ===
    press_data = data.get("press_mentions") or {}
    articles = press_data.get("articles") or press_data.get("results") or []
    if isinstance(articles, list):
        for article in articles[:20]:
            if isinstance(article, dict):
                profile["press_mentions"].append({
                    "title": article.get("title") or article.get("headline"),
                    "source": article.get("source") or article.get("publisher") or article.get("domain"),
                    "url": article.get("url") or article.get("link"),
                    "date": article.get("date") or article.get("published_date") or article.get("timestamp"),
                    "snippet": article.get("snippet") or article.get("excerpt") or article.get("description")
                })

    # === Extract Newsfeed / Recent Posts ===
    # Nyne uses 'newsfeed' with 'date_posted' and 'content'
    newsfeed = data.get("newsfeed") or data.get("posts") or data.get("recent_activity") or []
    if isinstance(newsfeed, list):
        for post in newsfeed[:20]:  # Cap at 20 posts
            if isinstance(post, dict):
                profile["recent_posts"].append({
                    "platform": post.get("platform") or post.get("source") or "linkedin",
                    "content": post.get("content") or post.get("text") or post.get("body"),
                    "url": post.get("url") or post.get("link"),
                    "date": post.get("date_posted") or post.get("date") or post.get("timestamp") or post.get("created_at"),
                    "engagement": post.get("likes") or post.get("engagement")
                })
            elif isinstance(post, str):
                profile["recent_posts"].append({"content": post, "platform": "unknown"})

    # === Extract Confidence Score ===
    profile["confidence_score"] = data.get("probability_score") or data.get("confidence") or data.get("match_score")

    # === Infer Civic Interests ===
    interests = set()

    job_title = (profile["profession"] or "").lower()
    industry = (profile["industry"] or "").lower()
    bio_text = (profile["bio"] or "").lower()
    headline_text = (profile["headline"] or "").lower()
    skills = profile["skills"]

    # Combine text for analysis
    all_text = f"{job_title} {industry} {bio_text} {headline_text}"

    # Tech-related
    if any(kw in all_text for kw in ["engineer", "developer", "software", "data", "ai", "ml", "tech", "programming"]):
        interests.update(["technology", "ai_policy"])

    # Finance
    if any(kw in all_text for kw in ["finance", "analyst", "investment", "banking", "accountant", "financial"]):
        interests.update(["budget", "taxes", "housing"])

    # Legal/Policy
    if any(kw in all_text for kw in ["lawyer", "attorney", "policy", "government", "legal", "law", "civic"]):
        interests.update(["legislation", "civic"])

    # Education
    if any(kw in all_text for kw in ["teacher", "professor", "education", "instructor", "school", "university"]):
        interests.update(["education", "families"])

    # Healthcare
    if any(kw in all_text for kw in ["doctor", "nurse", "health", "medical", "physician", "hospital", "healthcare"]):
        interests.update(["healthcare", "families"])

    # Real Estate / Housing
    if any(kw in all_text for kw in ["real estate", "realtor", "property", "broker", "housing", "rent"]):
        interests.update(["housing", "neighborhoods", "zoning"])

    # Construction / Urban
    if any(kw in all_text for kw in ["architect", "construction", "urban", "planner", "city planning"]):
        interests.update(["housing", "zoning", "neighborhoods"])

    # Transportation
    if any(kw in all_text for kw in ["transportation", "transit", "bike", "traffic", "commute"]):
        interests.update(["transportation", "traffic", "bike_lanes"])

    # Environment
    if any(kw in all_text for kw in ["environment", "climate", "sustainability", "green", "renewable"]):
        interests.update(["environment", "climate"])

    # Nonprofit / Community
    if any(kw in all_text for kw in ["nonprofit", "social", "community", "advocacy", "volunteer"]):
        interests.update(["civic", "neighborhoods", "families"])

    # Analyze recent posts for additional interests
    for post in profile["recent_posts"]:
        post_content = (post.get("content") or "").lower()
        if any(kw in post_content for kw in ["housing", "rent", "apartment"]):
            interests.add("housing")
        if any(kw in post_content for kw in ["bike", "transit", "muni", "bart"]):
            interests.add("transportation")
        if any(kw in post_content for kw in ["ai", "tech", "startup"]):
            interests.add("technology")
        if any(kw in post_content for kw in ["climate", "environment", "green"]):
            interests.add("environment")
        if any(kw in post_content for kw in ["school", "education", "kids"]):
            interests.add("education")

    # === Analyze Twitter Following (Psychographic Gold) ===
    for account in profile["twitter_following"]:
        account_bio = (account.get("bio") or "").lower()
        account_name = (account.get("name") or "").lower()
        combined = f"{account_bio} {account_name}"

        # Political / Civic
        if any(kw in combined for kw in ["politics", "senator", "mayor", "council", "civic", "voter", "democrat", "republican"]):
            interests.add("civic")
        # News / Journalism
        if any(kw in combined for kw in ["journalist", "reporter", "news", "sfchronicle", "sfexaminer"]):
            interests.add("civic")
        # Tech
        if any(kw in combined for kw in ["tech", "startup", "founder", "vc", "engineer", "ai", "crypto"]):
            interests.add("technology")
        # Environment
        if any(kw in combined for kw in ["climate", "environment", "green", "sustainability"]):
            interests.add("environment")
        # Sports / Fitness
        if any(kw in combined for kw in ["fitness", "running", "cycling", "warriors", "49ers", "giants"]):
            interests.add("recreation")
        # Housing / Urban
        if any(kw in combined for kw in ["housing", "yimby", "nimby", "urban", "zoning", "transit"]):
            interests.update(["housing", "transportation"])
        # Education
        if any(kw in combined for kw in ["teacher", "education", "school", "university"]):
            interests.add("education")

    # === Analyze Causes/Volunteering ===
    for cause in profile["causes"]:
        cause_lower = cause.lower() if isinstance(cause, str) else ""
        if any(kw in cause_lower for kw in ["environment", "climate", "nature"]):
            interests.add("environment")
        if any(kw in cause_lower for kw in ["education", "children", "youth"]):
            interests.update(["education", "families"])
        if any(kw in cause_lower for kw in ["poverty", "hunger", "homeless"]):
            interests.update(["housing", "civic"])
        if any(kw in cause_lower for kw in ["health", "medical"]):
            interests.add("healthcare")
        if any(kw in cause_lower for kw in ["civil rights", "human rights", "equality"]):
            interests.add("civic")

    for vol in profile["volunteering"]:
        vol_text = f"{vol.get('organization', '')} {vol.get('cause', '')} {vol.get('role', '')}".lower()
        if any(kw in vol_text for kw in ["housing", "shelter", "homeless"]):
            interests.add("housing")
        if any(kw in vol_text for kw in ["education", "tutor", "mentor", "school"]):
            interests.add("education")
        if any(kw in vol_text for kw in ["environment", "clean", "green"]):
            interests.add("environment")

    # === Analyze Press Mentions ===
    for article in profile["press_mentions"]:
        article_text = f"{article.get('title', '')} {article.get('snippet', '')}".lower()
        if any(kw in article_text for kw in ["housing", "real estate", "rent"]):
            interests.add("housing")
        if any(kw in article_text for kw in ["tech", "startup", "ai", "innovation"]):
            interests.add("technology")
        if any(kw in article_text for kw in ["policy", "legislation", "government"]):
            interests.add("legislation")

    # Skills-based interests
    skill_interest_map = {
        "public policy": "legislation",
        "government": "civic",
        "urban planning": "zoning",
        "sustainability": "environment",
        "renewable": "environment",
        "education": "education",
        "real estate": "housing",
        "machine learning": "ai_policy",
        "artificial intelligence": "ai_policy",
    }
    for skill in skills[:15]:
        skill_lower = skill.lower()
        for keyword, interest in skill_interest_map.items():
            if keyword in skill_lower:
                interests.add(interest)

    # Default interests if none found
    if not interests:
        interests = {"neighborhoods", "housing", "legislation"}

    profile["interests"] = list(interests)[:20]  # Cap at 20 interests

    return profile


def _mock_enrichment(email: str, linkedin_url: Optional[str] = None) -> dict:
    """
    Mock enrichment for development/demo purposes.
    Uses email domain to infer likely profession and interests.
    """
    domain = email.split("@")[-1].lower() if "@" in email else ""

    # Default profile
    profile = {
        "profession": None,
        "likely_location": "San Francisco",
        "interests": [],
        "confidence": "mock"
    }

    # Infer from email domain
    tech_domains = ["google.com", "meta.com", "apple.com", "microsoft.com",
                    "stripe.com", "airbnb.com", "uber.com", "lyft.com",
                    "anthropic.com", "openai.com", "salesforce.com"]

    finance_domains = ["jpmorgan.com", "goldmansachs.com", "wellsfargo.com"]

    edu_domains = [".edu"]

    if any(d in domain for d in tech_domains):
        profile["profession"] = "Software Engineer"
        profile["interests"] = ["technology", "ai_policy", "transportation"]
        profile["likely_location"] = "San Francisco, SoMa"
    elif any(d in domain for d in finance_domains):
        profile["profession"] = "Finance Professional"
        profile["interests"] = ["budget", "taxes", "housing"]
        profile["likely_location"] = "San Francisco, FiDi"
    elif any(d in domain for d in edu_domains):
        profile["profession"] = "Educator"
        profile["interests"] = ["education", "families", "budget"]
        profile["likely_location"] = "San Francisco"
    elif "gmail.com" in domain or "yahoo.com" in domain:
        profile["profession"] = None
        profile["interests"] = ["neighborhoods", "housing"]
    else:
        profile["profession"] = "Professional"
        profile["interests"] = ["legislation", "neighborhoods"]

    return profile


def generate_followup_questions(inferred: dict) -> list[str]:
    """
    Generate personalized follow-up questions based on what we
    couldn't infer from the enrichment data.
    """
    questions = []

    if not inferred.get("profession"):
        questions.append("What is your profession or industry?")

    # Always ask these for civic matching
    questions.append("Do you own a car? (Affects parking/transit policy relevance)")
    questions.append("Do you rent or own your home? (Affects housing policy relevance)")
    questions.append("Do you have children under 18? (Affects education/family policy relevance)")

    # If we detected tech, ask about specific interests
    if "technology" in inferred.get("interests", []):
        questions.append("Are you interested in AI regulation and oversight?")

    # Location-specific
    questions.append("What's your zip code? (To show hyper-local issues)")

    return questions[:4]  # Limit to 4 questions for UX
