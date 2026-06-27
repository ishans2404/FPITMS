import { useState } from "react";
import { useCheckpostVerificationReport, defaultRange } from "@/lib/queries/useReports";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeaderCell, TableRow, EmptyState, TableSkeleton,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import type { CheckpostVerificationReportRow } from "@/types/database";

const CSV_COLUMNS: { key: keyof CheckpostVerificationReportRow; label: string; format?: (v: CheckpostVerificationReportRow[keyof CheckpostVerificationReportRow]) => string }[] = [
  { key: "verified_at", label: "Verified At", format: (v) => new Date(v as string).toLocaleString("en-IN") },
  { key: "pass_no", label: "Pass No." },
  { key: "product_name", label: "Product" },
  { key: "pass_quantity", label: "Pass Qty", format: (v) => Number(v).toFixed(3) },
  { key: "verified_quantity", label: "Verified Qty", format: (v) => v != null ? Number(v).toFixed(3) : "" },
  { key: "unit", label: "Unit" },
  { key: "quantity_match", label: "Match", format: (v) => v === true ? "Yes" : v === false ? "No" : "" },
  { key: "vehicle_reg_observed", label: "Vehicle Reg. Observed", format: (v) => (v as string | null) ?? "" },
  { key: "vehicle_reg_no", label: "Vehicle Reg. (Pass)", format: (v) => (v as string | null) ?? "" },
  { key: "discrepancy_notes", label: "Discrepancy Notes", format: (v) => (v as string | null) ?? "" },
  { key: "checkpost_name", label: "Checkpost" },
  { key: "checkpost_code", label: "Checkpost Code" },
  { key: "pass_status", label: "Pass Status" },
  { key: "destination", label: "Destination" },
  { key: "depot_name", label: "Issuing Depot" },
  { key: "division_name", label: "Division" },
  { key: "verified_by_name", label: "Verified By", format: (v) => (v as string | null) ?? "" },
];

export function VehicleMovementPage() {
  const [range, setRange] = useState(defaultRange(30));
  const { data: rows, isLoading } = useCheckpostVerificationReport(range);

  const total       = rows?.length ?? 0;
  const matches     = rows?.filter((r) => r.quantity_match === true).length ?? 0;
  const mismatches  = rows?.filter((r) => r.quantity_match === false).length ?? 0;
  const filename    = `vehicle-movement-${range.from}-to-${range.to}`;

  return (
    <div className="flex flex-col gap-lg">
      {/* Header */}
      <div>
        <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-forest-mid">
          Reports · Checkpost
        </p>
        <h1 className="text-heading-md text-ink">Vehicle movement report</h1>
        <p className="mt-xs text-body-sm text-mute">
          Checkpost verification events — physical quantity sighted vs. transit pass quantity.
        </p>
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
      <div className="grid grid-cols-3 gap-md">
        <StatCard label="Total verifications" value={total} sub="In date range" accent="info" />
        <StatCard label="Quantity matched" value={matches} sub="Verified clean" accent="success" />
        <StatCard
          label="Discrepancies"
          value={mismatches}
          sub="Quantity mismatch flagged"
          accent={mismatches > 0 ? "error" : "default"}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : !rows || rows.length === 0 ? (
        <div className="rounded-marketing border border-hairline bg-canvas-light">
          <EmptyState>No verifications recorded in this date range.</EmptyState>
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Verified at</TableHeaderCell>
              <TableHeaderCell>Pass no.</TableHeaderCell>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>Pass qty</TableHeaderCell>
              <TableHeaderCell>Verified qty</TableHeaderCell>
              <TableHeaderCell>Match</TableHeaderCell>
              <TableHeaderCell>Vehicle observed</TableHeaderCell>
              <TableHeaderCell>Checkpost</TableHeaderCell>
              <TableHeaderCell>Depot</TableHeaderCell>
              <TableHeaderCell>Notes</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} highlight={r.quantity_match === false}>
                <TableCell mono className="whitespace-nowrap">
                  {new Date(r.verified_at).toLocaleString("en-IN")}
                </TableCell>
                <TableCell mono>{r.pass_no}</TableCell>
                <TableCell>
                  <span className="block">{r.product_name}</span>
                  <span className="font-mono text-mono-micro text-mute">{r.product_code}</span>
                </TableCell>
                <TableCell mono>
                  {Number(r.pass_quantity).toFixed(3)}{" "}
                  <span className="text-mute">{r.unit}</span>
                </TableCell>
                <TableCell mono>
                  {r.verified_quantity != null
                    ? `${Number(r.verified_quantity).toFixed(3)} ${r.unit}`
                    : <span className="text-mute">—</span>}
                </TableCell>
                <TableCell>
                  {r.quantity_match === true && <Badge variant="success">Match ✓</Badge>}
                  {r.quantity_match === false && <Badge variant="error">Mismatch ✗</Badge>}
                  {r.quantity_match === null && <Badge variant="neutral">Pending</Badge>}
                </TableCell>
                <TableCell mono>
                  {r.vehicle_reg_observed ?? <span className="text-mute">—</span>}
                </TableCell>
                <TableCell>
                  <span className="block">{r.checkpost_name}</span>
                  <span className="font-mono text-mono-micro text-mute">{r.checkpost_code}</span>
                </TableCell>
                <TableCell>{r.depot_name}</TableCell>
                <TableCell>
                  {r.discrepancy_notes
                    ? <span className="text-body-sm text-error">{r.discrepancy_notes}</span>
                    : <span className="text-mute">—</span>}
                </TableCell>
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