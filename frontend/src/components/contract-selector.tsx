import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRouter } from "@tanstack/react-router";
import { AlertCircle, FileText, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getContracts, type Contract } from "@/lib/contracts-api";
import { cn } from "@/lib/utils";

interface ContractSelectorProps {
  onContractChange?: (contract: Contract | null) => void;
  className?: string;
}

export function ContractSelector({
  onContractChange,
  className,
}: ContractSelectorProps) {
  const router = useRouter();
  const location = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    getContractIdFromSearch(location.search),
  );

  const {
    data: contracts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });

  useEffect(() => {
    const currentId = getContractIdFromSearch(location.search);
    if (currentId !== selectedId) {
      setSelectedId(currentId);
    }
  }, [location.search, selectedId]);

  useEffect(() => {
    const contract = contracts.find((item) => item.id === selectedId) ?? null;
    onContractChange?.(contract);
  }, [contracts, onContractChange, selectedId]);

  const handleChange = (nextValue: string) => {
    setSelectedId(nextValue);
    router.navigate({
      to: location.pathname,
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        contractId: nextValue,
        contract_id: nextValue,
      }),
    });
  };

  const placeholderLabel = isLoading
    ? "Loading contracts…"
    : isError
      ? "Unable to load contracts"
      : contracts.length > 0
        ? "Select a contract"
        : "No contracts available";

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-muted/20 p-3",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <FileText className="h-3.5 w-3.5" /> Contract
      </div>
      <div className="mt-2">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading contracts…
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Unable to load contracts from the backend.
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No contracts are available yet.
          </div>
        ) : (
          <Select value={selectedId ?? undefined} onValueChange={handleChange}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder={placeholderLabel} />
            </SelectTrigger>
            <SelectContent>
              {contracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id}>
                  {contract.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

function getContractIdFromSearch(search: string | Record<string, unknown>) {
  if (typeof search === "string") {
    const params = new URLSearchParams(search);
    return params.get("contractId") ?? params.get("contract_id");
  }

  return typeof search.contractId === "string"
    ? search.contractId
    : typeof search.contract_id === "string"
      ? search.contract_id
      : null;
}
