import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProduct, useProducts } from "@/lib/queries/useProducts";
import { productMasterSchema, type ProductMasterInput } from "@/lib/validators/productMaster";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeaderCell, TableRow, EmptyState,
} from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import type { ProduceCategory } from "@/types/database";

type FilterTab = "all" | ProduceCategory;

const FILTER_TABS: { value: FilterTab; label: (t: number, m: number, all: number) => string }[] = [
  { value: "all",      label: (_t, _m, a) => `All (${a})` },
  { value: "timber",   label: (t) => `Timber (${t})` },
  { value: "ntfp_mfp", label: (_t, m) => `NTFP / MFP (${m})` },
];

export function ProductMasterTable() {
  const { profile } = useAuth();
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");

  // RLS enforces this server-side; the UI check only controls button visibility.
  const canManage = profile?.role === "dfo";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductMasterInput>({ resolver: zodResolver(productMasterSchema) });

  async function onSubmit(values: ProductMasterInput) {
    await createProduct.mutateAsync(values);
    reset();
    setShowForm(false);
  }

  const timberCount = products?.filter((p) => p.category === "timber").length ?? 0;
  const mfpCount   = products?.filter((p) => p.category === "ntfp_mfp").length ?? 0;
  const totalCount = products?.length ?? 0;

  const filtered = products?.filter(
    (p) => filter === "all" || p.category === filter
  );

  return (
    <div className="flex flex-col gap-lg">
      {/* Filter pills row + action button */}
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
          <Button variant="secondary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add product"}
          </Button>
        )}
      </div>

      {/* Add-product form — DFO only */}
      {showForm && canManage && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-app-lg border border-hairline bg-canvas-light p-lg flex flex-col gap-md"
        >
          <h3 className="text-heading-sm text-ink">Add product</h3>
          <div className="grid grid-cols-2 gap-md">
            <Input label="Code"        error={errors.code?.message}  {...register("code")} />
            <Input label="Name"        error={errors.name?.message}  {...register("name")} />
          </div>
          <div className="grid grid-cols-2 gap-md">
            <Select label="Category" error={errors.category?.message} {...register("category")}>
              <option value="timber">Timber</option>
              <option value="ntfp_mfp">NTFP / MFP</option>
            </Select>
            <Select label="Default unit" error={errors.default_unit?.message} {...register("default_unit")}>
              <option value="cum">cum</option>
              <option value="quintal">quintal</option>
              <option value="kg">kg</option>
              <option value="nos">nos</option>
              <option value="mt">mt</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <Input label="Species (optional)"     {...register("species")} />
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
            <Button
              type="button"
              variant="ghost"
              onClick={() => { reset(); setShowForm(false); }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Table */}
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
            </tr>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell mono>{p.code}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  <Badge variant={p.category === "timber" ? "filled" : "neutral"}>
                    {p.category === "timber" ? "Timber" : "NTFP / MFP"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {p.species
                    ? <em className="text-graphite">{p.species}</em>
                    : <span className="text-mute">—</span>}
                </TableCell>
                <TableCell>{p.default_unit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}