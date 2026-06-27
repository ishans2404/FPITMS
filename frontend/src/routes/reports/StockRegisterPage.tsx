import { useState } from "react";
import { useStockRegister, defaultRange } from "@/lib/queries/useReports";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeaderCell, TableRow, EmptyState, TableSkeleton,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import type { StockRegisterRow } from "@/types/database";

const CSV_COLUMNS: { key: keyof StockRegisterRow; label: string; format?: (v: StockRegisterRow[keyof StockRegisterRow]) => string }[] = [
  { key: "recorded_at", label: "Date & Time", format: (v) => new Date(v as string).toLocaleString("en-IN") },
  { key: "transaction_type", label: "Type" },
  { key: "product_name", label: "Product" },
  { key: "product_code", label: "Product Code" },
  { key: "product_category", label: "Category" },
  { key: "quantity", label: "Quantity", format: (v) => Number(v).toFixed(3) },
  { key: "unit", label: "Unit" },
  { key: "batch_lot_no", label: "Batch / Lot No." },
  { key: "quality_grade", label: "Grade", format: (v) => (v as string | null) ?? "" },
  { key: "source_or_destination", label: "Source / Destination" },
  { key: "transit_pass_ref", label: "Transit Pass Ref", format: (v) => (v as string | null) ?? "" },
  { key: "depot_name", label: "Depot" },
  { key: "depot_code", label: "Depot Code" },
  { key: "division_name", label: "Division" },
  { key: "recorded_by_name", label: "Recorded By", format: (v) => (v as string | null) ?? "" },
  { key: "remarks", label: "Remarks", format: (v) => (v as string | null) ?? "" },
];

export function StockRegisterPage() {
  const [range, setRange] = useState(defaultRange(30));
  const { data: rows, isLoading } = useStockRegister(range);

  const inwardRows  = rows?.filter((r) => r.transaction_type === "inward"  && !r.reversal_of) ?? [];
  const outwardRows = rows?.filter((r) => r.transaction_type === "outward" && !r.reversal_of) ?? [];
  const corrCount   = rows?.filter((r) => r.reversal_of) ?? [];
  const netQty = inwardRows.reduce((s, r) => s + Number(r.quantity), 0)
               - outwardRows.reduce((s, r) => s + Number(r.quantity), 0);

  const filename = `stock-register-${range.from}-to-${range.to}`;

  return (
    <div className="flex flex-col gap-lg">
      {/* Header */}
      <div>
        <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-forest-mid">
          Reports · Inventory
        </p>
        <h1 className="text-heading-md text-ink">Stock register</h1>
      </div>

      {/* Filters + export */}
      <div className="flex flex-wrap items-end justify-between gap-md">
        <DateRangeFilter value={range} onChange={setRange} />
        <ExportCsvButton
          data={(rows ?? []) as unknown as Record<string, unknown>[]}
          filename={filename}
          columns={CSV_COLUMNS as { key: string; label: string; format?: (v: unknown) => string }[]}
        />
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
        <StatCard label="Inward entries" value={inwardRows.length}  sub="Receipts in period" accent="success" />
        <StatCard label="Outward entries" value={outwardRows.length} sub="Dispatches in period" />
        <StatCard label="Corrections"    value={corrCount.length}   sub="Reversal rows" />
        <StatCard
          label="Net movement"
          value={netQty >= 0 ? `+${netQty.toFixed(1)}` : netQty.toFixed(1)}
          sub="Inward − outward (mixed units)"
          accent={netQty >= 0 ? "success" : "warning"}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : !rows || rows.length === 0 ? (
        <div className="rounded-marketing border border-hairline bg-canvas-light">
          <EmptyState>No ledger entries in this date range.</EmptyState>
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Date & time</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>Qty / unit</TableHeaderCell>
              <TableHeaderCell>Batch / lot</TableHeaderCell>
              <TableHeaderCell>Source / destination</TableHeaderCell>
              <TableHeaderCell>Depot</TableHeaderCell>
              <TableHeaderCell>Division</TableHeaderCell>
              <TableHeaderCell>Recorded by</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell mono className="whitespace-nowrap">
                  {new Date(r.recorded_at).toLocaleString("en-IN")}
                </TableCell>
                <TableCell>
                  <Badge variant={r.transaction_type === "inward" ? "success" : "neutral"}>
                    {r.transaction_type}
                  </Badge>
                  {r.reversal_of && (
                    <span className="ml-xs text-meta text-mute">(correction)</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="block">{r.product_name}</span>
                  <span className="font-mono text-mono-micro text-mute">{r.product_code}</span>
                </TableCell>
                <TableCell>
                  {Number(r.quantity).toFixed(3)}{" "}
                  <span className="text-mute">{r.unit}</span>
                </TableCell>
                <TableCell mono>{r.batch_lot_no}</TableCell>
                <TableCell>{r.source_or_destination}</TableCell>
                <TableCell>
                  <span className="block">{r.depot_name}</span>
                  <span className="font-mono text-mono-micro text-mute">{r.depot_code}</span>
                </TableCell>
                <TableCell>{r.division_name}</TableCell>
                <TableCell>{r.recorded_by_name ?? <span className="text-mute">—</span>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {rows && rows.length === 500 && (
        <p className="text-meta text-mute text-center">
          Showing first 500 rows — narrow the date range to see a smaller window.
        </p>
      )}
    </div>
  );
}