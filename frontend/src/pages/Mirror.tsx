import { User, MapPin, Briefcase, Check, Pencil } from 'lucide-react';
import type { InferredProfile } from '../types';

interface MirrorProps {
  profile: InferredProfile;
  onConfirm: () => void;
  onEdit: () => void;
}

export function Mirror({ profile, onConfirm, onEdit }: MirrorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-2">We found this about you</h2>
        <p className="text-zinc-400 text-center mb-8">Is this information correct?</p>

        {/* Dossier Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-zinc-400" />
            </div>
            <div>
              <p className="text-lg font-semibold">{profile.profession}</p>
              <p className="text-sm text-zinc-500">Inferred from public data</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-sm text-zinc-500">Profession</p>
                <p className="text-zinc-200">{profile.profession}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-sm text-zinc-500">Likely Location</p>
                <p className="text-zinc-200">{profile.likely_location}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-zinc-500 mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                       bg-zinc-800 hover:bg-zinc-700 text-zinc-200
                       rounded-lg transition-colors border border-zinc-700"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                       bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold
                       rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            Yes, this is correct
          </button>
        </div>
      </div>
    </div>
  );
}
