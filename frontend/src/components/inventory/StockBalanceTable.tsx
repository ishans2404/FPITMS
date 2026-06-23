import { Link } from "react-router-dom";
import { useProducts } from "@/lib/queries/useProducts";
import { useStockBalance } from "@/lib/queries/useStockBalance";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeaderCell, TableRow, EmptyState,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

interface Props {
  depotId: string | null | undefined;
}

// Shows ALL products from the catalog with their current balance for this
// depot. Products with no ledger entries appear with 0 — this is intentional:
// depot staff should see their full catalog, not a "nothing here" screen.
// Client-side join: products (global) + stock_balance (RLS-scoped via
// security_invoker view). Both queries are already cached by TanStack Query
// from the dashboard that calls them independently, so this doesn't add RTTs.
export function StockBalanceTable({ depotId }: Props) {
  const { data: products, isLoading: pLoading } = useProducts();
  const { data: balances, isLoading: bLoading } = useStockBalance();

  if (pLoading || bLoading) return <EmptyState>Loading stock…</EmptyState>;
  if (!products || products.length === 0) {
    return (
      <EmptyState>
        No products in the master list.{" "}
        <Link to="/inventory/products" className="text-link-blue underline">
          View product master →
        </Link>
      </EmptyState>
    );
  }

  const rows = products.map((p) => ({
    ...p,
    current_quantity:
      Number(
        balances?.find(
          (b) =>
            b.product_id === p.id &&
            (depotId ? b.depot_id === depotId : true)
        )?.current_quantity
      ) || 0,
  }));

  // Sort: products with stock first, then by name
  rows.sort((a, b) => {
    if (a.current_quantity > 0 && b.current_quantity === 0) return -1;
    if (a.current_quantity === 0 && b.current_quantity > 0) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Code</TableHeaderCell>
          <TableHeaderCell>Product</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>Species</TableHeaderCell>
          <TableHeaderCell>Current stock</TableHeaderCell>
          <TableHeaderCell>Unit</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell mono>{row.code}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>
              <Badge variant={row.category === "timber" ? "filled" : "neutral"}>
                {row.category === "timber" ? "Timber" : "NTFP / MFP"}
              </Badge>
            </TableCell>
            <TableCell>
              {row.species ? (
                <em className="text-graphite not-italic" style={{ fontStyle: "italic" }}>
                  {row.species}
                </em>
              ) : (
                <span className="text-mute">—</span>
              )}
            </TableCell>
            <TableCell>
              <span
                className={
                  row.current_quantity > 0
                    ? "font-medium text-ink"
                    : "text-mute"
                }
              >
                {row.current_quantity.toFixed(3)}
              </span>
            </TableCell>
            <TableCell>{row.default_unit}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}