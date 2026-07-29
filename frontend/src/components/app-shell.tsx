import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";

interface AppShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: AppShellProps) {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      <div className="hidden md:flex h-screen shrink-0">
        <AppSidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 gap-4 shrink-0">
          <div className="flex-1 flex items-center gap-4 min-w-0">
            <div className="min-w-0 space-y-1">
              <h1 className="text-lg font-medium tracking-tight truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate leading-5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions}
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:px-5 xl:px-6 2xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
