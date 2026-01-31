"""
Hyperspell Integration Router

Provides token generation for Hyperspell OAuth connect flow.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from hyperspell import Hyperspell

from config import HYPERSPELL_API_KEY

router = APIRouter(prefix="/hyperspell")


class TokenRequest(BaseModel):
    email: EmailStr  # Using email as user_id per spec


class TokenResponse(BaseModel):
    token: str


@router.post("/token", response_model=TokenResponse)
async def get_hyperspell_token(request: TokenRequest):
    """
    Generate a Hyperspell user token for the OAuth connect flow.

    The frontend should call this endpoint, then redirect to:
    https://connect.hyperspell.com?token={token}&redirect_uri={returnUrl}
    """
    if not HYPERSPELL_API_KEY:
        raise HTTPException(status_code=500, detail="Hyperspell API key not configured")

    try:
        hyperspell = Hyperspell(api_key=HYPERSPELL_API_KEY)
        response = hyperspell.auth.user_token(user_id=request.email)
        return TokenResponse(token=response.token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate token: {str(e)}")
