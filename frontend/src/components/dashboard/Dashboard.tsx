import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileSidebar } from "./ProfileSidebar";
import { CardStack, ImpactOpportunity } from "./CardStack";
import { CivicTodoList, TodoItem } from "./CivicTodoList";
import { ChatbotModal } from "./ChatbotModal";
import { BottomNav, MobileTab } from "../mobile/BottomNav";
import { VerificationAnswers } from "../verification/VerificationCards";
import { getDashboard, CivicEvent, InferredProfile } from "@/lib/api";

interface DashboardProps {
  userProfile: VerificationAnswers & { email?: string; enrichedProfile?: InferredProfile };
  onUpdateProfile: (updates: Partial<VerificationAnswers>) => void;
}

// Convert API CivicEvent to frontend ImpactOpportunity
const convertEventToOpportunity = (event: CivicEvent): ImpactOpportunity => {
  // Map urgency levels
  const urgencyMap: Record<string, "urgent" | "soon" | "upcoming"> = {
    "High": "urgent",
    "Medium": "soon",
    "Low": "upcoming",
  };

  // Determine type based on tags or source
  let type: "vote" | "meeting" | "action" = "action";
  const tags = event.impact_tags.map(t => t.toLowerCase());
  if (tags.includes("vote") || tags.includes("election") || tags.includes("ballot")) {
    type = "vote";
  } else if (tags.includes("meeting") || tags.includes("hearing") || tags.includes("board")) {
    type = "meeting";
  }

  return {
    id: event.id,
    type,
    urgency: urgencyMap[event.urgency] || "upcoming",
    title: event.title,
    description: event.summary || "No description available",
    impactSummary: event.impact_tags.slice(0, 3).join(" · ") || "Civic engagement",
    impact: event.summary || "This civic event may affect your community.",
    location: event.location,
    date: event.event_date ? new Date(event.event_date).toLocaleDateString() : undefined,
    recommendedAction: `Learn more and take action on this ${type === "vote" ? "ballot measure" : type === "meeting" ? "public meeting" : "civic issue"}.`,
  };
};

