import { z } from "zod";

export const productMasterSchema = z.object({
  code: z.string().min(1, "Product code is required."),
  name: z.string().min(1, "Product name is required."),
  category: z.enum(["timber", "ntfp_mfp"]),
  species: z.string().optional(),
  default_unit: z.enum(["cum", "quintal", "kg", "nos", "mt"]),
  description: z.string().optional(),
});


export type ProductMasterInput = z.infer<typeof productMasterSchema>;

// Code is a stable reference ID — excluded from updates once created.
export const productMasterUpdateSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  category: z.enum(["timber", "ntfp_mfp"]),
  species: z.string().optional(),
  default_unit: z.enum(["cum", "quintal", "kg", "nos", "mt"]),
  description: z.string().optional(),
});

export type ProductMasterUpdateInput = z.infer<typeof productMasterUpdateSchema>;

