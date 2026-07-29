import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Upload,
  MessagesSquare,
  ShieldAlert,
  GitCompareArrows,
  FileBarChart,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contracts", label: "Contracts", icon: FileText },
  { to: "/upload", label: "Upload Contract", icon: Upload },
  { to: "/chat", label: "AI Chat", icon: MessagesSquare },
  { to: "/risk", label: "Risk Analysis", icon: ShieldAlert },
  { to: "/comparison", label: "Comparison", icon: GitCompareArrows },
  { to: "/reports", label: "Reports", icon: FileBarChart },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex md:w-64 h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border sticky top-0">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-sidebar-border/70">
        <div className="h-9 w-9 rounded-lg gradient-ai flex items-center justify-center shadow-lg shadow-accent/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight text-white">
            Lexis AI
          </span>
          <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
            Contract Intelligence
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {nav.map((item) => {
          const active =
            pathname === item.to ||
            (item.to !== "/dashboard" && pathname.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-sidebar-accent text-white shadow-sm border border-accent/25"
                  : "text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-accent")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border/70">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-semibold text-white">
              AI Engine Online
            </span>
          </div>
          <p className="text-[11px] text-sidebar-foreground/60 leading-relaxed">
            GPT-4 · RAG · OCR pipeline ready
          </p>
        </div>
      </div>
    </aside>
  );
}
