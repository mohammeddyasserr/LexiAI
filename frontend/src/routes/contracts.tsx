import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import { Search, Filter, Eye } from "lucide-react";
import { getContracts } from "@/lib/contracts-api";

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
  const { data, isLoading, isError } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });

  const contracts = data ?? [];

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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Loading contracts…
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-destructive"
                >
                  We couldn’t load contracts from the backend. Please try again
                  later.
                </TableCell>
              </TableRow>
            ) : contracts.length > 0 ? (
              contracts.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.parties.length > 0 ? c.parties.join(" · ") : "-"}
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No contracts were returned by the backend.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
