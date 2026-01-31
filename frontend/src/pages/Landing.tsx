import { useState } from 'react';
import { Gavel } from 'lucide-react';

interface LandingProps {
  onSubmit: (email: string) => void;
}

export function Landing({ onSubmit }: LandingProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubmit(email.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-700">
            <Gavel className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Fulcrum<span className="text-amber-500">.ai</span>
          </h1>
        </div>

        {/* Hero */}
        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Democracy is decided by those who{' '}
          <span className="text-amber-500">show up</span>.
        </h2>
        <p className="text-xl text-zinc-400 mb-12">
          We tell you where to show up.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg
                       text-zinc-100 placeholder-zinc-500
                       focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                       transition-all"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold
                       rounded-lg transition-colors whitespace-nowrap"
          >
            Analyze My Impact
          </button>
        </form>

        {/* Trust indicators */}
        <p className="mt-8 text-sm text-zinc-500">
          No spam. Just civic opportunities that matter to you.
        </p>
      </div>
    </div>
  );
}
