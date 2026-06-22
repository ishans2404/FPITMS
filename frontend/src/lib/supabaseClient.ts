import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Copy frontend/.env.example to frontend/.env " +
      "and fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (never the service role key)."
  );
}

// Typed client — every table/view query is checked against src/types/database.ts.
// stock_ledger's Update type is `never`, so a future `supabase.from('stock_ledger').update(...)`
// call fails to typecheck before it ever reaches RLS (which would also deny it — see ADR 0002).
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
