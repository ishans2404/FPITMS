import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type {
  StockRegisterRow,
  TransitPassReportRow,
  CheckpostVerificationReportRow,
  DailySummaryRow,
} from "@/types/database";

// Shared date-range filter shape used across all report hooks.
export interface DateRange {
  from: string; // yyyy-mm-dd, empty string = no lower bound
  to: string;   // yyyy-mm-dd, empty string = no upper bound
}

export function defaultRange(days = 30): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

// ── Stock Register ─────────────────────────────────────────────────────────
// Reads v_stock_register; security_invoker scopes to the user's RLS
// automatically (depot_staff → own depot, dfo → own division, hq → all).
export function useStockRegister(range: DateRange) {
  return useQuery({
    queryKey: ["v_stock_register", range.from, range.to],
    queryFn: async (): Promise<StockRegisterRow[]> => {
      let q = supabase
        .from("v_stock_register")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(500);
      if (range.from) q = q.gte("recorded_at", `${range.from}T00:00:00`);
      if (range.to)   q = q.lte("recorded_at", `${range.to}T23:59:59`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as StockRegisterRow[];
    },
  });
}

// ── Transit Pass Report ────────────────────────────────────────────────────
export function useTransitPassReport(range: DateRange) {
  return useQuery({
    queryKey: ["v_transit_pass_report", range.from, range.to],
    queryFn: async (): Promise<TransitPassReportRow[]> => {
      let q = supabase
        .from("v_transit_pass_report")
        .select("*")
        .order("issued_at", { ascending: false })
        .limit(500);
      if (range.from) q = q.gte("issued_at", `${range.from}T00:00:00`);
      if (range.to)   q = q.lte("issued_at", `${range.to}T23:59:59`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as TransitPassReportRow[];
    },
  });
}

// ── Checkpost Verification Report ─────────────────────────────────────────
export function useCheckpostVerificationReport(range: DateRange) {
  return useQuery({
    queryKey: ["v_checkpost_verification_report", range.from, range.to],
    queryFn: async (): Promise<CheckpostVerificationReportRow[]> => {
      let q = supabase
        .from("v_checkpost_verification_report")
        .select("*")
        .order("verified_at", { ascending: false })
        .limit(500);
      if (range.from) q = q.gte("verified_at", `${range.from}T00:00:00`);
      if (range.to)   q = q.lte("verified_at", `${range.to}T23:59:59`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CheckpostVerificationReportRow[];
    },
  });
}

// ── Daily Summary (for bar charts) ────────────────────────────────────────
export function useDailySummary(days = 30) {
  return useQuery({
    queryKey: ["v_daily_summary", days],
    queryFn: async (): Promise<DailySummaryRow[]> => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data, error } = await supabase
        .from("v_daily_summary")
        .select("*")
        .gte("day", since.toISOString().split("T")[0])
        .order("day", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DailySummaryRow[];
    },
    staleTime: 5 * 60 * 1000, // charts can be slightly stale
  });
}