/**
 * Fulcrum.ai API Client
 * Connects frontend to FastAPI backend
 * Falls back to local JSON files when backend is unavailable
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// === Type Definitions (matching backend models) ===

export interface SocialProfiles {
  linkedin?: string | { url?: string; username?: string; [key: string]: unknown };
  twitter?: string | { url?: string; username?: string; [key: string]: unknown };
  github?: string | { url?: string; username?: string; [key: string]: unknown };
  facebook?: string | { url?: string; username?: string; [key: string]: unknown };
  instagram?: string | { url?: string; username?: string; [key: string]: unknown };
  strava?: string | null;
  pinterest?: string | null;
  flickr?: string | null;
  other?: Array<{ platform: string; url: string }>;
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
  email_verified?: string | null;
  phone?: string | null;
  profile_photo?: string | null;
  headline?: string;
  bio?: string;
  birthday?: string | { year?: number; month?: number; day?: number };

  // Professional
  profession?: string;
  company?: string | null;
  company_domain?: string | null;
  company_size?: string | null;
  company_industry?: string | null;
  industry?: string | null;
  seniority?: string | null;
  years_experience?: number | null;

  // Location
  likely_location?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string | null;
  address?: string | { city?: string; state?: string; country?: string };

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
  confidence_score?: number | null;
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
  recommended_action?: string;
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

// === Fallback Data Loaders ===

/**
 * Load fallback profile data from local JSON (Garry Tan's profile)
 */
async function loadFallbackProfile(): Promise<InferredProfile> {
  const response = await fetch('/fallback-profile.json');
  if (!response.ok) {
    throw new Error('Failed to load fallback profile');
  }
  return response.json();
}

/**
 * Load fallback civic events from local JSON (SF events)
 */
async function loadFallbackEvents(): Promise<DashboardResponse> {
  const response = await fetch('/fallback-events.json');
  if (!response.ok) {
    throw new Error('Failed to load fallback events');
  }
  return response.json();
}

// === API Functions with Fallback ===

/**
 * Enrich user profile from email/LinkedIn via Nyne.ai
 * Falls back to local JSON if backend unavailable
 */
export async function onboard(email: string, linkedinUrl?: string): Promise<OnboardResponse> {
  try {
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
      throw new Error('API request failed');
    }

    return response.json();
  } catch (error) {
    console.warn('Backend unavailable, using fallback profile data:', error);

    // Load fallback profile (Garry Tan's data)
    const fallbackProfile = await loadFallbackProfile();

    return {
      inferred: fallbackProfile,
      questions_to_ask: [
        "Do you own a car? (Affects parking/transit policy relevance)",
        "Do you rent or own your home? (Affects housing policy relevance)",
        "Do you have children under 18? (Affects education/family policy relevance)",
      ],
    };
  }
}

/**
 * Save confirmed user profile to database
 * Silently succeeds if backend unavailable (demo mode)
 */
export async function confirmProfile(data: ConfirmProfileRequest): Promise<ConfirmProfileResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/confirm-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return response.json();
  } catch (error) {
    console.warn('Backend unavailable, skipping profile save (demo mode):', error);

    // Return success for demo purposes
    return {
      success: true,
      user_id: 'demo-user',
      message: 'Profile saved (demo mode)',
    };
  }
}

/**
 * Get personalized civic events for user dashboard
 * Falls back to local JSON if backend unavailable
 */
export async function getDashboard(email: string): Promise<DashboardResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return response.json();
  } catch (error) {
    console.warn('Backend unavailable, using fallback civic events:', error);

    // Load fallback events (SF civic events)
    return loadFallbackEvents();
  }
}

/**
 * Health check for backend connectivity
 */
export async function healthCheck(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  } catch {
    return { status: 'unavailable - using fallback data' };
  }
}
