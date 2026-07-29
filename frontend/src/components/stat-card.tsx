import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  hint?: string;
}

export function StatCard({
  label,
  value,
  delta,
  trend = "up",
  icon: Icon,
  hint,
}: StatCardProps) {
  return (
    <Card className="p-5 border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">
            {label}
          </p>
          <p className="text-3xl font-semibold mt-2 tracking-tight">{value}</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {(delta || hint) && (
        <div className="flex items-center gap-2 mt-4 text-xs">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                trend === "up" ? "text-success" : "text-destructive",
              )}
            >
              {trend === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {delta}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
