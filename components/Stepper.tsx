'use client';

// Progress indicator showing only the steps a level requires.
interface Step { key: string; label: string }

export function Stepper({
  title,
  steps,
  current,
  completed = {},
}: {
  title?: string;
  steps: Step[];
  current: string;
  completed?: Record<string, boolean | undefined>;
}) {
  const currentIdx = steps.findIndex((s) => s.key === current);
  return (
    <div className="space-y-2">
      {title && (
        <div className="text-xs font-semibold uppercase tracking-wide text-rac-text-secondary">
          {title}
        </div>
      )}
      <div className="flex gap-1.5" aria-hidden="true">
        {steps.map((s, i) => {
          const isDone = completed[s.key] || (currentIdx > -1 && i < currentIdx);
          const isActive = s.key === current;
          return (
            <span
              key={s.key}
              className={`h-1.5 flex-1 rounded-full ${
                isDone ? 'bg-green-500' : isActive ? 'bg-rac-red' : 'bg-rac-gray'
              }`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-rac-text-secondary">
        <span>{steps.map((s) => s.label).join(' · ')}</span>
        <span>
          {Math.min(currentIdx + 1, steps.length)}/{steps.length}
        </span>
      </div>
    </div>
  );
}
