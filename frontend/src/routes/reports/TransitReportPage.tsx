import { useState } from "react";
import { useTransitPassReport, defaultRange } from "@/lib/queries/useReports";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeaderCell, TableRow, EmptyState, TableSkeleton,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import type { TransitPassStatus, TransitPassReportRow } from "@/types/database";

const STATUS_ORDER: TransitPassStatus[] = [
  "issued", "in_transit", "verified", "completed", "cancelled",
];

const STATUS_VARIANT: Record<TransitPassStatus, "neutral" | "info" | "success" | "filled" | "error" | "brand"> = {
  issued:     "brand",
  in_transit: "info",
  verified:   "success",
  completed:  "filled",
  cancelled:  "error",
};

const CSV_COLUMNS: { key: keyof TransitPassReportRow; label: string; format?: (v: TransitPassReportRow[keyof TransitPassReportRow]) => string }[] = [
  { key: "pass_no", label: "Pass No." },
  { key: "issued_at", label: "Issued At", format: (v) => new Date(v as string).toLocaleString("en-IN") },
  { key: "valid_until", label: "Valid Until", format: (v) => v ? new Date(v as string).toLocaleDateString("en-IN") : "" },
  { key: "status", label: "Status" },
  { key: "product_name", label: "Product" },
  { key: "product_code", label: "Product Code" },
  { key: "quantity", label: "Quantity", format: (v) => Number(v).toFixed(3) },
  { key: "unit", label: "Unit" },
  { key: "vehicle_reg_no", label: "Vehicle Reg.", format: (v) => (v as string | null) ?? "" },
  { key: "driver_name", label: "Driver", format: (v) => (v as string | null) ?? "" },
  { key: "driver_license_no", label: "Licence No.", format: (v) => (v as string | null) ?? "" },
  { key: "source_description", label: "Source" },
  { key: "destination", label: "Destination" },
  { key: "batch_lot_ref", label: "Batch Ref", format: (v) => (v as string | null) ?? "" },
  { key: "depot_name", label: "Depot" },
  { key: "division_name", label: "Division" },
  { key: "issued_by_name", label: "Issued By", format: (v) => (v as string | null) ?? "" },
  { key: "remarks", label: "Remarks", format: (v) => (v as string | null) ?? "" },
];

export function TransitReportPage() {
  const [range, setRange] = useState(defaultRange(30));
  const [statusFilter, setStatusFilter] = useState<TransitPassStatus | "all">("all");
  const { data: rows, isLoading } = useTransitPassReport(range);

  const filtered = rows?.filter(
    (r) => statusFilter === "all" || r.status === statusFilter,
  ) ?? [];

  const countBy = (s: TransitPassStatus) => rows?.filter((r) => r.status === s).length ?? 0;
  const filename = `transit-passes-${range.from}-to-${range.to}`;

  return (
    <div className="flex flex-col gap-lg">
      {/* Header */}
      <div>
        <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-forest-mid">
          Reports · CG Transit (Forest Produce) Rules, 2001
        </p>
        <h1 className="text-heading-md text-ink">Transit pass report</h1>
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
        <StatCard label="Total passes" value={rows?.length ?? "—"} sub="In date range" />
        <StatCard label="In transit" value={countBy("in_transit")} sub="Currently on road" accent="info" />
        <StatCard label="Verified" value={countBy("verified")} sub="Cleared at checkpost" accent="success" />
        <StatCard label="Cancelled" value={countBy("cancelled")} sub="Voided passes" accent={countBy("cancelled") > 0 ? "error" : "default"} />
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-xs">
        {(["all", ...STATUS_ORDER] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-sm py-xxs text-caption transition-colors ${
              statusFilter === s
                ? "bg-ink text-on-primary"
                : "bg-canvas-paper text-mute hover:text-ink"
            }`}
          >
            {s === "all"
              ? `All (${rows?.length ?? 0})`
              : `${s.replace("_", " ")} (${countBy(s)})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : filtered.length === 0 ? (
        <div className="rounded-marketing border border-hairline bg-canvas-light">
          <EmptyState>No transit passes match this filter.</EmptyState>
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Pass no.</TableHeaderCell>
              <TableHeaderCell>Issued</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>Qty / unit</TableHeaderCell>
              <TableHeaderCell>Vehicle</TableHeaderCell>
              <TableHeaderCell>Driver</TableHeaderCell>
              <TableHeaderCell>Destination</TableHeaderCell>
              <TableHeaderCell>Depot</TableHeaderCell>
              <TableHeaderCell>Division</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell mono>{r.pass_no}</TableCell>
                <TableCell mono className="whitespace-nowrap">
                  {new Date(r.issued_at).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[r.status]}>{r.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>
                  <span className="block">{r.product_name}</span>
                  <span className="font-mono text-mono-micro text-mute">{r.product_code}</span>
                </TableCell>
                <TableCell>
                  {Number(r.quantity).toFixed(3)}{" "}
                  <span className="text-mute">{r.unit}</span>
                </TableCell>
                <TableCell mono>{r.vehicle_reg_no ?? <span className="text-mute">—</span>}</TableCell>
                <TableCell>{r.driver_name ?? <span className="text-mute">—</span>}</TableCell>
                <TableCell>{r.destination}</TableCell>
                <TableCell>
                  <span className="block">{r.depot_name}</span>
                  <span className="font-mono text-mono-micro text-mute">{r.depot_code}</span>
                </TableCell>
                <TableCell>{r.division_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {rows && rows.length === 500 && (
        <p className="text-meta text-mute text-center">
          Showing first 500 rows — narrow the date range for a smaller window.
        </p>
      )}
    </div>
  );
}