import { Card } from "./Card";

type CompletionCardProps = {
  filled: number;
  total: number;
  percentage: number;
  className?: string;
};

export function CompletionCard({
  filled,
  total,
  percentage,
  className = "",
}: CompletionCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-stone-900">
            {filled}{" "}
            <span className="font-medium text-stone-400">/ {total} Pixels</span>
          </p>
        </div>
        <p className="text-[15px] font-semibold tracking-tight text-stone-900">
          {percentage}%{" "}
          <span className="font-medium text-stone-400">Complete</span>
        </p>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-stone-200/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-300 via-amber-200 to-violet-300 shadow-[0_0_12px_rgba(255,180,200,0.4)] transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${percentage}% complete`}
        />
      </div>
    </Card>
  );
}
