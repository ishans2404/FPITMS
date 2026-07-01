import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCheckpostVerifications,
  useAllCheckpostVerifications,
  useCreateVerification,
} from "@/lib/queries/useCheckpostVerifications";
import { verificationFormSchema, type VerificationFormInput } from "@/lib/validators/transit";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table, TableHead, TableHeaderCell,
  TableBody, TableRow, TableCell, EmptyState, TableSkeleton,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  IconCheckpost, IconAlertCircle, IconCheckCircle, IconSearch, IconShield,
} from "@/components/ui/Icons";
import { supabase } from "@/lib/supabaseClient";

// ── Status badge helper ──────────────────────────────────────────────────────
type PassStatus = "issued" | "in_transit" | "verified" | "completed" | "cancelled";

function statusBadge(s: PassStatus) {
  const map: Record<PassStatus, { variant: "neutral" | "info" | "success" | "filled" | "error"; label: string }> = {
    issued:     { variant: "neutral",  label: "Issued"     },
    in_transit: { variant: "info",     label: "In transit" },
    verified:   { variant: "success",  label: "Verified"   },
    completed:  { variant: "filled",   label: "Completed"  },
    cancelled:  { variant: "error",    label: "Cancelled"  },
  };
  const { variant, label } = map[s] ?? { variant: "neutral" as const, label: s };
  return <Badge variant={variant}>{label}</Badge>;
}

// ── Pass lookup (local query by pass_no) ────────────────────────────────────
type FoundPass = {
  id: string;
  pass_no: string;
  status: string;
  quantity: number;
  unit: string;
  source_description: string;
  destination: string;
  driver_name: string | null;
  vehicle_id: string | null;
  product: { name: string; code: string } | null;
  vehicle: { registration_no: string } | null;
} | null;

async function lookupPass(passNo: string): Promise<FoundPass> {
  const { data, error } = await supabase
    .from("transit_passes")
    .select(`
      id, pass_no, status, quantity, unit, source_description, destination, driver_name, vehicle_id,
      product:product_master ( name, code ),
      vehicle:vehicles ( registration_no )
    `)
    .eq("pass_no", passNo.trim())
    .maybeSingle();
  if (error) throw error;
  return data as FoundPass;
}

