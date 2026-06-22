import { ProductMasterTable } from "@/components/inventory/ProductMasterTable";

export function ProductMasterPage() {
  return (
    <div className="flex flex-col gap-lg">
      <div>
        <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-mute">Reference data</p>
        <h1 className="text-heading-md text-ink">Product master</h1>
      </div>
      <ProductMasterTable />
    </div>
  );
}
