export interface UserProfile {
  email: string;
  profession: string;
  location: string;
  interests: string[];
  hasCar: boolean;
  housingStatus: 'rent' | 'own' | null;
  hasKids: boolean;
}

export interface InferredProfile {
  profession: string;
  likely_location: string;
  interests: string[];
  avatar?: string;
}

export interface CivicEvent {
  id: string;
  title: string;
  summary: string;
  urgency: 'High' | 'Medium' | 'Low';
  impact_tags: string[];
  deadline?: string;
  source_url: string;
  personalizedReason?: string;
}

export type AppState = 'landing' | 'loading' | 'mirror' | 'questions' | 'dashboard';
