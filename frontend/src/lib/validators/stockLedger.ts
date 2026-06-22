import { z } from "zod";

// Mirrors the DB constraints in supabase/migrations/0003_stock_ledger.sql
// (quantity > 0 check, not-null columns) — client-side validation is a UX
// convenience here, never the source of truth (Section 5: "never trust
// client validation alone").
export const stockLedgerEntrySchema = z.object({
  product_id: z.string().uuid({ message: "Select a product." }),
  transaction_type: z.enum(["inward", "outward"]),
  quantity: z.coerce.number().positive({ message: "Quantity must be greater than zero." }),
  unit: z.enum(["cum", "quintal", "kg", "nos", "mt"]),
  batch_lot_no: z.string().min(1, "Batch/lot number is required."),
  quality_grade: z.string().optional(),
  source_or_destination: z.string().min(1, "Source (inward) or destination (outward) is required."),
  remarks: z.string().optional(),
});

export type StockLedgerEntryInput = z.infer<typeof stockLedgerEntrySchema>;
