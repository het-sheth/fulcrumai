import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Home,
  Baby,
  ArrowRight,
  Train,
  Bike,
  Briefcase,
  ShieldAlert,
  TreePine,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VerificationAnswers {
  drives: boolean;
  owns: boolean;
  hasChildren: boolean;
  usesTransit: boolean;
  bikeCommutes: boolean;
  isSmallBusinessOwner: boolean;
  concernedAboutSafety: boolean;
  usesParks: boolean;
}

interface VerificationCardsProps {
  onComplete: (answers: VerificationAnswers) => void;
}

interface QuestionCard {
  id: keyof VerificationAnswers;
  icon: React.ElementType;
  question: string;
  yesText: string;
  noText: string;
  hint: string;
}

const questions: QuestionCard[] = [
  {
    id: "drives",
    icon: Car,
    question: "Do you drive in the city?",
    yesText: "Yes, I drive",
    noText: "No, I don't",
    hint: "Helps us identify parking and traffic policies that affect you",
  },
  {
    id: "usesTransit",
    icon: Train,
    question: "Do you use Muni or BART?",
    yesText: "Yes, regularly",
    noText: "Rarely or never",
    hint: "Transit fare and service changes may impact your commute",
  },
  {
    id: "bikeCommutes",
    icon: Bike,
    question: "Do you bike in the city?",
    yesText: "Yes, I bike",
    noText: "No, I don't",
    hint: "Bike lane and cycling infrastructure proposals will be highlighted",
  },
  {
    id: "owns",
    icon: Home,
    question: "Do you rent or own your home?",
    yesText: "I own",
    noText: "I rent",
    hint: "Housing policy impacts renters and owners very differently",
  },
  {
    id: "hasChildren",
    icon: Baby,
    question: "Do you have children in SF public schools?",
    yesText: "Yes",
    noText: "No",
    hint: "School board and SFUSD budget decisions affect families directly",
  },
  {
    id: "isSmallBusinessOwner",
    icon: Briefcase,
    question: "Are you a small business owner in SF?",
    yesText: "Yes",
    noText: "No",
    hint: "Business regulations and licensing changes will be surfaced",
  },
  {
    id: "concernedAboutSafety",
    icon: ShieldAlert,
    question: "Is public safety a priority for you?",
    yesText: "Yes, definitely",
    noText: "Not particularly",
    hint: "Crime, policing, and DA policies will be highlighted",
  },
  {
    id: "usesParks",
    icon: TreePine,
    question: "Do you regularly use SF parks?",
    yesText: "Yes",
    noText: "Not really",
    hint: "Parks funding and recreation proposals will be shown",
  },
];

export const VerificationCards = ({ onComplete }: VerificationCardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<VerificationAnswers>>({});
  const [isExiting, setIsExiting] = useState(false);

  const handleAnswer = (answer: boolean) => {
    const currentQuestion = questions[currentIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsExiting(false);
      }, 300);
    } else {
      // All questions answered
      setTimeout(() => {
        onComplete({
          drives: newAnswers.drives ?? false,
          owns: newAnswers.owns ?? false,
          hasChildren: newAnswers.hasChildren ?? false,
          usesTransit: newAnswers.usesTransit ?? false,
          bikeCommutes: newAnswers.bikeCommutes ?? false,
          isSmallBusinessOwner: newAnswers.isSmallBusinessOwner ?? false,
          concernedAboutSafety: newAnswers.concernedAboutSafety ?? false,
          usesParks: newAnswers.usesParks ?? false,
        });
      }, 500);
    }
  };

  const handleSkip = () => {
    onComplete({
      drives: answers.drives ?? false,
      owns: answers.owns ?? false,
      hasChildren: answers.hasChildren ?? false,
      usesTransit: answers.usesTransit ?? false,
      bikeCommutes: answers.bikeCommutes ?? false,
      isSmallBusinessOwner: answers.isSmallBusinessOwner ?? false,
      concernedAboutSafety: answers.concernedAboutSafety ?? false,
      usesParks: answers.usesParks ?? false,
    });
  };

  const currentQuestion = questions[currentIndex];
  const Icon = currentQuestion.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      {/* Background - amber glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(38_92%_50%_/_0.08)_0%,_transparent_50%)]" />

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Quick Profile Setup
          </h2>
          <p className="text-muted-foreground">
            Help us find civic issues that matter to you
          </p>
        </motion.div>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index < currentIndex
                  ? "w-6 bg-accent"
                  : index === currentIndex
                  ? "w-6 bg-primary"
                  : "w-3 bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Question counter */}
        <div className="text-center mb-4">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          {!isExiting && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="card-elevated p-8 rounded-2xl"
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-foreground" />
                </div>

                {/* Question */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {currentQuestion.question}
                </h3>
                <p className="text-sm text-muted-foreground mb-8">
                  {currentQuestion.hint}
                </p>

                {/* Buttons - BOTH neutral styling until selected */}
                <div className="flex gap-4 w-full">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-base hover:bg-secondary hover:border-border"
                    onClick={() => handleAnswer(false)}
                  >
                    {currentQuestion.noText}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-base hover:bg-primary/10 hover:border-primary hover:text-primary"
                    onClick={() => handleAnswer(true)}
                  >
                    {currentQuestion.yesText}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip option */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 mx-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleSkip}
        >
          Skip remaining questions
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};
