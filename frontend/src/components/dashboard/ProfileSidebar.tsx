import { motion } from "framer-motion";
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

interface ProfileSidebarProps {
  userProfile: {
    drives: boolean;
    owns: boolean;
    hasChildren: boolean;
  };
  onEditProfile: () => void;
}

export const ProfileSidebar = ({ userProfile, onEditProfile }: ProfileSidebarProps) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-80 min-h-screen bg-sidebar border-r border-sidebar-border p-6 flex flex-col"
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
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Alex Mercer</h3>
            <p className="text-sm text-muted-foreground">32 years old</p>
          </div>
        </div>

        {/* Micro CV - Bullet Points */}
        <div className="space-y-2.5 mb-5">
          <CVItem icon={MapPin} text="Mission District, SF (94110)" />
          <CVItem icon={Briefcase} text="Senior Engineer @ Stripe" />
          <CVItem icon={Calendar} text="SF Resident since 2018" />
          {userProfile.drives && <CVItem icon={Car} text="Drives daily (Valencia St)" />}
          {userProfile.owns ? (
            <CVItem icon={Home} text="Homeowner" color="accent" />
          ) : (
            <CVItem icon={Home} text="Renter" color="warning" />
          )}
          {userProfile.hasChildren && <CVItem icon={Baby} text="SFUSD Parent" color="info" />}
          <CVItem icon={Laptop} text="Tech Industry" />
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

      {/* Key Impacts - What affects you */}
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Issues Affecting You
        </h4>
        <div className="card-elevated p-4 rounded-xl space-y-2.5">
          <ImpactItem
            color="primary"
            text="Parking meter extension (Prop C)"
          />
          <ImpactItem
            color="accent"
            text="3 active zoning proposals nearby"
          />
          {!userProfile.owns && (
            <ImpactItem
              color="warning"
              text="Rent Board hearing for your building"
            />
          )}
          {userProfile.hasChildren && (
            <ImpactItem
              color="info"
              text="SFUSD arts funding cuts"
            />
          )}
          <ImpactItem
            color="muted"
            text="16th St BART plaza redesign"
          />
        </div>
      </div>

      {/* Interest indicators */}
      <div className="mt-6">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Detected Interests
        </h4>
        <div className="space-y-2">
          <InterestBar icon={Building2} label="Housing Policy" value={85} color="primary" />
          <InterestBar icon={Train} label="Transit" value={72} color="accent" />
          {userProfile.hasChildren && (
            <InterestBar icon={GraduationCap} label="Education" value={90} color="info" />
          )}
          <InterestBar icon={TrendingUp} label="Local Economy" value={45} color="warning" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Profile via Nyne.ai
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

interface ImpactItemProps {
  color: "primary" | "accent" | "warning" | "info" | "muted";
  text: string;
}

const ImpactItem = ({ color, text }: ImpactItemProps) => {
  const colorClasses = {
    primary: "bg-primary",
    accent: "bg-accent",
    warning: "bg-warning",
    info: "bg-info",
    muted: "bg-muted-foreground",
  };

  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-1.5 h-1.5 rounded-full ${colorClasses[color]} mt-1.5 flex-shrink-0`} />
      <p className="text-sm text-muted-foreground">{text}</p>
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
