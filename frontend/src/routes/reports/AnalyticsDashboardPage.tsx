import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { useDailySummary } from "@/lib/queries/useReports";
import { useStockBalance } from "@/lib/queries/useStockBalance";
import { useProducts } from "@/lib/queries/useProducts";
import { StatCard } from "@/components/ui/StatCard";

// DESIGN.md tokens as literals for recharts (recharts uses inline styles, not Tailwind classes).
const COLOR_SUCCESS  = "#37cd84";
const COLOR_INK      = "#0b0b0b";
const COLOR_BRAND    = "#f36458";
const COLOR_HAIRLINE = "#ededed";
const COLOR_ASH      = "#b9b9b9";
const COLOR_MUTE     = "#797979";
const COLOR_GRAPHITE = "#353535";

// Tooltip with DESIGN.md token surface
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-app-lg border border-hairline bg-canvas-light p-md shadow-soft-drop">
      <p className="font-mono text-mono-caps uppercase tracking-wide text-mute mb-xs">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-body-sm" style={{ color: p.color }}>
          {p.name}: <strong>{Number(p.value).toFixed(2)}</strong>
        </p>
      ))}
    </div>
  );
}

export function AnalyticsDashboardPage() {
  const { data: daily, isLoading: dailyLoading } = useDailySummary(30);
  const { data: balances } = useStockBalance();
  const { data: products } = useProducts();

  // ── Aggregate daily rows into chart-friendly shape ──────────────────────
  const dailyChartData = useMemo(() => {
    if (!daily) return [];
    const byDay = new Map<string, { day: string; Inward: number; Outward: number }>();
    for (const row of daily) {
      const day = row.day as string;
      if (!byDay.has(day)) byDay.set(day, { day, Inward: 0, Outward: 0 });
      const entry = byDay.get(day)!;
      if (row.transaction_type === "inward")  entry.Inward  += Number(row.total_quantity);
      else                                     entry.Outward += Number(row.total_quantity);
    }
    return Array.from(byDay.values()).map((d) => ({
      ...d,
      // Short date label for x-axis
      day: new Date(d.day).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    }));
  }, [daily]);

  // ── Current stock by product ─────────────────────────────────────────────
  const stockChartData = useMemo(() => {
    if (!balances || !products) return [];
    return products
      .map((p) => ({
        name: p.code,
        fullName: p.name,
        Stock: Math.max(0, Number(balances.find((b) => b.product_id === p.id)?.current_quantity ?? 0)),
        unit: p.default_unit,
      }))
      .filter((d) => d.Stock > 0)
      .sort((a, b) => b.Stock - a.Stock);
  }, [balances, products]);

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalInward  = daily?.filter((r) => r.transaction_type === "inward")
    .reduce((s, r) => s + Number(r.total_quantity), 0) ?? 0;
  const totalOutward = daily?.filter((r) => r.transaction_type === "outward")
    .reduce((s, r) => s + Number(r.total_quantity), 0) ?? 0;
  const activeDays   = new Set(daily?.map((r) => r.day)).size;
  const totalEntries = daily?.reduce((s, r) => s + Number(r.entry_count), 0) ?? 0;

  return (
    <div className="flex flex-col gap-lg">
      {/* Header */}
      <div>
        <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-forest-mid">
          Reports · Analytics
        </p>
        <h1 className="text-heading-md text-ink">Analytics dashboard</h1>
        <p className="mt-xs text-body-sm text-mute">
          Last 30 days · Role-scoped to your accessible depots.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
        <StatCard
          label="Total inward"
          value={totalInward.toFixed(1)}
          sub="Qty received (30 days)"
          accent="success"
        />
        <StatCard
          label="Total outward"
          value={totalOutward.toFixed(1)}
          sub="Qty dispatched (30 days)"
        />
        <StatCard
          label="Active days"
          value={activeDays}
          sub="Days with transactions"
          accent="info"
        />
        <StatCard
          label="Total entries"
          value={totalEntries}
          sub="Excluding corrections"
        />
      </div>

      {/* Daily inward vs outward chart */}
      <div className="rounded-marketing border border-hairline bg-canvas-light p-xl">
        <p className="font-mono text-mono-caps uppercase tracking-wide text-mute mb-xs">
          Daily inward / outward (last 30 days)
        </p>
        <p className="text-heading-sm text-ink mb-lg">Transaction volume by day</p>

        {dailyLoading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="text-body-sm text-mute">Loading chart…</span>
          </div>
        ) : dailyChartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-app-lg bg-canvas-paper">
            <span className="text-body-sm text-mute">No transaction data in the last 30 days.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyChartData} barCategoryGap="30%" barGap={2}>
              <CartesianGrid vertical={false} stroke={COLOR_HAIRLINE} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: COLOR_MUTE, fontFamily: "IBM Plex Mono" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: COLOR_MUTE, fontFamily: "IBM Plex Mono" }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: COLOR_HAIRLINE }} />
              <Legend
                wrapperStyle={{ fontSize: "11px", fontFamily: "IBM Plex Mono", color: COLOR_GRAPHITE }}
              />
              <Bar dataKey="Inward"  fill={COLOR_SUCCESS} radius={[3, 3, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Outward" fill={COLOR_ASH}     radius={[3, 3, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Current stock by product chart */}
      <div className="rounded-marketing border border-hairline bg-canvas-light p-xl">
        <p className="font-mono text-mono-caps uppercase tracking-wide text-mute mb-xs">
          Current stock
        </p>
        <p className="text-heading-sm text-ink mb-lg">Balance by product (all accessible depots)</p>

        {stockChartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-app-lg bg-canvas-paper">
            <span className="text-body-sm text-mute">No stock recorded yet.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stockChartData} layout="vertical" barCategoryGap="25%">
              <CartesianGrid horizontal={false} stroke={COLOR_HAIRLINE} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: COLOR_MUTE, fontFamily: "IBM Plex Mono" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 11, fill: COLOR_GRAPHITE, fontFamily: "IBM Plex Mono" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as { fullName: string; Stock: number; unit: string };
                  return (
                    <div className="rounded-app-lg border border-hairline bg-canvas-light p-md shadow-soft-drop">
                      <p className="text-body-sm font-medium text-ink">{d.fullName}</p>
                      <p className="font-mono text-mono-eyebrow text-graphite">
                        {Number(d.Stock).toFixed(3)} {d.unit}
                      </p>
                    </div>
                  );
                }}
                cursor={{ fill: COLOR_HAIRLINE }}
              />
              <Bar dataKey="Stock" radius={[0, 3, 3, 0]} maxBarSize={28}>
                {stockChartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === 0 ? COLOR_INK : i % 3 === 1 ? COLOR_GRAPHITE : COLOR_ASH}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}