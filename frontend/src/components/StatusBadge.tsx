import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

type Status = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

const config: Record<Status, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING:    { label: "Pending",    className: "text-slate-500 bg-slate-100 dark:bg-slate-800",                    icon: <Clock className="w-3 h-3" /> },
  PROCESSING: { label: "Scoring...", className: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  COMPLETED:  { label: "Scored",     className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  FAILED:     { label: "Failed",     className: "text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400",      icon: <XCircle className="w-3 h-3" /> },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className, icon } = config[status] ?? config.PENDING;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", className)}>
      {icon} {label}
    </span>
  );
}
