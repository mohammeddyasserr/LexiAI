import { cn } from "@/lib/utils";

type Level = "low" | "medium" | "high" | "critical";

const styles: Record<Level, string> = {
  low: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/15 text-warning-foreground border-warning/30",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  critical: "bg-destructive text-destructive-foreground border-destructive",
};

const labels: Record<Level, string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
  critical: "Critical",
};

export function RiskBadge({
  level,
  className,
}: {
  level: Level;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors duration-150",
        styles[level],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[level]}
    </span>
  );
}
