import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/lib/queries/useProducts";
import { useReverseStockLedgerEntry, useStockLedger } from "@/lib/queries/useStockLedger";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, EmptyState } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { StockLedgerEntry } from "@/types/database";

export function StockLedgerTable() {
  const { profile } = useAuth();
  const { data: entries, isLoading } = useStockLedger(profile?.depot_id);
  const { data: products } = useProducts();
  const reverseEntry = useReverseStockLedgerEntry(profile?.depot_id);
  const [reversingId, setReversingId] = useState<string | null>(null);

  const productName = (id: string) => products?.find((p) => p.id === id)?.name ?? id;

  async function handleReverse(entry: StockLedgerEntry) {
    setReversingId(entry.id);
    try {
      await reverseEntry.mutateAsync(entry);
    } finally {
      setReversingId(null);
    }
  }

  if (isLoading) return <EmptyState>Loading ledger…</EmptyState>;
  if (!entries || entries.length === 0) {
    return <EmptyState>No entries yet. Log the first inward or outward transaction above.</EmptyState>;
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Product</TableHeaderCell>
          <TableHeaderCell>Quantity</TableHeaderCell>
          <TableHeaderCell>Batch / lot</TableHeaderCell>
          <TableHeaderCell>Source / destination</TableHeaderCell>
          <TableHeaderCell>Recorded</TableHeaderCell>
          <TableHeaderCell>
            <span className="sr-only">Actions</span>
          </TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>
              <Badge variant={entry.transaction_type === "inward" ? "success" : "neutral"}>
                {entry.transaction_type}
              </Badge>
              {entry.reversal_of && <span className="ml-xs text-meta text-mute">(correction)</span>}
            </TableCell>
            <TableCell>{productName(entry.product_id)}</TableCell>
            <TableCell>
              {entry.quantity} {entry.unit}
            </TableCell>
            <TableCell mono>{entry.batch_lot_no}</TableCell>
            <TableCell>{entry.source_or_destination}</TableCell>
            <TableCell mono>{new Date(entry.recorded_at).toLocaleString("en-IN")}</TableCell>
            <TableCell>
              {!entry.reversal_of && (
                <Button
                  variant="ghost"
                  className="!h-auto !px-0 text-meta underline"
                  disabled={reversingId === entry.id}
                  onClick={() => handleReverse(entry)}
                >
                  {reversingId === entry.id ? "Reversing…" : "Reverse"}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
