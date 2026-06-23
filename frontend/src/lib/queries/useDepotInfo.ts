import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

// Single depot row — used in DepotInfoBanner and wherever profile.depot_id
// needs to be resolved to a full Depot record.
export function useDepotInfo(depotId: string | null | undefined) {
  return useQuery({
    queryKey: ["depot_info", depotId],
    enabled: !!depotId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("depots")
        .select("*")
        .eq("id", depotId as string)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

// Single division row — called after useDepotInfo resolves a division_id.
// Kept separate so it only runs once the depot query completes.
export function useDivisionInfo(divisionId: string | null | undefined) {
  return useQuery({
    queryKey: ["division_info", divisionId],
    enabled: !!divisionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("divisions")
        .select("*")
        .eq("id", divisionId as string)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

// Aggregate counts for the ledger stats strip. Uses server-side COUNT (*) with
// head:true so no row data crosses the wire — just the integer counts.
// reversal_of IS NULL excludes correction rows from the headline numbers
// (they are still auditable in the full ledger table).
export function useLedgerStats(depotId: string | null | undefined) {
  return useQuery({
    queryKey: ["ledger_stats", depotId],
    enabled: !!depotId,
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [{ count: totalEntries, error: e1 }, { count: todayEntries, error: e2 }] =
        await Promise.all([
          supabase
            .from("stock_ledger")
            .select("*", { count: "exact", head: true })
            .eq("depot_id", depotId as string)
            .is("reversal_of", null),
          supabase
            .from("stock_ledger")
            .select("*", { count: "exact", head: true })
            .eq("depot_id", depotId as string)
            .is("reversal_of", null)
            .gte("recorded_at", todayStart.toISOString()),
        ]);

      if (e1) throw e1;
      if (e2) throw e2;

      return {
        totalEntries: totalEntries ?? 0,
        todayEntries: todayEntries ?? 0,
      };
    },
  });
}