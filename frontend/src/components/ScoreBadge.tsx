import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function getColor(score: number) {
  if (score >= 80) return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50", ring: "#10b981" };
  if (score >= 60) return { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/50", ring: "#3b82f6" };
  if (score >= 40) return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50", ring: "#f59e0b" };
  return { text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/50", ring: "#ef4444" };
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const { text, bg, ring } = getColor(score);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  if (size === "lg") {
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width="80" height="80" className="-rotate-90">
          <circle cx="40" cy="40" r={radius + 8} stroke="currentColor" strokeWidth="6"
            className="text-slate-100 dark:text-slate-800" fill="none" />
          <circle cx="40" cy="40" r={radius + 8} stroke={ring} strokeWidth="6"
            fill="none" strokeDasharray={(2 * Math.PI * (radius + 8)).toString()}
            strokeDashoffset={(2 * Math.PI * (radius + 8)) - (score / 100) * (2 * Math.PI * (radius + 8))}
            strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <span className={cn("absolute text-xl font-bold", text)}>{score}</span>
      </div>
    );
  }

  if (size === "sm") {
    return (
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold", text, bg)}>
        {score}
      </span>
    );
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4"
          className="text-slate-100 dark:text-slate-800" fill="none" />
        <circle cx="24" cy="24" r={radius} stroke={ring} strokeWidth="4"
          fill="none" strokeDasharray={circumference.toString()}
          strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className={cn("absolute text-xs font-bold", text)}>{score}</span>
    </div>
  );
}
