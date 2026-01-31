"""
POST /onboard - User onboarding with Nyne + LLM profile enrichment

This endpoint:
1. Takes email + LinkedIn URL
2. Calls Nyne API to enrich the profile (3 endpoints)
3. Runs LLM analysis for civic interests
4. Creates/updates user in database with all enriched data
5. Returns the enriched profile + follow-up questions
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from models import InferredProfile
from services.nyne import enrich_profile, generate_followup_questions
from services.supabase_client import get_supabase

router = APIRouter()


class OnboardRequest(BaseModel):
    email: EmailStr
    linkedin_url: Optional[str] = None


class LLMInsights(BaseModel):
    """LLM-generated civic insights"""
    primary_interests: list[str] = []
    secondary_interests: list[str] = []
    engagement_level: Optional[str] = None
    summary: Optional[str] = None
    likely_stance: dict = {}
    civic_analysis: Optional[str] = None


class OnboardFullResponse(BaseModel):
    """Extended response with user creation status and LLM insights"""
    success: bool
    user_id: Optional[str] = None
    inferred: InferredProfile
    llm_insights: Optional[LLMInsights] = None
    questions_to_ask: list[str]
    message: str


async def run_llm_enrichment(nyne_data: dict) -> dict:
    """
    Run LLM enrichment on Nyne data to generate civic insights.
    """
    try:
        from services.llm_enrichment import generate_quick_interests, generate_civic_profile

        llm_result = {
            "quick_interests": None,
            "civic_profile": None
        }

        # Quick interests (fast, structured)
        quick_result = await generate_quick_interests(nyne_data)
        if quick_result and quick_result.get("success"):
            llm_result["quick_interests"] = quick_result

        # Full civic profile (slower, comprehensive)
        civic_result = await generate_civic_profile(nyne_data)
        if civic_result and civic_result.get("success"):
            llm_result["civic_profile"] = civic_result

        return llm_result

    except Exception as e:
        print(f"LLM enrichment error: {e}")
        return {}


@router.post("/onboard", response_model=OnboardFullResponse)
async def onboard_user(request: OnboardRequest):
    """
    Enrich user profile from email/LinkedIn and save to database.

    This endpoint:
    1. Calls Nyne.ai to enrich profile (3 API endpoints):
       - /person/enrichment - Profile, career, education, posts
       - /person/interactions - Twitter following (psychographic)
       - /person/articlesearch - Press mentions
    2. Runs LLM analysis to generate civic interests
    3. Creates or updates user in database with all data
    4. Returns enriched profile + personalized follow-up questions
    """
    try:
        # Step 1: Call Nyne.ai for comprehensive enrichment
        print(f"Starting enrichment for: {request.email}")
        enriched = await enrich_profile(
            email=request.email,
            linkedin_url=request.linkedin_url
        )

        # Step 2: Run LLM enrichment for civic insights
        print("Running LLM civic analysis...")
        llm_data = await run_llm_enrichment(enriched)

        # Merge LLM insights into enriched data
        if llm_data.get("quick_interests"):
            qi = llm_data["quick_interests"]
            # Add LLM-generated interests to the main interests list
            llm_interests = qi.get("primary_interests", []) + qi.get("secondary_interests", [])
            existing_interests = enriched.get("interests", [])
            # Combine and deduplicate
            all_interests = list(set(existing_interests + llm_interests))
            enriched["interests"] = all_interests
            enriched["llm_quick_interests"] = qi

        if llm_data.get("civic_profile"):
            enriched["llm_civic_profile"] = llm_data["civic_profile"]

        # Step 3: Build inferred profile response
        inferred = InferredProfile(
            # Basic info
            full_name=enriched.get("full_name"),
            first_name=enriched.get("first_name"),
            last_name=enriched.get("last_name"),
            email_verified=enriched.get("email_verified"),
            phone=enriched.get("phone"),
            profile_photo=enriched.get("profile_photo"),
            headline=enriched.get("headline"),
            bio=enriched.get("bio"),
            birthday=enriched.get("birthday"),

            # Professional
            profession=enriched.get("profession"),
            company=enriched.get("company"),
            company_domain=enriched.get("company_domain"),
            company_size=enriched.get("company_size"),
            company_industry=enriched.get("company_industry"),
            industry=enriched.get("industry"),
            seniority=enriched.get("seniority"),
            years_experience=enriched.get("years_experience"),

            # Location
            likely_location=enriched.get("likely_location"),
            city=enriched.get("city"),
            state=enriched.get("state"),
            country=enriched.get("country"),
            timezone=enriched.get("timezone"),

            # Social profiles
            social_profiles=enriched.get("social_profiles"),

            # History
            work_history=enriched.get("work_history", []),
            education=enriched.get("education", []),
            skills=enriched.get("skills", []),
            languages=enriched.get("languages", []),
            certifications=enriched.get("certifications", []),

            # LinkedIn specific
            recommendations=enriched.get("recommendations", []),
            volunteering=enriched.get("volunteering", []),
            causes=enriched.get("causes", []),

            # Social interactions (psychographic data)
            twitter_following=enriched.get("twitter_following", []),
            press_mentions=enriched.get("press_mentions", []),
            recent_posts=enriched.get("recent_posts", []),

            # Civic interests (combined Nyne + LLM)
            interests=enriched.get("interests", []),

            # Metadata
            confidence_score=enriched.get("confidence_score"),
            data_source=enriched.get("data_source", "unknown"),
        )

        # Build LLM insights for response
        llm_insights = None
        if llm_data.get("quick_interests"):
            qi = llm_data["quick_interests"]
            llm_insights = LLMInsights(
                primary_interests=qi.get("primary_interests", []),
                secondary_interests=qi.get("secondary_interests", []),
                engagement_level=qi.get("engagement_level"),
                summary=qi.get("summary"),
                likely_stance=qi.get("likely_stance", {}),
                civic_analysis=llm_data.get("civic_profile", {}).get("civic_analysis")
            )

        # Step 4: Store in database (including raw_data for debugging)
        # Remove raw_data from storage to avoid size issues
        enriched_for_storage = {k: v for k, v in enriched.items() if k != "raw_data"}

        user_data = {
            "email": request.email,
            "linkedin_url": request.linkedin_url,
            "profession": enriched.get("profession"),
            "interests": enriched.get("interests", []),
            "inferred_data": enriched_for_storage  # Store full enrichment as JSONB
        }

        # Create or update user
        client = get_supabase()
        existing = client.table("users").select("id").eq("email", request.email).execute()

        if existing.data and len(existing.data) > 0:
            # Update existing user
            result = client.table("users").update(user_data).eq("email", request.email).execute()
            user_id = existing.data[0]["id"]
            message = "User profile updated with Nyne + LLM enrichment"
        else:
            # Create new user
            result = client.table("users").insert(user_data).execute()
            user_id = result.data[0]["id"] if result.data else None
            message = "User created with Nyne + LLM enrichment"

        # Step 5: Generate personalized follow-up questions
        questions = generate_followup_questions(enriched)

        print(f"Enrichment complete for {request.email}: {len(enriched.get('interests', []))} interests")

        return OnboardFullResponse(
            success=True,
            user_id=user_id,
            inferred=inferred,
            llm_insights=llm_insights,
            questions_to_ask=questions,
            message=message
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Enrichment failed: {str(e)}")


@router.post("/enrich", response_model=OnboardFullResponse)
async def enrich_user(request: OnboardRequest):
    """
    Alias for /onboard - enriches and saves user profile.

    Use this endpoint from the frontend to:
    1. Send email + LinkedIn URL
    2. Get back enriched profile with interests
    3. User data is automatically saved to database
    """
    return await onboard_user(request)


@router.get("/user/{email}")
async def get_user_profile(email: str):
    """
    Get a user's full profile including inferred data.
    """
    try:
        client = get_supabase()
        result = client.table("users").select("*").eq("email", email).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail=f"User not found: {email}")

        user = result.data[0]
        inferred = user.get("inferred_data") or {}

        return {
            "success": True,
            "user": {
                "id": user.get("id"),
                "email": user.get("email"),
                "profession": user.get("profession"),
                "interests": user.get("interests", []),
                "zip_code": user.get("zip_code"),
                "has_car": user.get("has_car"),
                "has_kids": user.get("has_kids"),
                "linkedin_url": user.get("linkedin_url"),
                "created_at": user.get("created_at"),
                "updated_at": user.get("updated_at")
            },
            "inferred_profile": {
                "full_name": inferred.get("full_name"),
                "headline": inferred.get("headline"),
                "bio": inferred.get("bio"),
                "company": inferred.get("company"),
                "industry": inferred.get("industry"),
                "likely_location": inferred.get("likely_location"),
                "skills": inferred.get("skills", []),
                "work_history": inferred.get("work_history", []),
                "education": inferred.get("education", []),
                "social_profiles": inferred.get("social_profiles"),
                "twitter_following": inferred.get("twitter_following", [])[:10],  # Limit for response size
                "press_mentions": inferred.get("press_mentions", []),
                "recent_posts": inferred.get("recent_posts", []),
                "volunteering": inferred.get("volunteering", []),
                "causes": inferred.get("causes", []),
                "confidence_score": inferred.get("confidence_score"),
                "data_source": inferred.get("data_source")
            },
            "llm_insights": {
                "quick_interests": inferred.get("llm_quick_interests"),
                "civic_profile": inferred.get("llm_civic_profile")
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")
