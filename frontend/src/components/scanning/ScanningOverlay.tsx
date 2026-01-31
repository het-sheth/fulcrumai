import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Linkedin,
  Facebook,
  Instagram,
  Music,
  Loader2,
  CheckCircle2,
  Gavel,
  Shield,
  Twitter,
  Globe,
} from "lucide-react";

interface ScanningOverlayProps {
  onComplete: () => void;
}

const platforms = [
  { icon: Linkedin, name: "LinkedIn", description: "Analyzing professional network & career interests" },
  { icon: Facebook, name: "Facebook", description: "Mapping social connections & community ties" },
  { icon: Instagram, name: "Instagram", description: "Understanding visual interests & lifestyle" },
  { icon: Twitter, name: "X/Twitter", description: "Extracting political leanings & opinions" },
  { icon: Music, name: "Spotify", description: "Inferring cultural preferences & values" },
  { icon: Globe, name: "Public Records", description: "Cross-referencing voter registration & address" },
];

const statusMessages = [
  "Initializing Nyne.ai Identity Layer...",
  "Establishing secure connection to data sources...",
  "Scanning LinkedIn for professional interests...",
  "Analyzing Facebook for community connections...",
  "Mapping Instagram for lifestyle patterns...",
  "Extracting X/Twitter for political sentiment...",
  "Processing Spotify for cultural preferences...",
  "Cross-referencing public voter records...",
  "Triangulating civic interest vectors...",
  "Matching with local SF ballot measures...",
  "Calculating personalized impact scores...",
  "Building your civic engagement profile...",
  "Finalizing recommendations...",
];

export const ScanningOverlay = ({ onComplete }: ScanningOverlayProps) => {
  const [currentPlatformIndex, setCurrentPlatformIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [completedPlatforms, setCompletedPlatforms] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle through platforms every 3 seconds (6 platforms = 18 seconds)
    const platformInterval = setInterval(() => {
      setCurrentPlatformIndex((prev) => {
        const next = prev + 1;
        if (next < platforms.length) {
          setCompletedPlatforms((completed) => [...completed, prev]);
          return next;
        }
        return prev;
      });
    }, 3000);

    // Cycle through messages every 1.5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        const next = prev + 1;
        return next < statusMessages.length ? next : prev;
      });
    }, 1500);

    // Update progress smoothly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 0.5;
      });
    }, 100);

    // Complete after 20 seconds
    const completeTimeout = setTimeout(() => {
      setCompletedPlatforms((prev) => [...prev, platforms.length - 1]);
      setProgress(100);
      setTimeout(onComplete, 1000);
    }, 20000);

    return () => {
      clearInterval(platformInterval);
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      {/* Background effects - amber glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(38_92%_50%_/_0.12)_0%,_transparent_60%)]" />

      {/* Scanning lines */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={{
            top: ["0%", "100%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-3xl px-6">
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-secondary/50 rounded-xl border border-border/50">
              <Gavel className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              FULCRUM<span className="text-primary">.ai</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">Powered by Nyne.ai · A South Park Commons Company</p>
        </motion.div>

        {/* Nyne.ai Explanation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-6 rounded-xl text-center max-w-xl"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Nyne.ai Identity Engine</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mb-2">South Park Commons Company</p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Nyne.ai securely analyzes your public digital footprint across social platforms
            to understand your interests, values, and community connections. This helps us
            identify civic issues that genuinely matter to you - without storing personal data.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded">Privacy-First</span>
            <span className="px-2 py-1 bg-accent/10 text-accent rounded">No Data Storage</span>
            <span className="px-2 py-1 bg-warning/10 text-warning rounded">Real-Time Analysis</span>
          </div>
        </motion.div>

        {/* Platform icons - 2 rows */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-4">
            {platforms.slice(0, 3).map((platform, index) => (
              <PlatformIcon
                key={platform.name}
                platform={platform}
                index={index}
                currentPlatformIndex={currentPlatformIndex}
                completedPlatforms={completedPlatforms}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-4">
            {platforms.slice(3).map((platform, index) => (
              <PlatformIcon
                key={platform.name}
                platform={platform}
                index={index + 3}
                currentPlatformIndex={currentPlatformIndex}
                completedPlatforms={completedPlatforms}
              />
            ))}
          </div>
        </div>

        {/* Current platform description */}
        <AnimatePresence mode="wait">
          {currentPlatformIndex < platforms.length && (
            <motion.div
              key={currentPlatformIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <p className="text-foreground font-medium">
                {platforms[currentPlatformIndex]?.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status message */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-muted-foreground text-sm font-mono"
            >
              {statusMessages[currentMessageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar with percentage */}
        <div className="w-full max-w-md">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Analyzing your digital footprint</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Privacy note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-muted-foreground text-center max-w-md"
        >
          Your data is processed securely in real-time and never stored permanently.
          We only analyze publicly available information to personalize your civic experience.
        </motion.p>
      </div>
    </motion.div>
  );
};

interface PlatformIconProps {
  platform: { icon: React.ElementType; name: string; description: string };
  index: number;
  currentPlatformIndex: number;
  completedPlatforms: number[];
}

const PlatformIcon = ({ platform, index, currentPlatformIndex, completedPlatforms }: PlatformIconProps) => {
  const Icon = platform.icon;
  const isActive = currentPlatformIndex === index;
  const isCompleted = completedPlatforms.includes(index);

  return (
    <motion.div
      initial={{ opacity: 0.3, scale: 0.8 }}
      animate={{
        opacity: isActive || isCompleted ? 1 : 0.3,
        scale: isActive ? 1.1 : 1,
      }}
      transition={{ duration: 0.4 }}
      className="relative flex flex-col items-center gap-2"
    >
      {/* Pulse ring for active */}
      {isActive && (
        <motion.div
          className="absolute rounded-full border-2 border-primary"
          animate={{ scale: [1, 1.5], opacity: [1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ width: 56, height: 56, left: -4, top: -4 }}
        />
      )}

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
          isCompleted
            ? "bg-accent/20 border border-accent/50"
            : isActive
            ? "bg-primary/20 border border-primary/50"
            : "bg-secondary/50 border border-border/50"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-accent" />
        ) : isActive ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        ) : (
          <Icon className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      <span
        className={`text-xs font-medium ${
          isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {platform.name}
      </span>
    </motion.div>
  );
};
