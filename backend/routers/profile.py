"""
POST /confirm-profile - Save confirmed user profile
"""
from fastapi import APIRouter, HTTPException
from ..models import ConfirmProfileRequest, ConfirmProfileResponse
from ..services.supabase_client import create_or_update_user

router = APIRouter()


@router.post("/confirm-profile", response_model=ConfirmProfileResponse)
async def confirm_profile(request: ConfirmProfileRequest):
    """
    Save the user's confirmed profile to the database.

    Called after the user reviews the inferred data from /onboard
    and answers follow-up questions.
    """
    try:
        user_data = {
            "email": request.email,
            "zip_code": request.zip_code,
            "has_car": request.has_car,
            "has_kids": request.has_kids,
            "profession": request.profession,
            "interests": request.interests
        }

        # Remove None values
        user_data = {k: v for k, v in user_data.items() if v is not None}

        result = await create_or_update_user(user_data)

        return ConfirmProfileResponse(
            success=True,
            user_id=result.get("id", ""),
            message="Profile saved successfully"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")
