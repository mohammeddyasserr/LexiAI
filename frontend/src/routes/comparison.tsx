import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/risk-badge";
import { Upload, FileText, Check, X, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/comparison")({
  head: () => ({
    meta: [
      { title: "Contract Comparison — Lexis AI" },
      {
        name: "description",
        content: "Compare two contracts side by side with AI recommendations.",
      },
    ],
  }),
  component: Comparison,
});

// Turns a Windows/Unix server path like "C:\\...\\uploads\\contractA.pdf"
// into just "contractA.pdf" so we can match it against the File objects
// the user actually picked in the browser.
function baseName(path?: string) {
  if (!path) return "";
  return path.split(/[\\/]/).pop()?.toLowerCase() ?? "";
}

function Comparison() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());
  const fileInputA = useRef<HTMLInputElement | null>(null);
  const fileInputB = useRef<HTMLInputElement | null>(null);

  const toggleCell = (key: string) => {
    setExpandedCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const uploadAndCompare = async () => {
    if (!fileA || !fileB) {
      setError("Please select both contracts before comparing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("contract_a", fileA);
      formData.append("contract_b", fileB);

      const response = await fetch("http://127.0.0.1:8000/contract-analysis/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.detail?.[0]?.msg || "Upload failed.");
      }

      const data = await response.json();
      setResult(data);
      setExpandedCells(new Set());
    } catch (err) {
      setError((err as Error).message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // The backend's "contract_a"/"contract_b" keys are NOT reliable — they can
  // come back swapped relative to the files the user actually uploaded as
  // Contract A / Contract B. Instead, match each returned contract's file
  // name against the real uploaded File objects, and fall back to the raw
  // key only if no name matches (e.g. before a comparison has run).
  const resolveContractLabel = (contractKey: "contract_a" | "contract_b", contractData: any) => {
    const name = baseName(contractData?.name);
    if (fileA && name === fileA.name.toLowerCase()) return { label: "Contract A", accent: "primary" as const };
    if (fileB && name === fileB.name.toLowerCase()) return { label: "Contract B", accent: "accent" as const };
    return {
      label: contractKey.replace("_", " ").toUpperCase(),
      accent: contractKey === "contract_a" ? ("primary" as const) : ("accent" as const),
    };
  };

  const contractAData = result?.contracts?.contract_a;
  const contractBData = result?.contracts?.contract_b;
  const labelA = contractAData ? resolveContractLabel("contract_a", contractAData).label : "Contract A";
  const labelB = contractBData ? resolveContractLabel("contract_b", contractBData).label : "Contract B";

  return (
    <AppShell
      title="Contract Comparison"
      subtitle="Side-by-side analysis with AI recommendations"
    >
      {/* Uploads */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[
          { label: "Contract A", file: fileA },
          { label: "Contract B", file: fileB },
        ].map((c, i) => (
          <Card
            key={i}
            className="p-5 border-border flex items-center gap-4 bg-white/90"
          >
            <div
              className={cn(
                "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
                i === 0
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/10 text-accent",
              )}
            >
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">{c.label}</div>
              <div className="font-semibold truncate">
                {c.file ? c.file.name : `Select a file for ${c.label}`}
              </div>
            </div>
            <input
              ref={i === 0 ? fileInputA : fileInputB}
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                if (i === 0) {
                  setFileA(selected);
                } else {
                  setFileB(selected);
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                const input = i === 0 ? fileInputA.current : fileInputB.current;
                input?.click();
              }}
            >
              <Upload className="h-3.5 w-3.5" /> Upload file
            </Button>
          </Card>
        ))}
      </div>

      <div className="mb-6">
        <Button
          className="w-full max-w-xs"
          onClick={uploadAndCompare}
          disabled={loading}
        >
          {loading ? "Analyzing…" : "Compare Contracts"}
        </Button>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {result && (
        <>
          {/* Recommendation */}
          <Card className="p-6 border-border mb-6 relative overflow-hidden bg-white/90">
            <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
            <div className="relative flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl gradient-ai flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-accent uppercase tracking-widest">
                  AI Recommendation
                </div>
                <h3 className="text-xl font-bold tracking-tight mt-1">
                  {result?.recommendation?.winner
                    ? `${result.recommendation.winner} is the better option`
                    : "Analyzing contracts..."}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
                  {result?.recommendation?.reason}
                </p>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="border-border overflow-hidden bg-white/90 mb-6">
            <div className="grid grid-cols-[1.2fr_1.4fr_1.4fr_0.6fr] items-center px-5 py-3 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <div>Feature</div>
              <div>{labelA}</div>
              <div>{labelB}</div>
              <div className="text-center">Winner</div>
            </div>
            {result?.comparison
              ?.filter((r: any) => {
                const summaryA = r.contract_a?.summary;
                const summaryB = r.contract_b?.summary;

                const hasA =
                  summaryA &&
                  summaryA.toLowerCase() !== "not found";

                const hasB =
                  summaryB &&
                  summaryB.toLowerCase() !== "not found";

                return hasA || hasB;
              })
              .map((r: any, idx: number) => {
                const cellA = `${idx}-a`;
                const cellB = `${idx}-b`;
                const summaryA = r.contract_a?.summary;
                const summaryB = r.contract_b?.summary;

                const fullClauseA = r.contract_a?.full_clause;
                const fullClauseB = r.contract_b?.full_clause;
                // const isLongA = (textA?.length ?? 0) > 160;
                // const isLongB = (textB?.length ?? 0) > 160;

                return (
                  <div
                    key={r.feature}
                    className="grid grid-cols-[1.2fr_1.4fr_1.4fr_0.6fr] items-start px-5 py-4 border-b last:border-b-0"
                  >
                    <div className="font-medium text-sm pr-2">{r.feature}</div>

                    <div className="text-sm pr-3">
                      <p className="font-medium text-foreground">
                        {summaryA || "Not found"}
                      </p>

                      {fullClauseA && (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleCell(cellA)}
                            className="text-primary text-xs font-medium mt-2 hover:underline flex items-center gap-1"
                          >
                            <ChevronDown
                              className={cn(
                                "h-3 w-3 transition-transform",
                                expandedCells.has(cellA) && "rotate-180"
                              )}
                            />

                            {expandedCells.has(cellA)
                              ? "Hide full clause"
                              : "Show full clause"}
                          </button>

                          {expandedCells.has(cellA) && (
                            <p className="mt-2 text-xs text-muted-foreground border-l-2 pl-2">
                              {fullClauseA}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="text-sm pr-3">
                      <p className="font-medium text-foreground">
                        {summaryB || "Not found"}
                      </p>

                      {fullClauseB && (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleCell(cellB)}
                            className="text-primary text-xs font-medium mt-2 hover:underline flex items-center gap-1"
                          >
                            <ChevronDown
                              className={cn(
                                "h-3 w-3 transition-transform",
                                expandedCells.has(cellB) && "rotate-180"
                              )}
                            />

                            {expandedCells.has(cellB)
                              ? "Hide full clause"
                              : "Show full clause"}
                          </button>

                          {expandedCells.has(cellB) && (
                            <p className="mt-2 text-xs text-muted-foreground border-l-2 pl-2">
                              {fullClauseB}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="text-center">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-1 text-xs font-semibold",
                          r.winner === "Contract A" && "bg-primary/10 text-primary",
                          r.winner === "Contract B" && "bg-accent/10 text-accent",
                          r.winner !== "Contract A" && r.winner !== "Contract B" && "bg-muted text-muted-foreground",
                        )}
                      >
                        {r.winner ?? "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
          </Card>

          {/* Risk comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: "contract_a" as const, data: contractAData },
              { key: "contract_b" as const, data: contractBData },
            ].map(({ key, data }) => {
              if (!data?.risk_analysis) return null;
              const { label } = resolveContractLabel(key, data);
              const riskItems = Object.entries(data.risk_analysis);
              const highRiskCount = riskItems.filter(
                ([, value]: any) => value.severity === "High",
              ).length;
              const score = Math.min(100, highRiskCount * 30);

              return (
                <Card key={key} className="p-5 border-border bg-white/90">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{label} · Risk Profile</h3>
                      <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                        {baseName(data.name) || "—"}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "text-3xl font-bold",
                        score >= 70 ? "text-destructive" : score >= 40 ? "text-amber-600" : "text-emerald-600",
                      )}
                    >
                      {score}
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    {riskItems.map(([riskName, risk]: any) => (
                      <div key={riskName} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-semibold text-sm">{riskName}</span>
                          <RiskBadge
                            level={
                              risk.severity === "High"
                                ? "high"
                                : risk.severity === "Medium"
                                  ? "medium"
                                  : "low"
                            }
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Type: {risk.risk_type}</p>
                        <p className="text-sm mt-2">{risk.reason}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </AppShell>
  );
}
