import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-6" />
        <p className="text-xl text-zinc-300 mb-2">Analyzing digital footprint via Nyne.ai...</p>
        <p className="text-sm text-zinc-500">Building your civic profile</p>
      </div>
    </div>
  );
}
