import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/routes/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lexis AI" },
      {
        name: "description",
        content: "Contract analytics, risk distribution, and recent activity.",
      },
    ],
  }),
  component: Dashboard,
});
