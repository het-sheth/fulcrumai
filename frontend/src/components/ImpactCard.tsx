import { AlertTriangle, ExternalLink, Mail, X } from 'lucide-react';
import type { CivicEvent } from '../types';

interface ImpactCardProps {
  event: CivicEvent;
  onDismiss: (id: string) => void;
}

export function ImpactCard({ event, onDismiss }: ImpactCardProps) {
  const urgencyStyles = {
    High: 'bg-red-500/10 text-red-400 border-red-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Low: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };

  const urgencyBadge = {
    High: 'URGENT',
    Medium: 'UPCOMING',
    Low: 'FYI',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {event.urgency === 'High' && (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded border ${urgencyStyles[event.urgency]}`}
          >
            {urgencyBadge[event.urgency]}
            {event.deadline && `: ${event.deadline}`}
          </span>
        </div>
        <button
          onClick={() => onDismiss(event.id)}
          className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{event.title}</h3>

      {/* Personalized Reason */}
      {event.personalizedReason && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-200">
            <span className="font-medium">Why it matters to you: </span>
            {event.personalizedReason}
          </p>
        </div>
      )}

      {/* Summary */}
      <p className="text-zinc-400 text-sm mb-4">{event.summary}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {event.impact_tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2
                     bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm
                     rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Read Draft
        </a>
        <button
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2
                     bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-medium
                     rounded-lg transition-colors"
        >
          <Mail className="w-4 h-4" />
          Email Supervisor
        </button>
      </div>
    </div>
  );
}
