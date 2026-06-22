import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useDepots() {
  return useQuery({
    queryKey: ["depots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("depots").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}
