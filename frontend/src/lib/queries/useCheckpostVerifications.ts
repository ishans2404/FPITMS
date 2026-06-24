import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

// Verifications at a specific checkpost — RLS scopes this to
// checkpost_staff's own checkpost automatically.
export function useCheckpostVerifications(checkpostId: string | null | undefined) {
  return useQuery({
    queryKey: ["checkpost_verifications", checkpostId],
    enabled: !!checkpostId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checkpost_verifications")
        .select(`
          *,
          transit_pass:transit_passes (
            pass_no, quantity, unit, destination, status,
            product:product_master ( name, code )
          ),
          vehicle:vehicles ( registration_no )
        `)
        .eq("checkpost_id", checkpostId as string)
        .order("verified_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

// All verifications across the entire project — for DFO / HQ read-only view
export function useAllCheckpostVerifications() {
  return useQuery({
    queryKey: ["checkpost_verifications_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checkpost_verifications")
        .select(`
          *,
          transit_pass:transit_passes (
            pass_no, quantity, unit, destination, status,
            product:product_master ( name, code )
          ),
          checkpost:checkposts ( name, code ),
          vehicle:vehicles ( registration_no )
        `)
        .order("verified_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
}

export interface VerificationInput {
  transit_pass_id: string;
  checkpost_id: string;
  vehicle_id?: string | null;
  vehicle_reg_observed: string;
  verified_quantity: number;
  quantity_match: boolean;
  discrepancy_notes?: string;
}

// Append-only insert — RLS enforces checkpost_staff can only insert for their checkpost.
// No UPDATE policy exists; discrepancies are logged as new rows, never edited.
export function useCreateVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: VerificationInput) => {
      const { data, error } = await supabase
        .from("checkpost_verifications")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["checkpost_verifications", variables.checkpost_id],
      });
      queryClient.invalidateQueries({ queryKey: ["checkpost_verifications_all"] });
      queryClient.invalidateQueries({ queryKey: ["transit_passes"] });
    },
  });
}