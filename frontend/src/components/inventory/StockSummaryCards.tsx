import { useProducts } from "@/lib/queries/useProducts";
import { useStockBalance } from "@/lib/queries/useStockBalance";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Table";

export function StockSummaryCards() {
  const { data: balances, isLoading } = useStockBalance();
  const { data: products } = useProducts();

  if (isLoading) return <EmptyState>Loading stock summary…</EmptyState>;
  if (!balances || balances.length === 0) {
    return <EmptyState>No stock recorded yet for your depot.</EmptyState>;
  }

  return (
    <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
      {balances.map((b) => {
        const product = products?.find((p) => p.id === b.product_id);
        return (
          <Card key={`${b.depot_id}-${b.product_id}`}>
            <CardEyebrow>Current stock</CardEyebrow>
            <CardTitle>{product?.name ?? "Unknown product"}</CardTitle>
            <p className="mt-sm text-heading-md text-ink">
              {b.current_quantity} <span className="text-body-sm text-mute">{product?.default_unit}</span>
            </p>
          </Card>
        );
      })}
    </div>
  );
}
