import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/routes/auth/LoginPage";
import { DepotDashboardPage } from "@/routes/inventory/DepotDashboardPage";
import { StockLedgerPage } from "@/routes/inventory/StockLedgerPage";
import { ProductMasterPage } from "@/routes/inventory/ProductMasterPage";
import { TransitPassListPage } from "@/routes/transit/TransitPassListPage";
import { VehicleRegistryPage } from "@/routes/transit/VehicleRegistryPage";
import { CheckpostPage } from "@/routes/transit/CheckpostPage";
import { ReportsPage } from "@/routes/reports/ReportsPage";
import { StockRegisterPage } from "@/routes/reports/StockRegisterPage";
import { TransitReportPage } from "@/routes/reports/TransitReportPage";
import { VehicleMovementPage } from "@/routes/reports/VehicleMovementPage";
import { AnalyticsDashboardPage } from "@/routes/reports/AnalyticsDashboardPage";
import { AppShell } from "@/components/AppShell";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Phase 1 — Inventory */}
        <Route path="/" element={<AppShell><DepotDashboardPage /></AppShell>} />
        <Route path="/inventory/ledger"   element={<AppShell><StockLedgerPage /></AppShell>} />
        <Route path="/inventory/products" element={<AppShell><ProductMasterPage /></AppShell>} />

        {/* Phase 2 — Transit */}
        <Route path="/transit/passes"   element={<AppShell><TransitPassListPage /></AppShell>} />
        <Route path="/transit/vehicles" element={<AppShell><VehicleRegistryPage /></AppShell>} />
        <Route path="/transit/checkpost" element={<AppShell><CheckpostPage /></AppShell>} />

        {/* Phase 3 — Reports */}
        <Route path="/reports"                   element={<AppShell><ReportsPage /></AppShell>} />
        <Route path="/reports/stock-register"    element={<AppShell><StockRegisterPage /></AppShell>} />
        <Route path="/reports/transit"           element={<AppShell><TransitReportPage /></AppShell>} />
        <Route path="/reports/vehicle-movement"  element={<AppShell><VehicleMovementPage /></AppShell>} />
        <Route path="/reports/analytics"         element={<AppShell><AnalyticsDashboardPage /></AppShell>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}