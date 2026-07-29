import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadContract } from "@/lib/upload-api";

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

// ─── types ────────────────────────────────────────────────────────────────────
type UploadState = "idle" | "loading" | "success" | "failed";

// ─── Full-page overlay ────────────────────────────────────────────────────────
function FullPageOverlay({
  state,
  onReset,
}: {
  state: "loading" | "success" | "failed";
  onReset: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at center, hsl(var(--background)) 0%, hsl(var(--background)/0.97) 100%)",
        backdropFilter: "blur(2px)",
      }}
    >
      {state === "loading" && (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
          {/* Spinning ring */}
          <div className="relative h-28 w-28">
            <div
              className="absolute inset-0 rounded-full border-4 border-border/30"
            />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin"
              style={{ animationDuration: "0.9s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-9 w-9 text-accent animate-spin" style={{ animationDuration: "1.4s" }} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold tracking-tight">Processing contract…</p>
            <p className="text-sm text-muted-foreground mt-1">
              Running OCR, clause detection & risk analysis
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-accent"
                style={{
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {state === "success" && (
        <div className="flex flex-col items-center gap-6 animate-in zoom-in-75 duration-500">
          {/* Big green check */}
          <div
            className="h-36 w-36 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background:
                "radial-gradient(circle, hsl(142 71% 45% / 0.15) 0%, transparent 70%)",
              border: "3px solid hsl(142 71% 45% / 0.4)",
            }}
          >
            <CheckCircle2
              className="h-20 w-20"
              style={{ color: "hsl(142 71% 45%)" }}
              strokeWidth={1.5}
            />
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold tracking-tight">Contract Accepted!</p>
            <p className="text-muted-foreground mt-2">
              Your contract has been processed and saved successfully.
            </p>
          </div>
          <Button
            onClick={onReset}
            className="gradient-navy text-white hover:opacity-90 mt-2 px-8"
          >
            Upload Another
          </Button>
        </div>
      )}

      {state === "failed" && (
        <div className="flex flex-col items-center gap-6 animate-in zoom-in-75 duration-500">
          {/* Big red X */}
          <div
            className="h-36 w-36 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background:
                "radial-gradient(circle, hsl(0 72% 51% / 0.15) 0%, transparent 70%)",
              border: "3px solid hsl(0 72% 51% / 0.4)",
            }}
          >
            <XCircle
              className="h-20 w-20"
              style={{ color: "hsl(0 72% 51%)" }}
              strokeWidth={1.5}
            />
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold tracking-tight">Upload Failed</p>
            <p className="text-muted-foreground mt-2">
              Something went wrong. Please try again.
            </p>
          </div>
          <Button
            onClick={onReset}
            variant="outline"
            className="mt-2 px-8 border-border/80"
          >
            Try Again
          </Button>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40%            { transform: scale(1); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function UploadPage() {
  const [file, setFile] = useState<{ name: string; size: string; raw: File } | null>(null);
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (raw: File) => {
    const sizeMB = (raw.size / 1024 / 1024).toFixed(1);
    setFile({ name: raw.name, size: `${sizeMB} MB`, raw });
    setError(null);
  };

  const startUpload = async () => {
    if (!file) return;
    if (!title.trim()) {
      setError("Please enter a contract title before uploading.");
      return;
    }

    setError(null);
    setUploadState("loading");

    try {
      await uploadContract(title.trim(), file.raw);
      setUploadState("success");
    } catch (err: unknown) {
      console.error(err);
      setUploadState("failed");
    }
  };

  /** Reset everything so user can upload another file */
  const resetPage = () => {
    setFile(null);
    setTitle("");
    setError(null);
    setUploadState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isUploading = uploadState !== "idle";

  return (
    <>
      {/* Full-page overlay while uploading / after result */}
      {isUploading && uploadState !== "idle" && (
        <FullPageOverlay
          state={uploadState as "loading" | "success" | "failed"}
          onReset={resetPage}
        />
      )}

      <AppShell
        title="Upload Contract"
        subtitle="Drop your PDF to begin analysis"
      >
        <div className="max-w-xl mx-auto">
          <Card
            className={cn(
              "border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-all duration-150 min-h-96",
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
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) handleFileSelected(droppedFile);
            }}
          >
            <div className="h-16 w-16 rounded-2xl gradient-ai flex items-center justify-center shadow-sm shadow-accent/20 mb-5">
              <UploadCloud className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
              Drop your contract here
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              PDF files up to 50 MB. Your files are encrypted end-to-end.
            </p>

            {/* Title input */}
            <div className="w-full max-w-sm mt-6 text-left">
              <label
                htmlFor="contract-title"
                className="block text-xs font-medium text-muted-foreground mb-1.5"
              >
                Contract Title <span className="text-destructive">*</span>
              </label>
              <input
                id="contract-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Supply Agreement v3"
                className="w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition"
              />
            </div>

            {/* Selected file indicator */}
            {file && (
              <div className="w-full max-w-sm mt-4 flex items-center gap-3 p-3 rounded-xl border border-border/80 bg-muted/30 text-left">
                <div className="h-9 w-9 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{file.size}</div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <p className="mt-3 text-xs text-destructive font-medium">{error}</p>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelected(f);
              }}
            />

            <div className="flex gap-3 justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-border/80"
              >
                Choose file
              </Button>
              <Button
                onClick={startUpload}
                disabled={!file}
                className="gradient-navy text-white hover:opacity-90 disabled:opacity-50"
              >
                Upload &amp; Analyse
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
