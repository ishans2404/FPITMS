import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProduct, useProducts } from "@/lib/queries/useProducts";
import { productMasterSchema, type ProductMasterInput } from "@/lib/validators/productMaster";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, EmptyState } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ProductMasterTable() {
  const { profile } = useAuth();
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const [showForm, setShowForm] = useState(false);

  const canManage = profile?.role === "dfo"; // RLS enforces this server-side regardless.

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

  return (
    <div className="flex flex-col gap-lg">
      {canManage && (
        <div>
          <Button variant="secondary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Add product"}
          </Button>
          {showForm && (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-md flex flex-col gap-md rounded-app-lg border border-hairline p-lg">
              <div className="grid grid-cols-2 gap-md">
                <Input label="Code" error={errors.code?.message} {...register("code")} />
                <Input label="Name" error={errors.name?.message} {...register("name")} />
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
              <Input label="Species (optional)" {...register("species")} />
              <Input label="Description (optional)" {...register("description")} />
              {createProduct.isError && (
                <Alert tone="error">Couldn't save: {(createProduct.error as Error).message}</Alert>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save product"}
              </Button>
            </form>
          )}
        </div>
      )}

      {isLoading ? (
        <EmptyState>Loading products…</EmptyState>
      ) : !products || products.length === 0 ? (
        <EmptyState>No products in the master list yet.</EmptyState>
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
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell mono>{p.code}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.category === "timber" ? "Timber" : "NTFP / MFP"}</TableCell>
                <TableCell>{p.species ?? "—"}</TableCell>
                <TableCell>{p.default_unit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
