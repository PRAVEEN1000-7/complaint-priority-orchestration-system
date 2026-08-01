import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "primary";
  progress?: number;
}

const toneMap = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, sub, icon: Icon, tone = "default", progress }: Props) {
  return (
    <div className="rounded-2xl bg-gradient-card border border-border p-5 shadow-card hover:shadow-elegant transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-hero"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}
