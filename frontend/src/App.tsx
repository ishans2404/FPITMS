import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/routes/auth/LoginPage";
import { DepotDashboardPage } from "@/routes/inventory/DepotDashboardPage";
import { StockLedgerPage } from "@/routes/inventory/StockLedgerPage";
import { ProductMasterPage } from "@/routes/inventory/ProductMasterPage";
import { TransitPassListPage } from "@/routes/transit/TransitPassListPage";
import { VehicleRegistryPage } from "@/routes/transit/VehicleRegistryPage";
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

        {/* Phase 3 — reports/ intentionally empty */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}