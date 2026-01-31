"""
Pydantic models for Fulcrum.ai API
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# === Request Models ===

class OnboardRequest(BaseModel):
    email: EmailStr
    linkedin_url: Optional[str] = None


class ConfirmProfileRequest(BaseModel):
    email: EmailStr
    zip_code: Optional[str] = None
    has_car: Optional[bool] = None
    has_kids: Optional[bool] = None
    profession: Optional[str] = None
    interests: list[str] = []


# === Response Models ===

class SocialProfiles(BaseModel):
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    github: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    strava: Optional[str] = None
    pinterest: Optional[str] = None
    flickr: Optional[str] = None
    other: list = []


class WorkExperience(BaseModel):
    company: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    location: Optional[str] = None


class Education(BaseModel):
    school: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None
    description: Optional[str] = None


class Certification(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    date: Optional[str] = None


class Recommendation(BaseModel):
    recommender: Optional[str] = None
    relationship: Optional[str] = None
    text: Optional[str] = None


class Volunteering(BaseModel):
    organization: Optional[str] = None
    role: Optional[str] = None
    cause: Optional[str] = None
    description: Optional[str] = None


class TwitterAccount(BaseModel):
    name: Optional[str] = None
    handle: Optional[str] = None
    bio: Optional[str] = None
    followers: Optional[int] = None
    category: Optional[str] = None


class PressMention(BaseModel):
    title: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None
    date: Optional[str] = None
    snippet: Optional[str] = None


class SocialPost(BaseModel):
    platform: Optional[str] = None
    content: Optional[str] = None
    url: Optional[str] = None
    date: Optional[str] = None
    engagement: Optional[int] = None


class InferredProfile(BaseModel):
    # Basic info
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email_verified: Optional[str] = None
    phone: Optional[str] = None
    profile_photo: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    birthday: Optional[str] = None

    # Professional
    profession: Optional[str] = None
    company: Optional[str] = None
    company_domain: Optional[str] = None
    company_size: Optional[str] = None
    company_industry: Optional[str] = None
    industry: Optional[str] = None
    seniority: Optional[str] = None
    years_experience: Optional[int] = None

    # Location
    likely_location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None
    address: Optional[str] = None

    # Social & online presence
    social_profiles: Optional[SocialProfiles] = None

    # History
    work_history: list[WorkExperience] = []
    education: list[Education] = []
    skills: list[str] = []
    languages: list[str] = []
    certifications: list = []

    # LinkedIn specific
    linkedin_posts: list[SocialPost] = []
    recommendations: list[Recommendation] = []
    volunteering: list[Volunteering] = []
    causes: list[str] = []

    # Personal
    vehicle_ownership: Optional[str] = None

    # Social interactions (psychographic data)
    twitter_following: list[TwitterAccount] = []

    # Press mentions
    press_mentions: list[PressMention] = []

    # Recent posts from all platforms
    recent_posts: list[SocialPost] = []

    # Inferred for civic matching
    interests: list[str] = []

    # Metadata
    confidence_score: Optional[float] = None
    data_source: str = "unknown"
    raw_data: Optional[dict] = None


class OnboardResponse(BaseModel):
    inferred: InferredProfile
    questions_to_ask: list[str]


class ConfirmProfileResponse(BaseModel):
    success: bool
    user_id: str
    message: str


class CivicEvent(BaseModel):
    id: str
    source_url: str
    title: str
    summary: Optional[str] = None
    impact_tags: list[str] = []
    urgency: str
    event_date: Optional[datetime] = None
    source_type: Optional[str] = None
    location: Optional[str] = None


class UserProfile(BaseModel):
    id: str
    email: str
    zip_code: Optional[str] = None
    has_car: Optional[bool] = None
    has_kids: Optional[bool] = None
    profession: Optional[str] = None
    interests: list[str] = []


class DashboardResponse(BaseModel):
    user: UserProfile
    events: list[CivicEvent]
    match_explanation: Optional[str] = None
