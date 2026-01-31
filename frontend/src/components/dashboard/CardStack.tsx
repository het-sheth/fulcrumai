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
  RotateCcw,
  List,
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

interface ReviewedCard {
  opportunity: ImpactOpportunity;
  action: "accepted" | "skipped";
}

interface CardStackProps {
  opportunities: ImpactOpportunity[];
  onAccept: (opportunity: ImpactOpportunity) => void;
  onComplete: (reviewed: ReviewedCard[]) => void;
}

export const CardStack = ({ opportunities, onAccept, onComplete }: CardStackProps) => {
  const [stack, setStack] = useState<ImpactOpportunity[]>(opportunities);
  const [reviewed, setReviewed] = useState<ReviewedCard[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const currentCard = stack[0] ?? null;
  const remainingCount = stack.length;

  const handleSkip = () => {
    if (!currentCard) return;

    // Move current card to end of stack
    const newStack = [...stack.slice(1), currentCard];
    setStack(newStack);

    // Track as skipped (only once per card)
    if (!reviewed.find(r => r.opportunity.id === currentCard.id)) {
      setReviewed([...reviewed, { opportunity: currentCard, action: "skipped" }]);
    }

    // If we've gone through all cards, show summary
    if (reviewed.length + 1 >= opportunities.length) {
      setShowSummary(true);
    }
  };

  const handleAccept = () => {
    if (!currentCard) return;

    // Remove from stack
    const newStack = stack.slice(1);
    setStack(newStack);

    // Track as accepted
    const newReviewed = reviewed.filter(r => r.opportunity.id !== currentCard.id);
    newReviewed.push({ opportunity: currentCard, action: "accepted" });
    setReviewed(newReviewed);

    // Notify parent
    onAccept(currentCard);

    // If stack is empty, show summary
    if (newStack.length === 0) {
      setShowSummary(true);
      onComplete(newReviewed);
    }
  };

  const handleReviewCard = (opportunity: ImpactOpportunity) => {
    // Re-add skipped card to stack for reconsideration
    if (!stack.find(o => o.id === opportunity.id)) {
      setStack([opportunity, ...stack]);
    }
    setShowSummary(false);
  };

  const handleFinish = () => {
    onComplete(reviewed);
  };

  // Summary View
  if (showSummary) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <div className="card-elevated rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <List className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Review Summary</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              You reviewed {opportunities.length} civic opportunities
            </p>
          </div>

          <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
            {reviewed.map((item) => (
              <div
                key={item.opportunity.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.action === "accepted"
                    ? "bg-accent/5 border-accent/20"
                    : "bg-secondary/30 border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.action === "accepted" ? (
                        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={`text-xs font-medium uppercase ${
                        item.action === "accepted" ? "text-accent" : "text-muted-foreground"
                      }`}>
                        {item.action}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {item.opportunity.title}
                    </p>
                  </div>
                  {item.action === "skipped" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReviewCard(item.opportunity)}
                      className="flex-shrink-0"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reconsider
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <span className="text-accent font-medium">
                  {reviewed.filter(r => r.action === "accepted").length} accepted
                </span>
                <span className="text-muted-foreground mx-2">·</span>
                <span className="text-muted-foreground">
                  {reviewed.filter(r => r.action === "skipped").length} skipped
                </span>
              </div>
            </div>
            <Button variant="hero" className="w-full" onClick={handleFinish}>
              Done Reviewing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Empty state
  if (!currentCard) {
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
          You've reviewed all current opportunities.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-xl relative">
      {/* Stack indicator */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm text-muted-foreground">
          {remainingCount} {remainingCount === 1 ? "card" : "cards"} remaining
        </span>
        {reviewed.length > 0 && (
          <button
            onClick={() => setShowSummary(true)}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <List className="w-4 h-4" />
            View all ({reviewed.length})
          </button>
        )}
      </div>

      {/* Stacked cards behind */}
      <div className="relative">
        {/* Background cards (show up to 2 behind) */}
        {stack.slice(1, 3).map((card, index) => (
          <motion.div
            key={card.id}
            className="absolute inset-0 card-elevated rounded-2xl"
            style={{
              transform: `translateY(${(index + 1) * 8}px) scale(${1 - (index + 1) * 0.03})`,
              opacity: 1 - (index + 1) * 0.15,
              zIndex: -index - 1,
            }}
          />
        ))}

        {/* Current card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50, rotateZ: 2 }}
            animate={{ opacity: 1, x: 0, rotateZ: 0 }}
            exit={{ opacity: 0, x: -100, rotateZ: -5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <FocusCardContent
              opportunity={currentCard}
              onDismiss={handleSkip}
              onAccept={handleAccept}
              showMore={expandedCard === currentCard.id}
              onToggleMore={() => setExpandedCard(
                expandedCard === currentCard.id ? null : currentCard.id
              )}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Card content component (extracted from FocusCard)
interface FocusCardContentProps {
  opportunity: ImpactOpportunity;
  onDismiss: () => void;
  onAccept: () => void;
  showMore: boolean;
  onToggleMore: () => void;
}

const FocusCardContent = ({
  opportunity,
  onDismiss,
  onAccept,
  showMore,
  onToggleMore,
}: FocusCardContentProps) => {
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
    <div className="card-elevated rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.badgeClass}`}>
            <UrgencyIcon className="w-4 h-4" />
            {config.badge}
          </div>
          <button
            onClick={onDismiss}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Skip"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-foreground leading-snug">
          {opportunity.impact}
        </h2>
      </div>

      {/* What To Do */}
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
        onClick={onToggleMore}
        className="w-full px-5 py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border-t border-border"
      >
        {showMore ? (
          <>Show less <ChevronUp className="w-4 h-4" /></>
        ) : (
          <>Show details <ChevronDown className="w-4 h-4" /></>
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
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {opportunity.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {opportunity.description}
                </p>
              </div>
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
        <Button variant="outline" size="lg" className="flex-1" onClick={onDismiss}>
          Skip
        </Button>
        <Button variant="success" size="lg" className="flex-1 group" onClick={onAccept}>
          I'll Do This
          <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};
