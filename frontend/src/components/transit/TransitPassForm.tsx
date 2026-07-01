import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transitPassFormSchema, type TransitPassFormInput } from "@/lib/validators/transit";
import { useProducts } from "@/lib/queries/useProducts";
import { useVehicles } from "@/lib/queries/useVehicles";
import { useCreateTransitPass } from "@/lib/queries/useTransitPasses";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/contexts/AuthContext";

const UNITS = ["cum", "quintal", "kg", "nos", "mt"] as const;

export function TransitPassForm({ onDone }: { onDone?: () => void }) {
  const { profile } = useAuth();
  const { data: products } = useProducts();
  const { data: vehicles } = useVehicles();
  const createPass = useCreateTransitPass(profile?.depot_id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransitPassFormInput>({
    resolver: zodResolver(transitPassFormSchema),
  });

  async function onSubmit(values: TransitPassFormInput) {
    // Coerce empty strings on optional FK to undefined/null
    const payload: TransitPassFormInput = {
      ...values,
      vehicle_id: values.vehicle_id || undefined,
      batch_lot_ref: values.batch_lot_ref || undefined,
      valid_until: values.valid_until || undefined,
    };
    await createPass.mutateAsync(payload);
    reset();
    onDone?.();
  }

  if (!profile?.depot_id) {
    return (
      <Alert tone="error">
        Your account isn't assigned to a depot yet. Contact an administrator.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
      {/* Pass number + validity */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input
          label="Transit pass number"
          placeholder="e.g. CG-RPR-2026-0001"
          error={errors.pass_no?.message}
          {...register("pass_no")}
        />
        <Input
          label="Valid until (optional)"
          type="date"
          {...register("valid_until")}
        />
      </div>

      {/* Product + qty */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Select
            label="Product"
            error={errors.product_id?.message}
            {...register("product_id")}
          >
            <option value="">Select a product</option>
            {products?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Quantity"
          type="number"
          step="0.001"
          error={errors.quantity?.message}
          {...register("quantity")}
        />
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Select label="Unit" error={errors.unit?.message} {...register("unit")}>
          {UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </Select>
        <Input
          label="Batch / lot reference (optional)"
          placeholder="Matches stock_ledger batch_lot_no"
          {...register("batch_lot_ref")}
        />
      </div>

      {/* Vehicle + driver */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Select label="Vehicle (optional)" {...register("vehicle_id")}>
          <option value="">Select a vehicle</option>
          {vehicles?.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration_no}
              {v.owner_name ? ` — ${v.owner_name}` : ""}
            </option>
          ))}
        </Select>
        <Input
          label="Driver name"
          error={errors.driver_name?.message}
          {...register("driver_name")}
        />
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input
          label="Driver licence no. (optional)"
          {...register("driver_license_no")}
        />
      </div>

      {/* Route */}
      <Input
        label="Source (depot / collection point)"
        placeholder="e.g. Raipur Central Depot"
        error={errors.source_description?.message}
        {...register("source_description")}
      />
      <Input
        label="Destination"
        placeholder="Processing unit, buyer, or authorized destination"
        error={errors.destination?.message}
        {...register("destination")}
      />

      <Input label="Remarks (optional)" {...register("remarks")} />

      {createPass.isError && (
        <Alert tone="error">
          Couldn't issue pass: {(createPass.error as Error).message}
        </Alert>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Issuing…" : "Issue transit pass"}
      </Button>
    </form>
  );
}