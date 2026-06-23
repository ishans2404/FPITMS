import { z } from "zod";

// ── Vehicle ────────────────────────────────────────────────────────────────
export const vehicleFormSchema = z.object({
  registration_no: z
    .string()
    .min(1, "Registration number is required.")
    .toUpperCase(),
  vehicle_type: z.enum(["truck", "tractor", "pickup", "tempo", "other"]),
  owner_name: z.string().optional(),
  capacity_value: z.coerce.number().positive().optional().or(z.literal("")),
  capacity_unit: z
    .enum(["cum", "quintal", "kg", "nos", "mt"])
    .optional()
    .or(z.literal("")),
});

export type VehicleFormInput = z.infer<typeof vehicleFormSchema>;

// ── Transit pass ───────────────────────────────────────────────────────────
// pass_no format: FPITMS uses CG/year/serial pattern, e.g. CG-RPR-2026-0001.
// The regex is advisory — the Department may have its own numbering convention
// and we don't want to block legitimate passes with strict formatting.
export const transitPassFormSchema = z.object({
  pass_no: z.string().min(4, "Transit pass number is required."),
  vehicle_id: z.string().uuid("Select a registered vehicle.").optional().or(z.literal("")),
  driver_name: z.string().min(1, "Driver name is required."),
  driver_license_no: z.string().optional(),
  product_id: z.string().uuid("Select a product."),
  quantity: z.coerce.number().positive("Quantity must be greater than zero."),
  unit: z.enum(["cum", "quintal", "kg", "nos", "mt"]),
  source_description: z
    .string()
    .min(1, "Source description is required."),
  destination: z.string().min(1, "Destination is required."),
  batch_lot_ref: z.string().optional(),
  valid_until: z.string().optional(),
  remarks: z.string().optional(),
});

export type TransitPassFormInput = z.infer<typeof transitPassFormSchema>;

// ── Checkpost verification ─────────────────────────────────────────────────
export const verificationFormSchema = z.object({
  transit_pass_id: z.string().uuid(),
  vehicle_reg_observed: z
    .string()
    .min(1, "Observed vehicle registration is required."),
  verified_quantity: z.coerce
    .number()
    .positive("Enter the actual quantity observed."),
  quantity_match: z.boolean(),
  discrepancy_notes: z.string().optional(),
});

export type VerificationFormInput = z.infer<typeof verificationFormSchema>;