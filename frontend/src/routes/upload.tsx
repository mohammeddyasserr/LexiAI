import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  UploadCloud,
  FileText,
  ScanText,
  FileSearch,
  ShieldAlert,
  FileBarChart,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Contract — Lexis AI" },
      {
        name: "description",
        content:
          "Upload contracts to run OCR, clause detection, and risk analysis.",
      },
    ],
  }),
  component: UploadPage,
});

const steps = [
  {
    icon: ScanText,
    label: "OCR Extraction",
    desc: "Recognizing text and structure",
  },
  {
    icon: FileSearch,
    label: "Clause Detection",
    desc: "Identifying 40+ clause types",
  },
  {
    icon: ShieldAlert,
    label: "Risk Analysis",
    desc: "Scoring liabilities and anomalies",
  },
  {
    icon: FileBarChart,
    label: "AI Report Generation",
    desc: "Composing executive summary",
  },
];

function UploadPage() {
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [dragOver, setDragOver] = useState(false);

  const startUpload = () => {
    setFile({ name: "Global_Supply_Agreement_v3.pdf", size: "2.4 MB" });
    setProgress(0);
    setCurrentStep(-1);
    let p = 0;
    const iv = setInterval(() => {
      p += 8;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(iv);
        runPipeline();
      }
    }, 120);
  };

  const runPipeline = () => {
    let s = 0;
    setCurrentStep(0);
    const iv = setInterval(() => {
      s++;
      if (s >= steps.length) {
        setCurrentStep(steps.length);
        clearInterval(iv);
      } else setCurrentStep(s);
    }, 1200);
  };

  return (
    <AppShell
      title="Upload Contract"
      subtitle="Drop your PDF or DOCX to begin analysis"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card
          className={cn(
            "lg:col-span-3 border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-all duration-150 min-h-96",
            dragOver
              ? "border-accent bg-accent/5 shadow-sm"
              : "border-border/80",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            startUpload();
          }}
        >
          <div className="h-16 w-16 rounded-2xl gradient-ai flex items-center justify-center shadow-sm shadow-accent/20 mb-5">
            <UploadCloud className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight">
            Drop your contract here
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            PDF, DOCX, or scanned images up to 50 MB. Your files are encrypted
            end-to-end.
          </p>
          <div className="flex justify-center mt-6">
            <Button
              onClick={startUpload}
              className="gradient-navy text-white hover:opacity-90"
            >
              Choose file
            </Button>
          </div>

          {file && (
            <div className="w-full mt-8 max-w-md text-left">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-muted/30">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {file.size}
                  </div>
                </div>
                {progress === 100 ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <span className="text-xs font-medium">{progress}%</span>
                )}
              </div>
              <Progress value={progress} className="mt-3 h-1.5" />
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2 p-6 border-border/80">
          <h3 className="font-semibold tracking-tight">Processing Pipeline</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-6 leading-5">
            Live AI analysis stages
          </p>
          <ol className="space-y-4">
            {steps.map((s, i) => {
              const done = currentStep > i;
              const active = currentStep === i;
              const Icon = s.icon;
              return (
                <li key={s.label} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center border shrink-0 transition-all",
                      done && "bg-success/10 border-success/20 text-success",
                      active && "bg-accent/10 border-accent/30 text-accent",
                      !done &&
                        !active &&
                        "bg-muted border-border text-muted-foreground",
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : active ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="text-sm font-medium">
                      Step {i + 1}: {s.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.desc}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {currentStep >= steps.length && (
            <Button
              asChild
              className="w-full mt-6 gradient-navy text-white hover:opacity-90"
            >
              <Link to="/analysis">View Analysis →</Link>
            </Button>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
