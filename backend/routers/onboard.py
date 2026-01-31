"""
POST /onboard - User onboarding with profile enrichment
"""
from fastapi import APIRouter, HTTPException
from ..models import OnboardRequest, OnboardResponse, InferredProfile
from ..services.nyne import enrich_profile, generate_followup_questions

router = APIRouter()


@router.post("/onboard", response_model=OnboardResponse)
async def onboard_user(request: OnboardRequest):
    """
    Enrich user profile from email/LinkedIn and return inferred data.

    This does NOT save the user yet - that happens in /confirm-profile
    after the user reviews and confirms the inferred data.
    """
    try:
        # Call Nyne.ai (or mock) for enrichment
        enriched = await enrich_profile(
            email=request.email,
            linkedin_url=request.linkedin_url
        )

        # Build inferred profile
        inferred = InferredProfile(
            profession=enriched.get("profession"),
            likely_location=enriched.get("likely_location"),
            interests=enriched.get("interests", [])
        )

        # Generate personalized follow-up questions
        questions = generate_followup_questions(enriched)

        return OnboardResponse(
            inferred=inferred,
            questions_to_ask=questions
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enrichment failed: {str(e)}")