// ── Verification form ───────────────────────────────────────────────────────
function VerificationForm({
  pass,
  checkpostId,
  onDone,
}: {
  pass: NonNullable<FoundPass>;
  checkpostId: string;
  onDone: () => void;
}) {
  const create = useCreateVerification();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VerificationFormInput>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      vehicle_reg_observed: pass.vehicle?.registration_no ?? "",
      verified_quantity: pass.quantity,
      quantity_match: true,
    },
  });

  const quantityMatch = watch("quantity_match");

  async function onSubmit(values: VerificationFormInput) {
    await create.mutateAsync({
      transit_pass_id: pass.id,
      checkpost_id: checkpostId,
      vehicle_id: pass.vehicle_id ?? null,
      vehicle_reg_observed: values.vehicle_reg_observed,
      verified_quantity: values.verified_quantity,
      quantity_match: values.quantity_match,
      discrepancy_notes: values.discrepancy_notes,
    });
    reset();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <div className="flex flex-col gap-xxs">
          <label className="text-caption-tight text-graphite">Vehicle reg. observed at gate</label>
          <input
            className="h-11 rounded-app-xs border border-hairline bg-canvas-light px-md text-body text-ink placeholder:text-ash focus:outline-none focus:ring-2 focus:ring-link-blue"
            placeholder="e.g. CG04AB1234"
            {...register("vehicle_reg_observed")}
          />
          {errors.vehicle_reg_observed && (
            <span className="text-meta text-error">{errors.vehicle_reg_observed.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-xxs">
          <label className="text-caption-tight text-graphite">Quantity physically counted</label>
          <input
            type="number"
            step="0.001"
            className="h-11 rounded-app-xs border border-hairline bg-canvas-light px-md text-body text-ink placeholder:text-ash focus:outline-none focus:ring-2 focus:ring-link-blue"
            {...register("verified_quantity")}
          />
          {errors.verified_quantity && (
            <span className="text-meta text-error">{errors.verified_quantity.message}</span>
          )}
        </div>
      </div>

      <label className="flex items-center gap-sm text-body-sm text-ink cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-app-xs accent-ink"
          {...register("quantity_match")}
        />
        Quantity matches the transit pass
      </label>

      {!quantityMatch && (
        <div className="flex flex-col gap-xxs">
          <label className="text-caption-tight text-graphite">
            Discrepancy notes <span className="text-error">*</span>
          </label>
          <textarea
            className="min-h-[80px] rounded-app-xs border border-hairline bg-canvas-light px-md py-sm text-body text-ink placeholder:text-ash focus:outline-none focus:ring-2 focus:ring-link-blue"
            placeholder="Describe what was observed — quantity found, condition, vehicle mismatch, etc."
            {...register("discrepancy_notes")}
          />
        </div>
      )}

      {create.isError && (
        <Alert tone="error">
          Could not save: {(create.error as Error).message}
        </Alert>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting\u2026" : "Log verification"}
      </Button>
    </form>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export function CheckpostPage() {
  const { profile } = useAuth();
  const isCheckpostStaff = profile?.role === "checkpost_staff";
  const isDfoOrHq = profile?.role === "dfo" || profile?.role === "hq_analytics";

  // Verification log
  const staffQuery = useCheckpostVerifications(profile?.checkpost_id);
  const allQuery   = useAllCheckpostVerifications();
  const verifications = isCheckpostStaff ? staffQuery.data : allQuery.data;
  const isLoading     = isCheckpostStaff ? staffQuery.isLoading : allQuery.isLoading;

  // Pass lookup state
  const [searchInput, setSearchInput] = useState("");
  const [foundPass, setFoundPass]     = useState<FoundPass | undefined>(undefined);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [showForm, setShowForm]       = useState(false);

  async function handleSearch() {
    if (!searchInput.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setFoundPass(undefined);
    setShowForm(false);
    try {
      const pass = await lookupPass(searchInput);
      if (!pass) {
        setLookupError(`No transit pass found for "${searchInput}".`);
      } else {
        setFoundPass(pass);
      }
    } catch (e) {
      setLookupError((e as Error).message);
    } finally {
      setLookupLoading(false);
    }
  }

  // Stats derived from verification log
  const today = new Date().toDateString();
  const todayCount  = verifications?.filter(
    (v) => new Date(v.verified_at).toDateString() === today
  ).length ?? 0;
  const discrepancies = verifications?.filter((v) => !v.quantity_match).length ?? 0;
  const totalCount  = verifications?.length ?? 0;

  const canVerify =
    isCheckpostStaff &&
    !!profile?.checkpost_id &&
    !!foundPass &&
    foundPass.status === "in_transit";

  return (
    <div className="flex flex-col gap-lg">
      {/* Page header */}
      <div>
        <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-mute">
          Transit \u00b7 Checkpost
        </p>
        <h1 className="text-heading-md text-ink">Checkpost verification</h1>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
        <StatCard
          label="Total verified"
          value={totalCount}
          sub="All time at this checkpost"
          icon={<IconShield size={15} />}
          accent="info"
        />
        <StatCard
          label="Verified today"
          value={todayCount}
          sub="Since midnight"
          icon={<IconCheckCircle size={15} />}
          accent="success"
        />
        <StatCard
          label="Discrepancies"
          value={discrepancies}
          sub="Quantity mismatch logged"
          icon={<IconAlertCircle size={15} />}
          accent={discrepancies > 0 ? "error" : "default"}
        />
      </div>

      {/* Pass lookup — checkpost_staff only */}
      {isCheckpostStaff && (
        <div className="rounded-marketing border border-hairline bg-canvas-light p-xl">
          <p className="text-heading-sm text-ink mb-md">Look up a transit pass</p>

          <div className="flex gap-sm">
            <input
              className="h-11 flex-1 rounded-app-xs border border-hairline bg-canvas-light px-md text-body text-ink placeholder:text-ash focus:outline-none focus:ring-2 focus:ring-link-blue"
              placeholder="Enter pass number \u2014 e.g. CG/RPR/TP/2026/002"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              variant="secondary"
              onClick={handleSearch}
              disabled={lookupLoading || !searchInput.trim()}
            >
              <IconSearch size={14} />
              {lookupLoading ? "Searching\u2026" : "Search"}
            </Button>
          </div>

          {lookupError && (
            <p className="mt-md text-body-sm text-error">{lookupError}</p>
          )}

          {/* Found pass card */}
          {foundPass && (
            <div className="mt-lg rounded-app-lg border border-hairline bg-canvas-paper p-lg">
              <div className="flex items-start justify-between gap-md mb-md">
                <div>
                  <p className="font-mono text-mono-eyebrow text-graphite">{foundPass.pass_no}</p>
                  <p className="text-heading-sm text-ink mt-xxs">
                    {foundPass.product?.name ?? "\u2014"}
                  </p>
                  <p className="text-body-sm text-mute mt-xxs">
                    {foundPass.quantity} {foundPass.unit} \u00b7{" "}
                    {foundPass.source_description} \u2192 {foundPass.destination}
                  </p>
                </div>
                {statusBadge(foundPass.status as PassStatus)}
              </div>

              <div className="grid grid-cols-1 gap-sm text-body-sm mb-md sm:grid-cols-2">
                <div>
                  <span className="font-mono text-mono-caps text-mute">Vehicle</span>
                  <p className="font-mono text-mono-eyebrow text-ink mt-xxs">
                    {foundPass.vehicle?.registration_no ?? "Not registered"}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-mono-caps text-mute">Driver</span>
                  <p className="text-ink mt-xxs">{foundPass.driver_name ?? "\u2014"}</p>
                </div>
              </div>

              {foundPass.status !== "in_transit" && (
                <Alert>
                  This pass is <strong>{foundPass.status}</strong> \u2014 verification can only be
                  logged for passes with status <strong>in_transit</strong>.
                </Alert>
              )}

              {canVerify && !showForm && (
                <Button onClick={() => setShowForm(true)} className="mt-md">
                  Log verification
                </Button>
              )}

              {canVerify && showForm && (
                <div className="mt-md border-t border-hairline pt-md">
                  <p className="text-body-sm font-medium text-ink mb-md">
                    Verification details
                  </p>
                  <VerificationForm
                    pass={foundPass as NonNullable<FoundPass>}
                    checkpostId={profile!.checkpost_id!}
                    onDone={() => {
                      setShowForm(false);
                      setFoundPass(undefined);
                      setSearchInput("");
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* No checkpost assigned warning */}
      {isCheckpostStaff && !profile?.checkpost_id && (
        <Alert tone="error">
          Your account isn't assigned to a checkpost. Ask an administrator to set
          your checkpost_id in the profiles table.
        </Alert>
      )}

      {/* Verification log */}
      <div>
        <p className="text-heading-sm text-ink mb-md">
          {isCheckpostStaff ? "Verification log \u2014 this checkpost" : "All verifications"}
        </p>

        {isLoading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : !verifications || verifications.length === 0 ? (
          <div className="rounded-marketing border border-hairline bg-canvas-light">
            <EmptyState>
              No verifications logged yet.
              {isCheckpostStaff && " Use the pass lookup above to log the first one."}
            </EmptyState>
          </div>
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Pass no.</TableHeaderCell>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>Pass qty</TableHeaderCell>
                <TableHeaderCell>Verified qty</TableHeaderCell>
                <TableHeaderCell>Match</TableHeaderCell>
                {isDfoOrHq && <TableHeaderCell>Checkpost</TableHeaderCell>}
                <TableHeaderCell>Verified at</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {verifications.map((v) => {
                const pass    = v.transit_pass as { pass_no: string; quantity: number; unit: string; product: { name: string } | null } | null;
                const cp      = (v as { checkpost?: { name: string; code: string } }).checkpost;
                const isMatch = v.quantity_match;

                return (
                  <TableRow key={v.id} highlight={!isMatch}>
                    <TableCell mono>{pass?.pass_no ?? "\u2014"}</TableCell>
                    <TableCell>{pass?.product?.name ?? "\u2014"}</TableCell>
                    <TableCell mono>
                      {pass?.quantity} {pass?.unit}
                    </TableCell>
                    <TableCell mono>
                      {v.verified_quantity} {pass?.unit}
                    </TableCell>
                    <TableCell>
                      {isMatch === true  && <Badge variant="success">Match \u2713</Badge>}
                      {isMatch === false && (
                        <span className="flex flex-col gap-xxs">
                          <Badge variant="error">Mismatch \u2717</Badge>
                          {v.discrepancy_notes && (
                            <span className="text-meta text-mute leading-snug max-w-xs">
                              {v.discrepancy_notes}
                            </span>
                          )}
                        </span>
                      )}
                      {isMatch === null  && <Badge variant="neutral">Pending</Badge>}
                    </TableCell>
                      {isDfoOrHq && (
                      <TableCell mono>{cp?.name ?? "\u2014"}</TableCell>
                    )}
                    <TableCell mono className="whitespace-nowrap">
                      {new Date(v.verified_at).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}