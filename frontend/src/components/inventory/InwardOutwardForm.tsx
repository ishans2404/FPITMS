import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockLedgerEntrySchema, type StockLedgerEntryInput } from "@/lib/validators/stockLedger";
import { useProducts } from "@/lib/queries/useProducts";
import { useCreateStockLedgerEntry } from "@/lib/queries/useStockLedger";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/contexts/AuthContext";

const UNITS = ["cum", "quintal", "kg", "nos", "mt"] as const;

export function InwardOutwardForm({ onDone }: { onDone?: () => void }) {
  const { profile } = useAuth();
  const { data: products } = useProducts();
  const createEntry = useCreateStockLedgerEntry(profile?.depot_id);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StockLedgerEntryInput>({
    resolver: zodResolver(stockLedgerEntrySchema),
    defaultValues: { transaction_type: "inward" },
  });

  const transactionType = watch("transaction_type");

  async function onSubmit(values: StockLedgerEntryInput) {
    await createEntry.mutateAsync(values);
    reset();
    onDone?.();
  }

  if (!profile?.depot_id) {
    return (
      <Alert tone="error">
        Your account isn't assigned to a depot yet. Ask an administrator to set this before
        logging stock entries.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
      <Select label="Transaction type" {...register("transaction_type")}>
        <option value="inward">Inward (receipt)</option>
        <option value="outward">Outward (dispatch)</option>
      </Select>

      <Select label="Product" error={errors.product_id?.message} {...register("product_id")}>
        <option value="">Select a product</option>
        {products?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.code})
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-md">
        <Input
          label="Quantity"
          type="number"
          step="0.001"
          error={errors.quantity?.message}
          {...register("quantity")}
        />
        <Select label="Unit" error={errors.unit?.message} {...register("unit")}>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="Batch / lot number"
        placeholder="e.g. RPR-D1-2026-0142"
        error={errors.batch_lot_no?.message}
        {...register("batch_lot_no")}
      />

      <Input
        label={transactionType === "outward" ? "Destination" : "Source"}
        placeholder={
          transactionType === "outward"
            ? "Processing unit, buyer, or authorized destination"
            : "Collection center, auction, or forest range"
        }
        error={errors.source_or_destination?.message}
        {...register("source_or_destination")}
      />

      <Input label="Quality grade (optional)" {...register("quality_grade")} />
      <Input label="Remarks (optional)" {...register("remarks")} />

      {createEntry.isError && (
        <Alert tone="error">
          Couldn't save this entry: {(createEntry.error as Error).message}
        </Alert>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Log entry"}
      </Button>
    </form>
  );
}
