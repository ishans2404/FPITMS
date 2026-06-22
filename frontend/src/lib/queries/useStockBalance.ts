import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

// Reads the stock_balance VIEW — never a stored total. RLS on the underlying
// stock_ledger table (via security_invoker) already scopes this to whatever
// depots the current user can see; no extra filtering is needed here.
export function useStockBalance() {
  return useQuery({
    queryKey: ["stock_balance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stock_balance").select("*");
      if (error) throw error;
      return data;
    },
  });
}
