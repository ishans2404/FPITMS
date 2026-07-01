import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleFormSchema, type VehicleFormInput } from "@/lib/validators/transit";
import { useVehicles, useCreateVehicle, useDeactivateVehicle } from "@/lib/queries/useVehicles";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeaderCell, TableRow, EmptyState,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

const VEHICLE_TYPES = [
  { value: "truck",   label: "Truck" },
  { value: "tractor", label: "Tractor" },
  { value: "pickup",  label: "Pickup" },
  { value: "tempo",   label: "Tempo" },
  { value: "other",   label: "Other" },
] as const;

const UNITS = ["cum", "quintal", "kg", "nos", "mt"] as const;

// ── VehicleForm ─────────────────────────────────────────────────────────────
export function VehicleForm({ onDone }: { onDone?: () => void }) {
  const createVehicle = useCreateVehicle();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormInput>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: { vehicle_type: "truck" },
  });

  async function onSubmit(values: VehicleFormInput) {
    const payload: VehicleFormInput = {
      ...values,
      capacity_value: values.capacity_value === "" ? undefined : values.capacity_value,
      capacity_unit: values.capacity_unit === "" ? undefined : values.capacity_unit,
    };
    await createVehicle.mutateAsync(payload);
    reset();
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input
          label="Registration number"
          placeholder="e.g. CG04AB1234"
          error={errors.registration_no?.message}
          {...register("registration_no")}
        />
        <Select
          label="Vehicle type"
          error={errors.vehicle_type?.message}
          {...register("vehicle_type")}
        >
          {VEHICLE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      </div>

      <Input label="Owner name (optional)" {...register("owner_name")} />

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input
          label="Capacity (optional)"
          type="number"
          step="0.001"
          placeholder="e.g. 10.000"
          {...register("capacity_value")}
        />
        <Select label="Capacity unit (optional)" {...register("capacity_unit")}>
          <option value="">—</option>
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
      </div>

      {createVehicle.isError && (
        <Alert tone="error">
          Couldn't register: {(createVehicle.error as Error).message}
        </Alert>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Registering…" : "Register vehicle"}
      </Button>
    </form>
  );
}

// ── VehicleTable ─────────────────────────────────────────────────────────────
export function VehicleTable({ canEdit }: { canEdit: boolean }) {
  const { data: vehicles, isLoading } = useVehicles();
  const deactivate = useDeactivateVehicle();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (isLoading) return <EmptyState>Loading vehicles…</EmptyState>;
  if (!vehicles || vehicles.length === 0) {
    return (
      <EmptyState>
        No vehicles registered yet. Use "Register vehicle" to add the first one.
      </EmptyState>
    );
  }

  async function handleDeactivate(id: string) {
    await deactivate.mutateAsync(id);
    setConfirmId(null);
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Registration</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Owner</TableHeaderCell>
          <TableHeaderCell>Capacity</TableHeaderCell>
          {canEdit && <TableHeaderCell><span className="sr-only">Actions</span></TableHeaderCell>}
        </tr>
      </TableHead>
      <TableBody>
        {vehicles.map((v) => (
          <TableRow key={v.id}>
            <TableCell mono>{v.registration_no}</TableCell>
            <TableCell>
              <Badge variant="neutral">
                {v.vehicle_type.charAt(0).toUpperCase() + v.vehicle_type.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>{v.owner_name ?? <span className="text-mute">—</span>}</TableCell>
            <TableCell>
              {v.capacity_value != null
                ? `${Number(v.capacity_value).toFixed(3)} ${v.capacity_unit ?? ""}`
                : <span className="text-mute">—</span>}
            </TableCell>
            {canEdit && (
              <TableCell>
                {confirmId === v.id ? (
                  <span className="flex items-center gap-xs">
                    <Button
                      variant="ghost"
                      className="!h-auto !px-0 text-meta text-error underline"
                      onClick={() => handleDeactivate(v.id)}
                      disabled={deactivate.isPending}
                    >
                      Confirm deactivate
                    </Button>
                    <Button
                      variant="ghost"
                      className="!h-auto !px-0 text-meta underline"
                      onClick={() => setConfirmId(null)}
                    >
                      Cancel
                    </Button>
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    className="!h-auto !px-0 text-meta underline"
                    onClick={() => setConfirmId(v.id)}
                  >
                    Deactivate
                  </Button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}