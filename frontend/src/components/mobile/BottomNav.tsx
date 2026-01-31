import { motion } from "framer-motion";
import { User, Gavel, ListChecks } from "lucide-react";

export type MobileTab = "profile" | "feed" | "actions";

interface BottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  todoCount?: number;
}

export const BottomNav = ({ activeTab, onTabChange, todoCount = 0 }: BottomNavProps) => {
  const tabs = [
    { id: "profile" as MobileTab, icon: User, label: "Profile" },
    { id: "feed" as MobileTab, icon: Gavel, label: "Feed" },
    { id: "actions" as MobileTab, icon: ListChecks, label: "Actions" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-sidebar border-t border-sidebar-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === "actions" && todoCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors"
              aria-label={tab.label}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                {/* Badge for actions count */}
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {todoCount > 9 ? "9+" : todoCount}
                  </span>
                )}
              </div>

              <span
                className={`text-xs mt-1 transition-colors ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
