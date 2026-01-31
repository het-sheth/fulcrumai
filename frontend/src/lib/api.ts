/**
 * Fulcrum.ai API Client
 * Connects frontend to FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// === Type Definitions (matching backend models) ===

export interface SocialProfiles {
  linkedin?: string;
  twitter?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  strava?: string;
  pinterest?: string;
  flickr?: string;
  other?: string[];
}

export interface WorkExperience {
  company?: string;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
}

export interface Education {
  school?: string;
  degree?: string;
  field_of_study?: string;
  graduation_year?: string;
  description?: string;
}

export interface InferredProfile {
  // Basic info
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email_verified?: string;
  phone?: string;
  profile_photo?: string;
  headline?: string;
  bio?: string;
  birthday?: string;

  // Professional
  profession?: string;
  company?: string;
  company_domain?: string;
  company_size?: string;
  company_industry?: string;
  industry?: string;
  seniority?: string;
  years_experience?: number;

  // Location
  likely_location?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  address?: string;

  // Social
  social_profiles?: SocialProfiles;

  // History
  work_history?: WorkExperience[];
  education?: Education[];
  skills?: string[];
  languages?: string[];
  causes?: string[];

  // Inferred interests for civic matching
  interests?: string[];

  // Metadata
  confidence_score?: number;
  data_source?: string;
}

export interface OnboardResponse {
  inferred: InferredProfile;
  questions_to_ask: string[];
}

export interface ConfirmProfileRequest {
  email: string;
  zip_code?: string;
  has_car?: boolean;
  has_kids?: boolean;
  profession?: string;
  interests?: string[];
}

export interface ConfirmProfileResponse {
  success: boolean;
  user_id: string;
  message: string;
}

export interface CivicEvent {
  id: string;
  source_url: string;
  title: string;
  summary?: string;
  impact_tags: string[];
  urgency: string;
  event_date?: string;
  source_type?: string;
  location?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  zip_code?: string;
  has_car?: boolean;
  has_kids?: boolean;
  profession?: string;
  interests?: string[];
}

export interface DashboardResponse {
  user: UserProfile;
  events: CivicEvent[];
  match_explanation?: string;
}

// === API Functions ===

/**
 * Enrich user profile from email/LinkedIn via Nyne.ai
 * Does NOT save user - call confirmProfile after user reviews
 */
export async function onboard(email: string, linkedinUrl?: string): Promise<OnboardResponse> {
  const response = await fetch(`${API_BASE_URL}/onboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      linkedin_url: linkedinUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to onboard user');
  }

  return response.json();
}

/**
 * Save confirmed user profile to database
 * Call after user reviews inferred data and answers questions
 */
export async function confirmProfile(data: ConfirmProfileRequest): Promise<ConfirmProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/confirm-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to save profile');
  }

  return response.json();
}

/**
 * Get personalized civic events for user dashboard
 */
export async function getDashboard(email: string): Promise<DashboardResponse> {
  const response = await fetch(`${API_BASE_URL}/dashboard/${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to load dashboard');
  }

  return response.json();
}

/**
 * Health check for backend connectivity
 */
export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}
