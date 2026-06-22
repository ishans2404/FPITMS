import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { ProductMasterInput } from "@/lib/validators/productMaster";

export function useProducts() {
  return useQuery({
    queryKey: ["product_master"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_master")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductMasterInput) => {
      // RLS (product_master_insert_dfo) enforces the role check server-side
      // regardless of what this client sends — this call simply fails with
      // a Postgres permission error for anyone who isn't 'dfo'.
      const { data, error } = await supabase.from("product_master").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product_master"] });
    },
  });
}
