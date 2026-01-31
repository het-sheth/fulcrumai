import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  MapPin,
  Calendar,
  ChevronRight,
  Vote,
  Hand,
  ArrowRight,
  ListChecks,
} from "lucide-react";

export interface TodoItem {
  id: string;
  action: string;
  location?: string;
  date?: string;
  completed: boolean;
  type?: "vote" | "meeting" | "action";
}

interface CivicTodoListProps {
  items: TodoItem[];
  onToggle: (id: string) => void;
}

const typeIcons = {
  vote: Vote,
  meeting: Hand,
  action: ArrowRight,
};

const typeColors = {
  vote: "text-urgent",
  meeting: "text-warning",
  action: "text-info",
};

export const CivicTodoList = ({ items, onToggle }: CivicTodoListProps) => {
  const completedCount = items.filter((item) => item.completed).length;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-80 min-h-screen bg-sidebar border-l border-sidebar-border p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ListChecks className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Civic To-Do List
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {items.length === 0
            ? "Your civic actions will appear here"
            : `${completedCount} of ${items.length} completed`}
        </p>

        {/* Progress bar */}
        {items.length > 0 && (
          <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{
                width: items.length > 0 ? `${(completedCount / items.length) * 100}%` : "0%",
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      {/* Todo Items */}
      <div className="space-y-3">
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                <Circle className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Accept opportunities to add them here
              </p>
            </motion.div>
          ) : (
            items.map((item, index) => {
              const TypeIcon = item.type ? typeIcons[item.type] : ArrowRight;
              const typeColor = item.type ? typeColors[item.type] : "text-muted-foreground";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onToggle(item.id)}
                  className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                    item.completed
                      ? "bg-accent/5 border-accent/20"
                      : "bg-card border-border hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="mt-0.5">
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Type Badge */}
                      {item.type && !item.completed && (
                        <div className={`inline-flex items-center gap-1 text-xs font-medium mb-1 ${typeColor}`}>
                          <TypeIcon className="w-3 h-3" />
                          {item.type === "vote" && "Vote"}
                          {item.type === "meeting" && "Attend"}
                          {item.type === "action" && "Action"}
                        </div>
                      )}

                      <p
                        className={`text-sm font-medium leading-snug ${
                          item.completed ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {item.action}
                      </p>

                      {/* Meta */}
                      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                        {item.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-primary" />
                            {item.date}
                          </span>
                        )}
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" />
                            {item.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    {!item.completed && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer hint */}
      {items.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-xs text-muted-foreground text-center"
        >
          Click to mark as complete
        </motion.p>
      )}
    </motion.aside>
  );
};
