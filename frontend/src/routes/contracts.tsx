import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { Search, Filter, Eye, Download } from "lucide-react";
import { getContracts, type Contract } from "@/lib/contracts-api";

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

function downloadContractPdf(contract: Contract) {
  const lines = [
    `Contract: ${contract.name}`,
    `Type: ${contract.type}`,
    `Date: ${contract.date}`,
    `Risk: ${contract.risk}`,
    `Amount: ${contract.amount}`,
    `Parties: ${contract.parties.length > 0 ? contract.parties.join(", ") : "-"}`,
    `Status: ${contract.status}`,
  ];

  const contentStream = lines
    .map((line, index) => {
      const y = 760 - index * 18;
      return `BT /F1 12 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join("\n");

  const streamLength = new TextEncoder().encode(contentStream).length;
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefPosition = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R>>\nstartxref\n${xrefPosition}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(contract.name)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function sanitizeFilename(value: string) {
  return value
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | Contract["risk"]>("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });

  const contracts = data ?? [];

  const filteredContracts = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return contracts.filter((contract) => {
      const matchesRisk =
        riskFilter === "all" ? true : contract.risk === riskFilter;
      const haystack = [
        contract.name,
        contract.parties.join(" "),
        contract.amount,
        contract.date,
        contract.type,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

      return matchesRisk && matchesQuery;
    });
  }, [contracts, riskFilter, searchTerm]);

  const handleFilterToggle = () => {
    setRiskFilter((current) => {
      if (current === "all") return "low";
      if (current === "low") return "medium";
      if (current === "medium") return "high";
      if (current === "high") return "critical";
      return "all";
    });
  };

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
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, party, or clause…"
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handleFilterToggle} type="button">
            <Filter className="h-4 w-4" />
            {riskFilter === "all"
              ? "All risks"
              : riskFilter.charAt(0).toUpperCase() + riskFilter.slice(1)}
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
            ) : filteredContracts.length > 0 ? (
              filteredContracts.map((c) => (
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
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          to="/reports"
                          search={{ contractId: c.id, contract_id: c.id }}
                        >
                          <Eye className="h-4 w-4" /> Open
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => downloadContractPdf(c)}
                        aria-label={`Download ${c.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No contracts match the current search or filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
