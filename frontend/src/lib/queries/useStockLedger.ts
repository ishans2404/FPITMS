import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { StockLedgerEntryInput } from "@/lib/validators/stockLedger";
import type { LedgerTransactionType, MeasurementUnit } from "@/types/database";

export function useStockLedger(depotId: string | null | undefined) {
  return useQuery({
    queryKey: ["stock_ledger", depotId],
    enabled: !!depotId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_ledger")
        .select("*")
        .eq("depot_id", depotId as string)
        .order("recorded_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateStockLedgerEntry(depotId: string | null | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: StockLedgerEntryInput) => {
      if (!depotId) throw new Error("No depot assigned to this account.");
      // recorded_by is intentionally omitted — the column default (auth.uid())
      // and the insert policy's `recorded_by = auth.uid()` check both apply
      // server-side, so the client never asserts its own identity here.
      const { data, error } = await supabase
        .from("stock_ledger")
        .insert({ ...input, depot_id: depotId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock_ledger", depotId] });
      queryClient.invalidateQueries({ queryKey: ["stock_balance"] });
    },
  });
}

// A "correction" is just another insert, with reversal_of set. The
// validate_stock_reversal trigger (0003 migration) enforces it matches the
// original entry's depot/product and uses the opposite transaction_type.
export function useReverseStockLedgerEntry(depotId: string | null | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (original: {
      id: string;
      product_id: string;
      transaction_type: LedgerTransactionType;
      quantity: number;
      unit: MeasurementUnit;
      batch_lot_no: string;
      source_or_destination: string;
    }) => {
      if (!depotId) throw new Error("No depot assigned to this account.");
      const { data, error } = await supabase
        .from("stock_ledger")
        .insert({
          depot_id: depotId,
          product_id: original.product_id,
          transaction_type: original.transaction_type === "inward" ? "outward" : "inward",
          quantity: original.quantity,
          unit: original.unit,
          batch_lot_no: original.batch_lot_no,
          source_or_destination: original.source_or_destination,
          remarks: `Correction of entry ${original.id}`,
          reversal_of: original.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock_ledger", depotId] });
      queryClient.invalidateQueries({ queryKey: ["stock_balance"] });
    },
  });
}
