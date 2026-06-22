import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/routes/auth/LoginPage";
import { DepotDashboardPage } from "@/routes/inventory/DepotDashboardPage";
import { StockLedgerPage } from "@/routes/inventory/StockLedgerPage";
import { ProductMasterPage } from "@/routes/inventory/ProductMasterPage";
import { AppShell } from "@/components/AppShell";

// transit/ and reports/ route folders exist (Section 8) but are intentionally
// empty until Phase 2/3 — no placeholder routes are registered for them yet.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AppShell>
              <DepotDashboardPage />
            </AppShell>
          }
        />
        <Route
          path="/inventory/ledger"
          element={
            <AppShell>
              <StockLedgerPage />
            </AppShell>
          }
        />
        <Route
          path="/inventory/products"
          element={
            <AppShell>
              <ProductMasterPage />
            </AppShell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
