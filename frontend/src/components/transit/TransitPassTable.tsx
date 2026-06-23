import { useProducts } from "@/lib/queries/useProducts";
import { useVehicles } from "@/lib/queries/useVehicles";
import { useUpdateTransitPassStatus } from "@/lib/queries/useTransitPasses";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeaderCell, TableRow, EmptyState,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { TransitPass, TransitPassStatus } from "@/types/database";

// Status badge variant mapping
const STATUS_VARIANT: Record<
  TransitPassStatus,
  "neutral" | "filled" | "success" | "error" | "brand"
> = {
  issued:     "brand",
  in_transit: "neutral",
  verified:   "success",
  completed:  "filled",
  cancelled:  "error",
};

const STATUS_LABEL: Record<TransitPassStatus, string> = {
  issued:     "Issued",
  in_transit: "In transit",
  verified:   "Verified",
  completed:  "Completed",
  cancelled:  "Cancelled",
};

// Valid next-status transitions a depot user can trigger from the table
const NEXT_STATUS: Partial<Record<TransitPassStatus, TransitPassStatus>> = {
  issued:     "in_transit",
  in_transit: "completed",
};

interface Props {
  passes: TransitPass[];
  depotId: string;
  canEdit: boolean;
}

export function TransitPassTable({ passes, depotId, canEdit }: Props) {
  const { data: products } = useProducts();
  const { data: vehicles } = useVehicles();
  const updateStatus = useUpdateTransitPassStatus();

  if (passes.length === 0) {
    return (
      <EmptyState>
        No transit passes yet. Use "Issue pass" to create the first one.
      </EmptyState>
    );
  }

  const productName = (id: string) =>
    products?.find((p) => p.id === id)?.name ?? id;
  const vehicleReg = (id: string | null) =>
    id ? (vehicles?.find((v) => v.id === id)?.registration_no ?? id) : "—";

  async function handleAdvance(pass: TransitPass) {
    const next = NEXT_STATUS[pass.status];
    if (!next) return;
    await updateStatus.mutateAsync({ id: pass.id, status: next, depotId });
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Pass no.</TableHeaderCell>
          <TableHeaderCell>Product</TableHeaderCell>
          <TableHeaderCell>Qty / unit</TableHeaderCell>
          <TableHeaderCell>Vehicle</TableHeaderCell>
          <TableHeaderCell>Destination</TableHeaderCell>
          <TableHeaderCell>Issued</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          {canEdit && <TableHeaderCell><span className="sr-only">Actions</span></TableHeaderCell>}
        </tr>
      </TableHead>
      <TableBody>
        {passes.map((p) => (
          <TableRow key={p.id}>
            <TableCell mono>{p.pass_no}</TableCell>
            <TableCell>{productName(p.product_id)}</TableCell>
            <TableCell>
              {Number(p.quantity).toFixed(3)}{" "}
              <span className="text-mute">{p.unit}</span>
            </TableCell>
            <TableCell mono>{vehicleReg(p.vehicle_id)}</TableCell>
            <TableCell>{p.destination}</TableCell>
            <TableCell mono>
              {new Date(p.issued_at).toLocaleDateString("en-IN")}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[p.status]}>
                {STATUS_LABEL[p.status]}
              </Badge>
            </TableCell>
            {canEdit && (
              <TableCell>
                {NEXT_STATUS[p.status] && (
                  <Button
                    variant="ghost"
                    className="!h-auto !px-0 text-meta underline"
                    disabled={updateStatus.isPending}
                    onClick={() => handleAdvance(p)}
                  >
                    Mark {STATUS_LABEL[NEXT_STATUS[p.status]!].toLowerCase()}
                  </Button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}