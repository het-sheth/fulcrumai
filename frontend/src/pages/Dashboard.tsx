import { useState } from 'react';
import { User, MapPin, Award, Gavel, RefreshCw } from 'lucide-react';
import type { UserProfile, CivicEvent } from '../types';
import { ImpactCard } from '../components/ImpactCard';

interface DashboardProps {
  profile: UserProfile;
}

const mockEvents: CivicEvent[] = [
  {
    id: '1',
    title: 'Parking Meter Extension',
    summary: 'Proposal to extend parking meter hours to 10 PM in the Mission District.',
    urgency: 'High',
    deadline: 'Vote in 48h',
    impact_tags: ['parking', 'transportation', 'mission'],
    source_url: 'https://sfbos.org/legislative-research-center-lrc',
    personalizedReason: 'Because you drive a car and live in Mission, this will cost you ~$400/year.',
  },
  {
    id: '2',
    title: 'Valencia Street Slow Street Removal',
    summary: 'SFMTA to vote on removing Slow Street designation from Valencia between 14th and 24th.',
    urgency: 'High',
    deadline: 'Hearing Thu 2pm',
    impact_tags: ['traffic', 'bike lanes', 'valencia'],
    source_url: 'https://www.sfmta.com/meetings-events',
    personalizedReason: 'This affects your commute route based on your location.',
  },
  {
    id: '3',
    title: 'SFUSD Budget Hearing',
    summary: 'Public comment period on proposed 5% budget reduction affecting art and music programs.',
    urgency: 'Medium',
    deadline: 'Comments due Mon',
    impact_tags: ['education', 'schools', 'budget'],
    source_url: 'https://go.boarddocs.com/ca/sfusd/Board.nsf/Public',
  },
  {
    id: '4',
    title: 'New Housing Development at 1200 Van Ness',
    summary: '15-story mixed-use development with 200 units. Section 311 notice period open.',
    urgency: 'Low',
    deadline: undefined,
    impact_tags: ['housing', 'zoning', 'development'],
    source_url: 'https://sfplanning.org/page/public-notices-project-applications',
  },
];

export function Dashboard({ profile }: DashboardProps) {
  const [events, setEvents] = useState<CivicEvent[]>(mockEvents);

  const handleDismiss = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const civicStrengths = [
    profile.interests.includes('Tech Policy') ? 'Tech Policy Expert' : null,
    profile.hasCar ? 'Commuter' : 'Transit User',
    profile.housingStatus === 'own' ? 'Property Owner' : 'Renter',
    profile.hasKids ? 'SFUSD Parent' : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg">
              <Gavel className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-lg font-semibold">
              Fulcrum<span className="text-amber-500">.ai</span>
            </span>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-24">
              {/* Avatar & Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-zinc-400" />
                </div>
                <div>
                  <p className="font-semibold">{profile.profession}</p>
                  <div className="flex items-center gap-1 text-sm text-zinc-500">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </div>
                </div>
              </div>

              {/* Civic Strengths */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-zinc-400">Civic Strengths</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {civicStrengths.map((strength) => (
                    <span
                      key={strength}
                      className="px-3 py-1 bg-amber-500/10 text-amber-400 text-sm rounded-full border border-amber-500/20"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <span className="text-sm font-medium text-zinc-400 block mb-3">Interests</span>
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

          {/* Right Column - Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Impact Opportunities</h2>
              <span className="text-sm text-zinc-500">{events.length} active</span>
            </div>

            <div className="space-y-4">
              {events.map((event) => (
                <ImpactCard key={event.id} event={event} onDismiss={handleDismiss} />
              ))}

              {events.length === 0 && (
                <div className="text-center py-12 text-zinc-500">
                  <p>No active opportunities right now.</p>
                  <p className="text-sm">Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
