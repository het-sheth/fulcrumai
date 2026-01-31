import { useState } from 'react';
import { Landing } from './pages/Landing';
import { Mirror } from './pages/Mirror';
import { Questions } from './pages/Questions';
import { Dashboard } from './pages/Dashboard';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { AppState, InferredProfile, UserProfile } from './types';

// Mock inferred profile - in production this comes from Nyne.ai
const mockInferredProfile: InferredProfile = {
  profession: 'Software Engineer',
  likely_location: 'San Francisco, Mission District',
  interests: ['Tech Policy', 'Housing', 'Transportation'],
};

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [email, setEmail] = useState('');
  const [inferredProfile] = useState<InferredProfile>(mockInferredProfile);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setAppState('loading');

    // Fake delay for effect (as specified)
    setTimeout(() => {
      setAppState('mirror');
    }, 2000);
  };

  const handleProfileConfirm = () => {
    setAppState('questions');
  };

  const handleProfileEdit = () => {
    // For now, just proceed to questions
    setAppState('questions');
  };

  const handleQuestionsComplete = (answers: {
    hasCar: boolean;
    housingStatus: 'rent' | 'own';
    hasKids: boolean;
  }) => {
    const profile: UserProfile = {
      email,
      profession: inferredProfile.profession,
      location: inferredProfile.likely_location,
      interests: inferredProfile.interests,
      hasCar: answers.hasCar,
      housingStatus: answers.housingStatus,
      hasKids: answers.hasKids,
    };
    setUserProfile(profile);
    setAppState('dashboard');
  };

  switch (appState) {
    case 'landing':
      return <Landing onSubmit={handleEmailSubmit} />;

    case 'loading':
      return <LoadingSpinner />;

    case 'mirror':
      return (
        <Mirror
          profile={inferredProfile}
          onConfirm={handleProfileConfirm}
          onEdit={handleProfileEdit}
        />
      );

    case 'questions':
      return <Questions onComplete={handleQuestionsComplete} />;

    case 'dashboard':
      return userProfile ? <Dashboard profile={userProfile} /> : <LoadingSpinner />;

    default:
      return <Landing onSubmit={handleEmailSubmit} />;
  }
}

export default App;
