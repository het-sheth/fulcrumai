import { useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { HeroSection } from "@/components/landing/HeroSection";
import { ScanningOverlay } from "@/components/scanning/ScanningOverlay";
import { VerificationCards, VerificationAnswers } from "@/components/verification/VerificationCards";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { onboard, confirmProfile, InferredProfile } from "@/lib/api";

type AppState = "landing" | "scanning" | "verification" | "dashboard";

export interface UserProfile extends VerificationAnswers {
  email: string;
  linkedin: string;
  enrichedProfile?: InferredProfile;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: "",
    linkedin: "",
    drives: false,
    owns: false,
    hasChildren: false,
    usesTransit: false,
    bikeCommutes: false,
    isSmallBusinessOwner: false,
    concernedAboutSafety: false,
    usesParks: false,
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const onboardPromiseRef = useRef<Promise<void> | null>(null);

  const handleAnalyze = async (email: string, linkedin: string) => {
    setUserProfile((prev) => ({ ...prev, email, linkedin }));
    setAppState("scanning");
    setApiError(null);

    // Start API call in background while scanning animation plays
    onboardPromiseRef.current = (async () => {
      try {
        const response = await onboard(email, linkedin || undefined);
        setUserProfile((prev) => ({
          ...prev,
          enrichedProfile: response.inferred,
        }));
      } catch (error) {
        console.error("Onboard API error:", error);
        setApiError(error instanceof Error ? error.message : "Failed to analyze profile");
        // Continue with flow even if API fails - we'll use mock data
      }
    })();
  };

  const handleScanComplete = async () => {
    // Wait for API call to complete before moving to verification
    if (onboardPromiseRef.current) {
      await onboardPromiseRef.current;
    }
    setAppState("verification");
  };

  const handleVerificationComplete = async (answers: VerificationAnswers) => {
    setUserProfile((prev) => ({ ...prev, ...answers }));

    // Save confirmed profile to backend
    try {
      await confirmProfile({
        email: userProfile.email,
        has_car: answers.drives,
        has_kids: answers.hasChildren,
        profession: userProfile.enrichedProfile?.profession,
        interests: userProfile.enrichedProfile?.interests || [],
      });
    } catch (error) {
      console.error("Confirm profile error:", error);
      // Continue to dashboard even if save fails
    }

    setAppState("dashboard");
  };

  const handleUpdateProfile = (updates: Partial<VerificationAnswers>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {appState === "landing" && (
          <HeroSection key="landing" onAnalyze={handleAnalyze} />
        )}

        {appState === "scanning" && (
          <ScanningOverlay key="scanning" onComplete={handleScanComplete} />
        )}

        {appState === "verification" && (
          <VerificationCards key="verification" onComplete={handleVerificationComplete} />
        )}

        {appState === "dashboard" && (
          <Dashboard
            key="dashboard"
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
