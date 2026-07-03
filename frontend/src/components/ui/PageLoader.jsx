import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <Loader2 className="w-8 h-8 text-gradient-primary animate-spin" />
      <p className="text-sm font-medium text-gray-500 animate-pulse">Loading page...</p>
    </div>
  );
}