// Generate opportunities based on full profile
const generateOpportunities = (profile: VerificationAnswers): ImpactOpportunity[] => {
  const opportunities: ImpactOpportunity[] = [];

  // REAL CIVIC OPPORTUNITIES FIRST (for demo video)
  if (profile.drives) {
    opportunities.push({
      id: "parking-1",
      type: "vote",
      urgency: "urgent",
      title: "Parking Meter Extension Prop C",
      description: "This proposition would extend parking meter hours from 6pm to 10pm in commercial districts across San Francisco.",
      impactSummary: "Parking costs up $400/yr",
      impact: "As a driver, this will cost you ~$400/year in additional parking fees. Your usual spots on Valencia and 16th will be affected.",
      recommendedAction: "Vote NO on Prop C at City Hall on November 5th to keep current parking meter hours.",
      location: "City Hall, Polling Station #24",
      date: "November 5th, 7am - 8pm",
      costImpact: "~$400/year additional cost",
    });
  }

  if (profile.usesTransit) {
    opportunities.push({
      id: "transit-fare",
      type: "meeting",
      urgency: "soon",
      title: "SFMTA Fare Increase Proposal",
      description: "SFMTA is proposing a $0.50 fare increase for Muni and BART connections to address budget shortfalls.",
      impactSummary: "Commute costs rising $260/yr",
      impact: "As a regular transit user, this would add ~$260/year to your commute costs based on typical usage.",
      recommendedAction: "Attend the SFMTA board meeting and voice your opinion during public comment.",
      location: "SFMTA HQ, 1 South Van Ness",
      date: "Wednesday, 10:00 AM",
      costImpact: "~$260/year fare increase",
    });
  }

  if (profile.bikeCommutes) {
    opportunities.push({
      id: "bike-lane",
      type: "action",
      urgency: "upcoming",
      title: "Valencia Street Protected Bike Lane",
      description: "SFMTA is deciding whether to make the Valencia Street protected bike lane permanent or remove it.",
      impactSummary: "Your bike safety at stake",
      impact: "This directly affects your daily bike commute safety. The protected lane has reduced bike injuries by 40%.",
      recommendedAction: "Submit your support for the permanent protected lane via the online survey by Friday.",
      location: "Valencia Street (16th to Cesar Chavez)",
      date: "Survey closes Friday",
    });
  }

  if (!profile.owns) {
    opportunities.push({
      id: "rent-1",
      type: "meeting",
      urgency: "soon",
      title: "Rent Control Board Hearing",
      description: "The Rent Board is reviewing new guidelines for annual rent increases affecting rent-controlled units.",
      impactSummary: "Rent hike coming soon",
      impact: "As a renter, proposed changes could increase your maximum annual rent by 1.5% more than current limits (~$75/month).",
      recommendedAction: "Attend the hearing on Tuesday at 2pm and state you oppose the proposed increase.",
      location: "25 Van Ness Ave, Room 400",
      date: "Tuesday, 2:00 PM",
    });
  }

  if (profile.owns) {
    opportunities.push({
      id: "prop-tax",
      type: "vote",
      urgency: "upcoming",
      title: "Prop D: School Bond Property Tax",
      description: "A new bond measure to fund SFUSD school repairs, adding approximately $200/year to property taxes.",
      impactSummary: "Property tax up $200/yr",
      impact: "As a homeowner, this will increase your property tax by ~$200/year to fund school facility improvements.",
      recommendedAction: "Research the bond details and vote on November 5th based on your priorities.",
      location: "Your local polling station",
      date: "November 5th",
      costImpact: "~$200/year property tax increase",
    });
  }

  if (profile.hasChildren) {
    opportunities.push({
      id: "school-1",
      type: "meeting",
      urgency: "upcoming",
      title: "SFUSD Budget Allocation Meeting",
      description: "The school board will discuss budget priorities. Art and music programs at several schools are on the chopping block.",
      impactSummary: "Arts programs face 15% cuts",
      impact: "Your child's school may face a 15% cut to arts programs, affecting after-school activities.",
      recommendedAction: "Attend the board meeting Thursday at 6pm and advocate for maintaining arts funding.",
      location: "SFUSD Headquarters, Board Room",
      date: "Next Thursday, 6:00 PM",
    });
  }

  if (profile.isSmallBusinessOwner) {
    opportunities.push({
      id: "biz-license",
      type: "action",
      urgency: "soon",
      title: "Small Business License Fee Increase",
      description: "The city is proposing to increase annual business license fees by 25% for small businesses.",
      impactSummary: "License fees rising 25%",
      impact: "As a small business owner, this would increase your annual licensing costs by several hundred dollars.",
      recommendedAction: "Sign the Small Business Coalition petition opposing the fee increase.",
      date: "Petition deadline: Next Monday",
      costImpact: "25% license fee increase",
    });
  }

  if (profile.concernedAboutSafety) {
    opportunities.push({
      id: "safety-1",
      type: "meeting",
      urgency: "upcoming",
      title: "Police Commission Community Meeting",
      description: "The Police Commission is gathering community input on patrol priorities for your district.",
      impactSummary: "Shape local patrol priorities",
      impact: "This is your chance to directly influence where police resources are allocated in your neighborhood.",
      recommendedAction: "Attend the community meeting and share your safety concerns and priorities.",
      location: "Mission Cultural Center, 2868 Mission St",
      date: "Next Wednesday, 7:00 PM",
    });
  }

  if (profile.usesParks) {
    opportunities.push({
      id: "parks-1",
      type: "action",
      urgency: "upcoming",
      title: "Dolores Park Renovation Proposal",
      description: "SF Rec & Parks is seeking input on renovations including new restrooms, playground equipment, and dog areas.",
      impactSummary: "Influence park renovations",
      impact: "As a park user, you can influence what amenities are prioritized in the renovation budget.",
      recommendedAction: "Complete the community survey to share your priorities for park improvements.",
      location: "Dolores Park",
      date: "Survey closes in 2 weeks",
    });
  }

  // Always include a general civic opportunity
  opportunities.push({
    id: "transit-plaza",
    type: "action",
    urgency: "upcoming",
    title: "16th Street BART Plaza Redesign",
    description: "SFMTA is seeking community input on the redesign of the 16th Street BART plaza.",
    impactSummary: "Redesign your BART plaza",
    impact: "Your input on safety improvements, lighting, and vendor space will directly influence the final design.",
    recommendedAction: "Complete the online survey by Friday. Focus on what matters most to you.",
    location: "16th Street BART Station",
    date: "Community Survey closes Friday",
  });

  // SPONSORED ADS - Added at END for demo video (real civic content first)
  if (profile.owns) {
    // Homeowner ad - Solar tax credits
    opportunities.push({
      id: "sponsored-solar",
      type: "action",
      urgency: "urgent",
      title: "Solar Tax Credit Extension Act",
      description: "California's 30% solar tax credit expires December 31st. Installing solar now locks in maximum savings before the deadline.",
      impactSummary: "Save $8K-15K on solar",
      impact: "As a homeowner, you could save $8,000-$15,000 on solar installation costs. This tax credit won't be renewed at current levels.",
      recommendedAction: "Get a free solar assessment and lock in your tax credit before the deadline. Takes 5 minutes online.",
      date: "Credit expires December 31st",
      costImpact: "Save $8,000-$15,000 with tax credits",
      sponsoredBy: "SolarSF Coalition",
    });
  } else {
    // Renter ad - Tenants union
    opportunities.push({
      id: "sponsored-tenants",
      type: "action",
      urgency: "urgent",
      title: "Stop the Costa-Hawkins Loophole",
      description: "A proposed amendment would allow landlords to reset rent to market rate after any renovation, even minor ones. This threatens rent control citywide.",
      impactSummary: "Your rent could double",
      impact: "As a renter, this loophole could let your landlord raise your rent by 50-100% after any renovation. Your housing stability is at risk.",
      recommendedAction: "Sign the SF Tenants Union petition to close the loophole and protect rent control.",
      date: "Petition deadline: This Friday",
      sponsoredBy: "SF Tenants Union",
    });
  }

  return opportunities;
};

