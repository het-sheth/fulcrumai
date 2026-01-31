import { useState } from "react";
import { motion } from "framer-motion";
import { ProfileSidebar } from "./ProfileSidebar";
import { FocusCard, ImpactOpportunity } from "./FocusCard";
import { CivicTodoList, TodoItem } from "./CivicTodoList";
import { ChatbotModal } from "./ChatbotModal";

interface DashboardProps {
  userProfile: {
    drives: boolean;
    owns: boolean;
    hasChildren: boolean;
  };
  onUpdateProfile: (updates: Partial<{ drives: boolean; owns: boolean; hasChildren: boolean }>) => void;
}

// Mock data for opportunities with recommended actions
const generateOpportunities = (profile: { drives: boolean; owns: boolean; hasChildren: boolean }): ImpactOpportunity[] => {
  const opportunities: ImpactOpportunity[] = [];

  if (profile.drives) {
    opportunities.push({
      id: "parking-1",
      type: "vote",
      urgency: "urgent",
      title: "Parking Meter Extension Prop C",
      description: "This proposition would extend parking meter hours from 6pm to 10pm in commercial districts across San Francisco, affecting your daily parking routine.",
      impact: "Because you drive and live in the Mission, this will cost you an estimated ~$400/year in additional parking fees. Your usual spots on Valencia and 16th will be affected.",
      recommendedAction: "Show up at City Hall on November 5th and vote NO on Prop C to keep current parking meter hours.",
      location: "City Hall, Polling Station #24",
      date: "November 5th, 7am - 8pm",
      costImpact: "~$400/year additional cost",
    });
  }

  if (!profile.owns) {
    opportunities.push({
      id: "rent-1",
      type: "meeting",
      urgency: "soon",
      title: "Rent Control Board Hearing",
      description: "The Rent Board is reviewing new guidelines for annual rent increases. This directly affects the maximum amount your landlord can raise your rent next year.",
      impact: "As a renter in the Mission District, proposed changes could increase your maximum annual rent by 1.5% more than current limits. For your unit, that's approximately $75/month.",
      recommendedAction: "Attend the hearing on Tuesday at 2pm. Raise your hand during public comment and state you oppose the proposed increase.",
      location: "25 Van Ness Ave, Room 400",
      date: "Tuesday, 2:00 PM",
    });
  }

  if (profile.hasChildren) {
    opportunities.push({
      id: "school-1",
      type: "meeting",
      urgency: "upcoming",
      title: "SFUSD Budget Allocation Meeting",
      description: "The school board will discuss the upcoming year's budget priorities. Art and music programs at Mission District schools are on the chopping block.",
      impact: "Your child's school (Cesar Chavez Elementary) is slated for a 15% cut to arts programs. This affects the after-school programs your family relies on.",
      recommendedAction: "Attend the board meeting Thursday at 6pm. Sign up for public comment and advocate for maintaining arts funding at Cesar Chavez Elementary.",
      location: "SFUSD Headquarters, Board Room",
      date: "Next Thursday, 6:00 PM",
    });
  }

  opportunities.push({
    id: "transit-1",
    type: "action",
    urgency: "upcoming",
    title: "16th Street BART Plaza Redesign",
    description: "SFMTA is seeking community input on the redesign of the 16th Street BART plaza. This is your chance to shape how this space serves the Mission community.",
    impact: "This is your local transit hub that you use daily. Your input on safety improvements, lighting, and vendor space will directly influence the final design.",
    recommendedAction: "Complete the online survey by Friday. Focus on requesting better lighting and more seating near the Valencia St entrance.",
    location: "16th Street BART Station",
    date: "Community Survey closes Friday",
  });

  return opportunities;
};

export const Dashboard = ({ userProfile, onUpdateProfile }: DashboardProps) => {
  const [opportunities, setOpportunities] = useState<ImpactOpportunity[]>(() =>
    generateOpportunities(userProfile)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const currentOpportunity = opportunities[currentIndex] ?? null;

  const handleDismiss = () => {
    if (currentIndex < opportunities.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(opportunities.length); // Show "all caught up"
    }
  };

  const handleAccept = () => {
    if (currentOpportunity) {
      const newTodo: TodoItem = {
        id: currentOpportunity.id,
        action: currentOpportunity.recommendedAction || generateActionText(currentOpportunity),
        location: currentOpportunity.location,
        date: currentOpportunity.date,
        completed: false,
        type: currentOpportunity.type,
      };
      setTodoItems([...todoItems, newTodo]);
      handleDismiss();
    }
  };

  const handleToggleTodo = (id: string) => {
    setTodoItems(
      todoItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleProfileUpdate = (updates: Partial<{ drives: boolean; owns: boolean; hasChildren: boolean }>) => {
    onUpdateProfile(updates);
    // Regenerate opportunities based on new profile
    const newProfile = { ...userProfile, ...updates };
    setOpportunities(generateOpportunities(newProfile));
    setCurrentIndex(0);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Profile */}
      <ProfileSidebar
        userProfile={userProfile}
        onEditProfile={() => setIsChatOpen(true)}
      />

      {/* Center - Focus Feed */}
      <main className="flex-1 flex items-center justify-center p-8">
        <FocusCard
          opportunity={currentOpportunity}
          onDismiss={handleDismiss}
          onAccept={handleAccept}
        />
      </main>

      {/* Right Sidebar - To-Do List */}
      <CivicTodoList items={todoItems} onToggle={handleToggleTodo} />

      {/* Chatbot Modal */}
      <ChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onUpdateProfile={handleProfileUpdate}
      />
    </div>
  );
};

function generateActionText(opportunity: ImpactOpportunity): string {
  switch (opportunity.type) {
    case "vote":
      return `Vote on ${opportunity.title}`;
    case "meeting":
      return `Attend hearing for ${opportunity.title}`;
    case "action":
      return `Participate in ${opportunity.title}`;
    default:
      return opportunity.title;
  }
}
