import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  ChevronUp,
  Leaf,
  ShieldCheck,
  Heart,
  Users,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InferredProfile } from "@/lib/api";

interface ProfileSidebarProps {
  userProfile: {
    drives: boolean;
    owns: boolean;
    hasChildren: boolean;
    enrichedProfile?: InferredProfile;
  };
  onEditProfile: () => void;
}

// Detected values/insights from social analysis (simulated from X/Twitter, LinkedIn)
const detectedValues = [
  { icon: Leaf, label: "Climate Action", description: "Frequently engages with climate content, follows @CACleanEnergy", strength: "strong" },
  { icon: ShieldCheck, label: "Safe Streets", description: "Shared Vision Zero posts, commented on SFMTA bike lane discussions", strength: "strong" },
  { icon: Users, label: "Community Building", description: "Active in Mission District neighborhood groups", strength: "moderate" },
  { icon: Heart, label: "Arts & Culture", description: "Follows local galleries, liked SFMOMA posts", strength: "moderate" },
  { icon: Megaphone, label: "Worker Rights", description: "Retweeted labor organizing content", strength: "moderate" },
];

const socialInsights = [
  "Posted about housing affordability crisis (3 times this month)",
  "Engaged with BART delay complaints (transit reliability matters)",
  "Liked posts about restaurant closures in Mission District",
  "Shared article about tech industry's role in local politics",
  "Commented on Valencia bike lane debate",
];

export const ProfileSidebar = ({ userProfile, onEditProfile }: ProfileSidebarProps) => {
  const [showMoreValues, setShowMoreValues] = useState(false);

  // Extract profile data with fallbacks
  const profile = userProfile.enrichedProfile;
  const displayName = profile?.full_name || "User";
  const headline = profile?.headline || profile?.profession || "SF Resident";
  const location = profile?.likely_location || profile?.city || "San Francisco";
  const bio = profile?.bio || "";
  const skills = profile?.skills || [];
  const education = profile?.education?.[0];
  const profilePhoto = typeof profile?.social_profiles?.linkedin === 'object'
    ? profile?.social_profiles?.linkedin?.photo_url
    : null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-80 min-h-screen bg-sidebar border-r border-sidebar-border p-6 flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-secondary/50 rounded-lg border border-border/50">
          <Gavel className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-sidebar-foreground">
          FULCRUM<span className="text-sidebar-primary">.ai</span>
        </h2>
      </div>

      {/* User Profile Card - Micro CV Style */}
      <div className="card-elevated p-5 rounded-xl mb-6">
        <div className="flex items-start gap-4 mb-5">
          {/* Avatar */}
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

        {/* Micro CV - Bullet Points */}
        <div className="space-y-2.5 mb-5">
          <CVItem icon={MapPin} text={location} />
          {profile?.profession && <CVItem icon={Briefcase} text={profile.profession} />}
          {education?.school && <CVItem icon={GraduationCap} text={`${education.degree || ''} ${education.school}`} />}
          {userProfile.drives && <CVItem icon={Car} text="Drives in the city" />}
          {userProfile.owns ? (
            <CVItem icon={Home} text="Homeowner" color="accent" />
          ) : (
            <CVItem icon={Home} text="Renter" color="warning" />
          )}
          {userProfile.hasChildren && <CVItem icon={Baby} text="Has children" color="info" />}
          {skills.length > 0 && <CVItem icon={Laptop} text={skills.slice(0, 3).join(", ")} />}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onEditProfile}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Values & Priorities - Detected from Social */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your Values
          </h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
            <Sparkles className="w-3 h-3" />
            <span>via Nyne.ai</span>
          </div>
        </div>

        <div className="card-elevated p-4 rounded-xl space-y-3">
          {/* Always show first 2 values */}
          {detectedValues.slice(0, 2).map((value) => (
            <ValueItem key={value.label} {...value} />
          ))}

          {/* Expandable values */}
          <AnimatePresence>
            {showMoreValues && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 overflow-hidden"
              >
                {detectedValues.slice(2).map((value) => (
                  <ValueItem key={value.label} {...value} />
                ))}

                {/* Social insights when expanded */}
                <div className="pt-3 mt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Recent Social Activity
                  </p>
                  <div className="space-y-1.5">
                    {socialInsights.map((insight, i) => (
                      <p key={i} className="text-xs text-muted-foreground/70 leading-relaxed">
                        • {insight}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowMoreValues(!showMoreValues)}
            className="w-full pt-2 flex items-center justify-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {showMoreValues ? (
              <>Show less <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Show more insights <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        </div>
      </div>

      {/* Interest indicators */}
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Policy Interest Scores
        </h4>
        <div className="space-y-2">
          <InterestBar icon={Building2} label="Housing Policy" value={85} color="primary" />
          <InterestBar icon={Train} label="Transit" value={72} color="accent" />
          <InterestBar icon={Leaf} label="Climate/Environment" value={78} color="accent" />
          {userProfile.hasChildren && (
            <InterestBar icon={GraduationCap} label="Education" value={90} color="info" />
          )}
          <InterestBar icon={ShieldCheck} label="Public Safety" value={65} color="warning" />
          <InterestBar icon={TrendingUp} label="Local Economy" value={45} color="warning" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Profile via Nyne.ai
        </p>
        <p className="text-xs text-muted-foreground/60 text-center mt-1">
          A South Park Commons Company
        </p>
      </div>
    </motion.aside>
  );
};

interface CVItemProps {
  icon: React.ElementType;
  text: string;
  color?: "primary" | "accent" | "warning" | "info";
}

const CVItem = ({ icon: Icon, text, color }: CVItemProps) => {
  const colorClasses = {
    primary: "text-primary",
    accent: "text-accent",
    warning: "text-warning",
    info: "text-info",
  };

  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className={`w-4 h-4 flex-shrink-0 ${color ? colorClasses[color] : "text-primary"}`} />
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
};

interface ValueItemProps {
  icon: React.ElementType;
  label: string;
  description: string;
  strength: "strong" | "moderate";
}

const ValueItem = ({ icon: Icon, label, description, strength }: ValueItemProps) => {
  return (
    <div className="flex items-start gap-3">
      <div className={`p-1.5 rounded-lg ${
        strength === "strong" ? "bg-primary/10" : "bg-secondary"
      }`}>
        <Icon className={`w-3.5 h-3.5 ${
          strength === "strong" ? "text-primary" : "text-muted-foreground"
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {strength === "strong" && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
              Strong
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground/70 leading-relaxed mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
};

interface InterestBarProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "primary" | "accent" | "info" | "warning";
}

const InterestBar = ({ icon: Icon, label, value, color }: InterestBarProps) => {
  const colorClasses = {
    primary: "bg-primary",
    accent: "bg-accent",
    info: "bg-info",
    warning: "bg-warning",
  };

  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-medium text-foreground">{value}%</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-full rounded-full ${colorClasses[color]}`}
          />
        </div>
      </div>
    </div>
  );
};