export const Dashboard = ({ userProfile, onUpdateProfile }: DashboardProps) => {
  const [opportunities, setOpportunities] = useState<ImpactOpportunity[]>(() =>
    generateOpportunities(userProfile)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("feed");
  const [isComplete, setIsComplete] = useState(false);

  // Fetch real civic events from API
  useEffect(() => {
    const fetchEvents = async () => {
      if (!userProfile.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getDashboard(userProfile.email);

        if (response.events && response.events.length > 0) {
          // Convert API events to opportunities and merge with sponsored content
          const apiOpportunities = response.events.map(convertEventToOpportunity);

          // Keep sponsored ads from generateOpportunities, but show AFTER real events for demo
          const sponsoredAds = generateOpportunities(userProfile).filter(
            (o) => o.sponsoredBy
          );

          // Real civic events first, then sponsored ads (better for demo video)
          setOpportunities([...apiOpportunities, ...sponsoredAds]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard events:", error);
        // Keep using mock data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [userProfile.email]);

  const handleAcceptOpportunity = (opportunity: ImpactOpportunity) => {
    const newTodo: TodoItem = {
      id: opportunity.id,
      action: opportunity.recommendedAction || `Take action on ${opportunity.title}`,
      location: opportunity.location,
      date: opportunity.date,
      completed: false,
      type: opportunity.type,
    };
    setTodoItems((prev) => [...prev, newTodo]);
  };

  const handleStackComplete = () => {
    setIsComplete(true);
  };

  const handleToggleTodo = (id: string) => {
    setTodoItems(
      todoItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleProfileUpdate = (updates: Partial<VerificationAnswers>) => {
    onUpdateProfile(updates);
  };

  // Profile data for sidebar components
  const profileForSidebar = {
    drives: userProfile.drives,
    owns: userProfile.owns,
    hasChildren: userProfile.hasChildren,
    enrichedProfile: userProfile.enrichedProfile,
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Profile (hidden on mobile) */}
      <div className="hidden md:block">
        <ProfileSidebar
          userProfile={profileForSidebar}
          onEditProfile={() => setIsChatOpen(true)}
        />
      </div>

      {/* Center - Card Stack (Desktop) */}
      <main className="hidden md:flex flex-1 items-start justify-center p-8 pt-12">
        <CardStack
          opportunities={opportunities}
          onAccept={handleAcceptOpportunity}
          onComplete={handleStackComplete}
        />
      </main>

      {/* Right Sidebar - To-Do List (hidden on mobile) */}
      <div className="hidden md:block">
        <CivicTodoList items={todoItems} onToggle={handleToggleTodo} />
      </div>

      {/* Mobile Content Area */}
      <div className="md:hidden flex-1 pb-20">
        <AnimatePresence mode="wait">
          {mobileTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-screen"
            >
              <MobileProfileView
                userProfile={profileForSidebar}
                onEditProfile={() => setIsChatOpen(true)}
              />
            </motion.div>
          )}

          {mobileTab === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-start justify-center p-4 pt-6"
            >
              <CardStack
                opportunities={opportunities}
                onAccept={handleAcceptOpportunity}
                onComplete={handleStackComplete}
              />
            </motion.div>
          )}

          {mobileTab === "actions" && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="min-h-screen"
            >
              <MobileTodoView items={todoItems} onToggle={handleToggleTodo} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        todoCount={todoItems.filter(t => !t.completed).length}
      />

      {/* Chatbot Modal */}
      <ChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onUpdateProfile={handleProfileUpdate}
      />
    </div>
  );
};

// Mobile Profile View
import {
  MapPin,
  Edit3,
  Building2,
  Train,
  GraduationCap,
  TrendingUp,
  User,
  Briefcase,
  Calendar,
  Gavel,
  Car,
  Home,
  Baby,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileProfileViewProps {
  userProfile: {
    drives: boolean;
    owns: boolean;
    hasChildren: boolean;
    enrichedProfile?: InferredProfile;
  };
  onEditProfile: () => void;
}

const MobileProfileView = ({ userProfile, onEditProfile }: MobileProfileViewProps) => {
  // Extract profile data with fallbacks
  const profile = userProfile.enrichedProfile;
  const displayName = profile?.full_name || "User";
  const headline = profile?.headline || profile?.profession || "SF Resident";
  const location = profile?.likely_location || profile?.city || "San Francisco";
  const skills = profile?.skills || [];
  const profilePhoto = typeof profile?.social_profiles?.linkedin === 'object'
    ? (profile?.social_profiles?.linkedin as { photo_url?: string })?.photo_url
    : null;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/50 rounded-lg border border-border/50">
            <Gavel className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">
            FULCRUM<span className="text-primary">.ai</span>
          </h2>
        </div>
      </div>

      {/* User Card */}
      <div className="card-elevated p-5 rounded-xl">
        <div className="flex items-start gap-4 mb-5">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={displayName}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-7 h-7 text-primary-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{displayName}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{headline}</p>
          </div>
        </div>

        {/* Micro CV */}
        <div className="space-y-2.5 mb-5">
          <CVItemMobile icon={MapPin} text={location} />
          {profile?.profession && <CVItemMobile icon={Briefcase} text={profile.profession} />}
          {userProfile.drives && <CVItemMobile icon={Car} text="Drives in the city" />}
          {userProfile.owns ? (
            <CVItemMobile icon={Home} text="Homeowner" />
          ) : (
            <CVItemMobile icon={Home} text="Renter" />
          )}
          {userProfile.hasChildren && <CVItemMobile icon={Baby} text="Has children" />}
          {skills.length > 0 && <CVItemMobile icon={Laptop} text={skills.slice(0, 2).join(", ")} />}
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={onEditProfile}>
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Issues */}
      <div className="card-elevated p-4 rounded-xl">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Issues Affecting You
        </h4>
        <div className="space-y-2">
          <ImpactItemMobile color="primary" text="Parking meter extension (Prop C)" />
          <ImpactItemMobile color="accent" text="3 active zoning proposals nearby" />
          {!userProfile.owns && <ImpactItemMobile color="warning" text="Rent Board hearing" />}
          {userProfile.hasChildren && <ImpactItemMobile color="info" text="SFUSD arts funding cuts" />}
        </div>
      </div>

      {/* Interests */}
      <div className="card-elevated p-4 rounded-xl">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Detected Interests
        </h4>
        <div className="space-y-3">
          <InterestBarMobile icon={Building2} label="Housing Policy" value={85} />
          <InterestBarMobile icon={Train} label="Transit" value={72} />
          {userProfile.hasChildren && <InterestBarMobile icon={GraduationCap} label="Education" value={90} />}
          <InterestBarMobile icon={TrendingUp} label="Local Economy" value={45} />
        </div>
      </div>
    </div>
  );
};

const CVItemMobile = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-2.5 text-sm">
    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
    <span className="text-muted-foreground">{text}</span>
  </div>
);

const ImpactItemMobile = ({ color, text }: { color: string; text: string }) => {
  const colorClasses: Record<string, string> = {
    primary: "bg-primary",
    accent: "bg-accent",
    warning: "bg-warning",
    info: "bg-info",
  };
  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-1.5 h-1.5 rounded-full ${colorClasses[color]} mt-1.5`} />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
};

const InterestBarMobile = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) => (
  <div className="flex items-center gap-3">
    <Icon className="w-4 h-4 text-muted-foreground" />
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-1 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  </div>
);

// Mobile Todo View
import { CheckCircle2, Circle, Vote, Hand, ArrowRight as ArrowRightIcon } from "lucide-react";

interface MobileTodoViewProps {
  items: TodoItem[];
  onToggle: (id: string) => void;
}

const MobileTodoView = ({ items, onToggle }: MobileTodoViewProps) => {
  const typeConfig = {
    vote: { icon: Vote, color: "text-primary" },
    meeting: { icon: Hand, color: "text-accent" },
    action: { icon: ArrowRightIcon, color: "text-warning" },
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Your Civic Actions</h2>
        <span className="text-sm text-muted-foreground">
          {items.filter(i => i.completed).length}/{items.length} done
        </span>
      </div>

      {items.length === 0 ? (
        <div className="card-elevated p-8 rounded-xl text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No actions yet. Accept opportunities from the Feed!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={item.id}
                layout
                className={`card-elevated p-4 rounded-xl transition-opacity ${
                  item.completed ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggle(item.id)}
                    className="mt-0.5 transition-transform active:scale-90"
                    aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className={`text-xs uppercase font-medium ${config.color}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className={`text-sm ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {item.action}
                    </p>
                    {item.date && (
                      <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
