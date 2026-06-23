import { useProducts } from "@/lib/queries/useProducts";
import { ProductMasterTable } from "@/components/inventory/ProductMasterTable";

export function ProductMasterPage() {
  const { data: products } = useProducts();

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-mute">
          Reference data
        </p>
        <div className="flex items-baseline gap-md">
          <h1 className="text-heading-md text-ink">Product master</h1>
          {products && (
            <span className="text-body-sm text-mute">
              {products.length} active product{products.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
      <ProductMasterTable />
    </div>
  );
}