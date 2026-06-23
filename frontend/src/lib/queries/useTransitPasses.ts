import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { TransitPassFormInput } from "@/lib/validators/transit";
import type { TransitPassStatus } from "@/types/database";

export function useTransitPasses(depotId: string | null | undefined) {
  return useQuery({
    queryKey: ["transit_passes", depotId],
    enabled: !!depotId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transit_passes")
        .select("*")
        .eq("depot_id", depotId as string)
        .order("issued_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

// Checkpost staff: all passes, not scoped to a depot
export function useAllTransitPasses() {
  return useQuery({
    queryKey: ["transit_passes_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transit_passes")
        .select("*")
        .order("issued_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
}

// Look up a single pass by pass_no (checkpost staff use this at the gate)
export function useTransitPassByNumber(passNo: string | null) {
  return useQuery({
    queryKey: ["transit_pass_lookup", passNo],
    enabled: !!passNo && passNo.length > 3,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transit_passes")
        .select("*")
        .eq("pass_no", passNo as string)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTransitPass(depotId: string | null | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TransitPassFormInput) => {
      if (!depotId) throw new Error("No depot assigned to this account.");
      const { data, error } = await supabase
        .from("transit_passes")
        .insert({ ...input, depot_id: depotId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transit_passes", depotId] });
    },
  });
}

export function useUpdateTransitPassStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      depotId,
    }: {
      id: string;
      status: TransitPassStatus;
      depotId: string;
    }) => {
      const { data, error } = await supabase
        .from("transit_passes")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { data, depotId };
    },
    onSuccess: ({ depotId }) => {
      queryClient.invalidateQueries({ queryKey: ["transit_passes", depotId] });
      queryClient.invalidateQueries({ queryKey: ["transit_passes_all"] });
    },
  });
}