interface SpinnerProps {
  message?: string;
}

/** Animated loading spinner used while fetching from Jikan. */
export default function Spinner({ message }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 animate-spin-slow rounded-full border-4 border-transparent border-t-team-red border-r-team-blue" />
      </div>
      {message && (
        <p className="max-w-xs animate-fade-in font-serif text-lg text-white/80">
          {message}
        </p>
      )}
    </div>
  );
}
