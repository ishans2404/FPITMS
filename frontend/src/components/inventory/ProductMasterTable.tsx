import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeactivateProduct,
  useProducts,
} from "@/lib/queries/useProducts";
import {
  productMasterSchema,
  productMasterUpdateSchema,
  type ProductMasterInput,
  type ProductMasterUpdateInput,
} from "@/lib/validators/productMaster";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeaderCell, TableRow, EmptyState,
} from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import type { ProduceCategory, ProductMaster } from "@/types/database";

const UNITS = ["cum", "quintal", "kg", "nos", "mt"] as const;

type FilterTab = "all" | ProduceCategory;

const FILTER_TABS: {
  value: FilterTab;
  label: (t: number, m: number, all: number) => string;
}[] = [
  { value: "all",       label: (_t, _m, a) => `All (${a})` },
  { value: "timber",    label: (t) => `Timber (${t})` },
  { value: "ntfp_mfp", label: (_t, m) => `NTFP / MFP (${m})` },
];

type Panel = { mode: "none" } | { mode: "add" } | { mode: "edit"; product: ProductMaster };

// ── Add form ──────────────────────────────────────────────────────────────────
// defaultValues are required for enum selects — without them react-hook-form
// holds undefined internally even though the browser shows the first option,
// which causes Zod to reject the submit if neither select is touched.
function AddForm({ onDone }: { onDone: () => void }) {
  const createProduct = useCreateProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductMasterInput>({
    resolver: zodResolver(productMasterSchema),
    defaultValues: { category: "timber", default_unit: "cum" },
  });

  async function onSubmit(values: ProductMasterInput) {
    await createProduct.mutateAsync(values);
    reset({ category: "timber", default_unit: "cum" });
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-app-lg border border-hairline bg-canvas-light p-lg flex flex-col gap-md"
    >
      <h3 className="text-heading-sm text-ink">Add product</h3>

      <div className="grid grid-cols-2 gap-md">
        <Input
          label="Code"
          placeholder="e.g. TBR-SAL"
          error={errors.code?.message}
          {...register("code")}
        />
        <Input
          label="Name"
          placeholder="e.g. Sal Timber"
          error={errors.name?.message}
          {...register("name")}
        />
      </div>

      <div className="grid grid-cols-2 gap-md">
        <Select label="Category" error={errors.category?.message} {...register("category")}>
          <option value="timber">Timber</option>
          <option value="ntfp_mfp">NTFP / MFP</option>
        </Select>
        <Select label="Default unit" error={errors.default_unit?.message} {...register("default_unit")}>
          {UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-md">
        <Input
          label="Species (optional)"
          placeholder="e.g. Shorea robusta"
          {...register("species")}
        />
        <Input label="Description (optional)" {...register("description")} />
      </div>

      {createProduct.isError && (
        <Alert tone="error">
          Couldn't save: {(createProduct.error as Error).message}
        </Alert>
      )}

      <div className="flex gap-md">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save product"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Edit form ─────────────────────────────────────────────────────────────────
// Code is intentionally read-only — it is a stable reference ID used by
// stock_ledger entries and should never change after creation.
function EditForm({
  product,
  onDone,
}: {
  product: ProductMaster;
  onDone: () => void;
}) {
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductMasterUpdateInput>({
    resolver: zodResolver(productMasterUpdateSchema),
    defaultValues: {
      name: product.name,
      category: product.category,
      species: product.species ?? "",
      default_unit: product.default_unit,
      description: product.description ?? "",
    },
  });

  async function onSubmit(values: ProductMasterUpdateInput) {
    await updateProduct.mutateAsync({ id: product.id, input: values });
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-app-lg border border-link-blue/30 bg-canvas-light p-lg flex flex-col gap-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-heading-sm text-ink">Edit product</h3>
        {/* Code shown as read-only reference — not an editable field */}
        <span className="font-mono text-mono-eyebrow text-graphite">{product.code}</span>
      </div>

      <div className="grid grid-cols-2 gap-md">
        <Input
          label="Name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Select label="Category" error={errors.category?.message} {...register("category")}>
          <option value="timber">Timber</option>
          <option value="ntfp_mfp">NTFP / MFP</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-md">
        <Select label="Default unit" error={errors.default_unit?.message} {...register("default_unit")}>
          {UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </Select>
        <Input
          label="Species (optional)"
          placeholder="e.g. Shorea robusta"
          {...register("species")}
        />
      </div>

      <Input label="Description (optional)" {...register("description")} />

      {updateProduct.isError && (
        <Alert tone="error">
          Couldn't update: {(updateProduct.error as Error).message}
        </Alert>
      )}

      <div className="flex gap-md">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────
export function ProductMasterTable() {
  const { profile } = useAuth();
  const { data: products, isLoading } = useProducts();
  const deactivate = useDeactivateProduct();

  const [filter, setFilter]     = useState<FilterTab>("all");
  const [panel, setPanel]       = useState<Panel>({ mode: "none" });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // RLS enforces this server-side; the UI check only controls button visibility.
  const canManage = profile?.role === "dfo";

  const timberCount = products?.filter((p) => p.category === "timber").length ?? 0;
  const mfpCount    = products?.filter((p) => p.category === "ntfp_mfp").length ?? 0;
  const totalCount  = products?.length ?? 0;

  const filtered = products?.filter(
    (p) => filter === "all" || p.category === filter,
  );

  function openEdit(p: ProductMaster) {
    setPanel({ mode: "edit", product: p });
    setConfirmId(null); // clear any in-progress deactivate confirm
  }

  function openAdd() {
    setPanel((prev) => (prev.mode === "add" ? { mode: "none" } : { mode: "add" }));
    setConfirmId(null);
  }

  async function handleDeactivate(id: string) {
    await deactivate.mutateAsync(id);
    setConfirmId(null);
    // If this product was open in the edit panel, close it
    if (panel.mode === "edit" && panel.product.id === id) {
      setPanel({ mode: "none" });
    }
  }

  return (
    <div className="flex flex-col gap-lg">

      {/* ── Top bar: filter pills + add button ─────────────────────────── */}
      <div className="flex items-center justify-between gap-md flex-wrap">
        <div className="flex items-center gap-xs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`rounded-full px-sm py-xxs text-caption transition-colors ${
                filter === tab.value
                  ? "bg-ink text-on-primary"
                  : "bg-canvas-paper text-mute hover:text-ink"
              }`}
            >
              {tab.label(timberCount, mfpCount, totalCount)}
            </button>
          ))}
        </div>

        {canManage && (
          <Button variant="secondary" onClick={openAdd}>
            {panel.mode === "add" ? "Cancel" : "+ Add product"}
          </Button>
        )}
      </div>

      {/* ── Forms panel (add or edit, never both) ──────────────────────── */}
      {panel.mode === "add" && canManage && (
        <AddForm onDone={() => setPanel({ mode: "none" })} />
      )}
      {panel.mode === "edit" && canManage && (
        <EditForm
          product={panel.product}
          onDone={() => setPanel({ mode: "none" })}
        />
      )}

      {/* ── Read-only notice for non-DFO roles ─────────────────────────── */}
      {!canManage && (
        <p className="text-body-sm text-mute">
          Product catalogue is managed by the DFO. Contact your Divisional Forest Officer to add or update products.
        </p>
      )}

      {/* ── Table ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <EmptyState>Loading products…</EmptyState>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState>No products match this filter.</EmptyState>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Code</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Species</TableHeaderCell>
              <TableHeaderCell>Default unit</TableHeaderCell>
              {canManage && (
                <TableHeaderCell>
                  <span className="sr-only">Actions</span>
                </TableHeaderCell>
              )}
            </tr>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow
                key={p.id}
                highlight={panel.mode === "edit" && panel.product.id === p.id}
              >
                <TableCell mono>{p.code}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  <Badge variant={p.category === "timber" ? "filled" : "neutral"}>
                    {p.category === "timber" ? "Timber" : "NTFP / MFP"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {p.species ? (
                    <em className="text-graphite not-italic" style={{ fontStyle: "italic" }}>
                      {p.species}
                    </em>
                  ) : (
                    <span className="text-mute">—</span>
                  )}
                </TableCell>
                <TableCell>{p.default_unit}</TableCell>

                {canManage && (
                  <TableCell>
                    {confirmId === p.id ? (
                      // Two-click deactivate confirm — same pattern as VehicleTable
                      <span className="flex items-center gap-xs">
                        <Button
                          variant="ghost"
                          className="!h-auto !px-0 text-meta text-error underline"
                          disabled={deactivate.isPending}
                          onClick={() => handleDeactivate(p.id)}
                        >
                          {deactivate.isPending ? "Deactivating…" : "Confirm deactivate"}
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
                      <span className="flex items-center gap-md">
                        <Button
                          variant="ghost"
                          className="!h-auto !px-0 text-meta underline"
                          onClick={() => openEdit(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="!h-auto !px-0 text-meta underline"
                          onClick={() => {
                            setConfirmId(p.id);
                            // Close edit panel if open for this row
                            if (panel.mode === "edit" && panel.product.id === p.id) {
                              setPanel({ mode: "none" });
                            }
                          }}
                        >
                          Deactivate
                        </Button>
                      </span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}