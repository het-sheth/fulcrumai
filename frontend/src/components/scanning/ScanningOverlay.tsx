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
} from "lucide-react";

interface ScanningOverlayProps {
  onComplete: () => void;
}

const platforms = [
  { icon: Linkedin, name: "LinkedIn", color: "#0077B5", description: "Professional network" },
  { icon: Facebook, name: "Facebook", color: "#1877F2", description: "Social connections" },
  { icon: Instagram, name: "Instagram", color: "#E4405F", description: "Visual interests" },
  { icon: Music, name: "Spotify", color: "#1DB954", description: "Cultural preferences" },
];

const statusMessages = [
  "Initializing Nyne.ai Identity Layer...",
  "Connecting to secure data sources...",
  "Analyzing public sentiment patterns...",
  "Mapping your digital footprint...",
  "Triangulating civic interest vectors...",
  "Cross-referencing local issues...",
  "Building your personalized civic profile...",
];

export const ScanningOverlay = ({ onComplete }: ScanningOverlayProps) => {
  const [currentPlatformIndex, setCurrentPlatformIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [completedPlatforms, setCompletedPlatforms] = useState<number[]>([]);

  useEffect(() => {
    // Cycle through platforms
    const platformInterval = setInterval(() => {
      setCurrentPlatformIndex((prev) => {
        const next = prev + 1;
        if (next < platforms.length) {
          setCompletedPlatforms((completed) => [...completed, prev]);
          return next;
        }
        return prev;
      });
    }, 1000);

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        const next = prev + 1;
        return next < statusMessages.length ? next : prev;
      });
    }, 600);

    // Complete after all platforms are scanned
    const completeTimeout = setTimeout(() => {
      setCompletedPlatforms((prev) => [...prev, platforms.length - 1]);
      setTimeout(onComplete, 800);
    }, 4500);

    return () => {
      clearInterval(platformInterval);
      clearInterval(messageInterval);
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
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-2xl px-6">
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
          <p className="text-sm text-muted-foreground">Powered by Nyne.ai Identity Layer</p>
        </motion.div>

        {/* Nyne.ai Explanation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-6 rounded-xl text-center max-w-lg"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Nyne.ai Identity Engine</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nyne.ai securely analyzes your public digital footprint across social platforms
            to understand your interests, values, and community connections. This helps us
            identify civic issues that genuinely matter to you - without storing personal data.
          </p>
        </motion.div>

        {/* Platform icons */}
        <div className="flex items-center gap-6">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            const isActive = currentPlatformIndex === index;
            const isCompleted = completedPlatforms.includes(index);

            return (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0.3, scale: 0.8 }}
                animate={{
                  opacity: isActive || isCompleted ? 1 : 0.3,
                  scale: isActive ? 1.15 : 1,
                }}
                transition={{ duration: 0.4 }}
                className="relative flex flex-col items-center gap-2"
              >
                {/* Pulse ring for active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.6], opacity: [1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ width: 64, height: 64, left: -8, top: -8 }}
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
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-primary"
                  >
                    {platform.description}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Status message */}
        <div className="h-8 flex items-center justify-center">
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

        {/* Progress bar */}
        <div className="w-80 h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.5, ease: "easeInOut" }}
          />
        </div>

        {/* Privacy note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-muted-foreground text-center"
        >
          Your data is processed securely and never stored permanently
        </motion.p>
      </div>
    </motion.div>
  );
};
