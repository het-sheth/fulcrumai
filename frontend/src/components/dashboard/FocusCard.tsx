import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ImpactOpportunity {
  id: string;
  type: "vote" | "meeting" | "action";
  urgency: "urgent" | "soon" | "upcoming";
  title: string;
  description: string;
  impact: string;
  location?: string;
  date?: string;
  costImpact?: string;
  recommendedAction?: string;
}

interface FocusCardProps {
  opportunity: ImpactOpportunity | null;
  onDismiss: () => void;
  onAccept: () => void;
}

export const FocusCard = ({ opportunity, onDismiss, onAccept }: FocusCardProps) => {
  const [showMore, setShowMore] = useState(false);

  if (!opportunity) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full text-center p-8"
      >
        <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-accent" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">All Caught Up!</h3>
        <p className="text-muted-foreground max-w-md">
          You've reviewed all current opportunities. Check back soon for new ways to make an impact.
        </p>
      </motion.div>
    );
  }

  const urgencyConfig = {
    urgent: {
      badge: "URGENT",
      badgeClass: "bg-urgent/10 text-urgent border-urgent/30",
      icon: AlertTriangle,
    },
    soon: {
      badge: "This Week",
      badgeClass: "bg-warning/10 text-warning border-warning/30",
      icon: Clock,
    },
    upcoming: {
      badge: "Coming Up",
      badgeClass: "bg-info/10 text-info border-info/30",
      icon: Calendar,
    },
  };

  const config = urgencyConfig[opportunity.urgency];
  const UrgencyIcon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={opportunity.id}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-xl"
      >
        <div className="card-elevated rounded-2xl overflow-hidden">
          {/* Compact Header with urgency badge */}
          <div className="p-5 pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.badgeClass}`}>
                <UrgencyIcon className="w-4 h-4" />
                {config.badge}
              </div>
              <button
                onClick={onDismiss}
                className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Impact Headline - THE KEY INFO */}
            <h2 className="text-xl font-bold text-foreground leading-snug">
              {opportunity.impact}
            </h2>
          </div>

          {/* What To Do - Always visible, prominent */}
          <div className="p-5 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                <Vote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  What to do
                </h4>
                <p className="text-foreground font-medium">
                  {opportunity.recommendedAction || `Take action on ${opportunity.title}`}
                </p>
              </div>
            </div>
          </div>

          {/* Show More Toggle */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full px-5 py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border-t border-border"
          >
            {showMore ? (
              <>
                Show less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show details <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Expandable Details */}
          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="p-5 space-y-4 bg-secondary/20">
                  {/* Title & Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      {opportunity.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.description}
                    </p>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-3 text-sm">
                    {opportunity.date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{opportunity.date}</span>
                      </div>
                    )}
                    {opportunity.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{opportunity.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Cost Impact */}
                  {opportunity.costImpact && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <DollarSign className="w-5 h-5 text-warning" />
                      <span className="text-warning font-medium text-sm">
                        {opportunity.costImpact}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="p-5 pt-4 flex gap-3 border-t border-border">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={onDismiss}
            >
              Skip
            </Button>
            <Button
              variant="success"
              size="lg"
              className="flex-1 group"
              onClick={onAccept}
            >
              I'll Do This
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
