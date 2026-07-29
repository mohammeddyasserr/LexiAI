import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskBadge } from "@/components/risk-badge";
import { Search, Filter, Eye, Download } from "lucide-react";
import { contracts } from "@/lib/mock-data";

export const Route = createFileRoute("/contracts")({
  head: () => ({
    meta: [
      { title: "Contracts — Lexis AI" },
      {
        name: "description",
        content: "Browse and manage your contract library.",
      },
    ],
  }),
  component: Contracts,
});

function Contracts() {
  return (
    <AppShell
      title="Contracts"
      subtitle="Your full contract library"
      actions={
        <Button asChild className="gradient-navy text-white hover:opacity-90">
          <Link to="/upload">Upload</Link>
        </Button>
      }
    >
      <Card className="border-border">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, party, or clause…"
              className="pl-9"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.id} className="hover:bg-muted/40">
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.parties.join(" · ")}
                </TableCell>
                <TableCell className="font-medium">{c.amount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.date}
                </TableCell>
                <TableCell>
                  <RiskBadge level={c.risk} />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/analysis">
                      <Eye className="h-4 w-4" /> Open
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
