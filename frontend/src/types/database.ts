// Hand-written types matching supabase/migrations/000{1,2,3,4}_*.sql.
// Replace with `supabase gen types typescript` output once the project is
// linked locally — these are kept in sync manually for now.
//
// VERSION PIN NOTE: frontend/package.json pins @supabase/supabase-js to
// exactly 2.45.4 (not a ^ range). The "latest" on npm as of this scaffold
// (2.108.2) has a confirmed generic-typing regression: with that version,
// ANY custom Database type — even a single minimal table with two fields,
// reproduced in isolation outside this project too — causes every
// `.select()` query result to silently infer as `never` with no error at
// the call site, and `.insert()`/`.from()` table-name checking stop working
// as well. 2.45.4 does not have this problem. Revisit the pin once a fixed
// version ships upstream (check the changelog before bumping).

// ── Phase 1 enums ──────────────────────────────────────────────────────────
export type UserRole = "depot_staff" | "dfo" | "checkpost_staff" | "hq_analytics";
export type ProduceCategory = "timber" | "ntfp_mfp";
export type MeasurementUnit = "cum" | "quintal" | "kg" | "nos" | "mt";
export type LedgerTransactionType = "inward" | "outward";

// ── Phase 2 enums ──────────────────────────────────────────────────────────
export type TransitPassStatus =
  | "issued"
  | "in_transit"
  | "verified"
  | "completed"
  | "cancelled";

export type VehicleType = "truck" | "tractor" | "pickup" | "tempo" | "other";

// ── Phase 1 interfaces ─────────────────────────────────────────────────────
export interface Division {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Depot {
  id: string;
  division_id: string;
  name: string;
  code: string;
  location: string | null;
  created_at: string;
}

export interface Checkpost {
  id: string;
  division_id: string;
  name: string;
  code: string;
  location: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  depot_id: string | null;
  division_id: string | null;
  checkpost_id: string | null;
  created_at: string;
}

export interface ProductMaster {
  id: string;
  code: string;
  name: string;
  category: ProduceCategory;
  species: string | null;
  default_unit: MeasurementUnit;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StockLedgerEntry {
  id: string;
  depot_id: string;
  product_id: string;
  transaction_type: LedgerTransactionType;
  quantity: number;
  unit: MeasurementUnit;
  batch_lot_no: string;
  quality_grade: string | null;
  source_or_destination: string;
  vehicle_reg_no: string | null;
  driver_name: string | null;
  transit_pass_ref: string | null;
  remarks: string | null;
  reversal_of: string | null;
  recorded_by: string;
  recorded_at: string;
}

export interface StockBalance {
  depot_id: string;
  product_id: string;
  current_quantity: number;
}

// ── Phase 2 interfaces ─────────────────────────────────────────────────────
export interface Vehicle {
  id: string;
  registration_no: string;
  vehicle_type: VehicleType;
  owner_name: string | null;
  capacity_value: number | null;
  capacity_unit: MeasurementUnit | null;
  is_active: boolean;
  registered_by: string;
  created_at: string;
}

export interface TransitPass {
  id: string;
  pass_no: string;
  depot_id: string;
  vehicle_id: string | null;
  driver_name: string | null;
  driver_license_no: string | null;
  product_id: string;
  quantity: number;
  unit: MeasurementUnit;
  source_description: string;
  destination: string;
  batch_lot_ref: string | null;
  issued_at: string;
  valid_until: string | null;
  status: TransitPassStatus;
  remarks: string | null;
  issued_by: string;
  created_at: string;
}

export interface CheckpostVerification {
  id: string;
  transit_pass_id: string;
  checkpost_id: string;
  vehicle_id: string | null;
  vehicle_reg_observed: string | null;
  verified_quantity: number | null;
  quantity_match: boolean | null;
  discrepancy_notes: string | null;
  verified_by: string;
  verified_at: string;
}

// ── Phase 3 view row types ─────────────────────────────────────────────────
export interface StockRegisterRow {
  id: string;
  depot_id: string;
  product_id: string;
  recorded_at: string;
  transaction_type: LedgerTransactionType;
  quantity: number;
  unit: MeasurementUnit;
  batch_lot_no: string;
  quality_grade: string | null;
  source_or_destination: string;
  transit_pass_ref: string | null;
  vehicle_reg_no: string | null;
  driver_name: string | null;
  remarks: string | null;
  reversal_of: string | null;
  product_name: string;
  product_code: string;
  product_category: ProduceCategory;
  depot_name: string;
  depot_code: string;
  division_name: string;
  division_code: string;
  recorded_by_name: string | null;
}

export interface TransitPassReportRow {
  id: string;
  depot_id: string;
  product_id: string;
  pass_no: string;
  issued_at: string;
  valid_until: string | null;
  status: TransitPassStatus;
  quantity: number;
  unit: MeasurementUnit;
  source_description: string;
  destination: string;
  driver_name: string | null;
  driver_license_no: string | null;
  batch_lot_ref: string | null;
  remarks: string | null;
  product_name: string;
  product_code: string;
  product_category: ProduceCategory;
  vehicle_reg_no: string | null;
  vehicle_type: VehicleType | null;
  depot_name: string;
  depot_code: string;
  division_name: string;
  division_code: string;
  issued_by_name: string | null;
}

export interface CheckpostVerificationReportRow {
  id: string;
  transit_pass_id: string;
  checkpost_id: string;
  verified_at: string;
  vehicle_reg_observed: string | null;
  verified_quantity: number | null;
  quantity_match: boolean | null;
  discrepancy_notes: string | null;
  pass_no: string;
  pass_quantity: number;
  unit: MeasurementUnit;
  destination: string;
  pass_status: TransitPassStatus;
  product_name: string;
  product_code: string;
  checkpost_name: string;
  checkpost_code: string;
  depot_name: string;
  depot_code: string;
  division_name: string;
  vehicle_reg_no: string | null;
  verified_by_name: string | null;
}

export interface DailySummaryRow {
  day: string;
  depot_id: string;
  depot_name: string;
  depot_code: string;
  division_id: string;
  division_name: string;
  transaction_type: LedgerTransactionType;
  entry_count: number;
  total_quantity: number;
}

// ── Supabase Database shape ────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      divisions: {
        Row: Division;
        Insert: { id?: string; name: string; code: string; created_at?: string };
        Update: { id?: string; name?: string; code?: string; created_at?: string };
        Relationships: [];
      };
      depots: {
        Row: Depot;
        Insert: {
          id?: string; division_id: string; name: string; code: string;
          location?: string | null; created_at?: string;
        };
        Update: {
          id?: string; division_id?: string; name?: string; code?: string;
          location?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      checkposts: {
        Row: Checkpost;
        Insert: {
          id?: string; division_id: string; name: string; code: string;
          location?: string | null; created_at?: string;
        };
        Update: {
          id?: string; division_id?: string; name?: string; code?: string;
          location?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: {
          id: string; full_name: string; role: UserRole;
          depot_id?: string | null; division_id?: string | null;
          checkpost_id?: string | null; created_at?: string;
        };
        Update: {
          id?: string; full_name?: string; role?: UserRole;
          depot_id?: string | null; division_id?: string | null;
          checkpost_id?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      product_master: {
        Row: ProductMaster;
        Insert: {
          id?: string; code: string; name: string; category: ProduceCategory;
          species?: string | null; default_unit: MeasurementUnit;
          description?: string | null; is_active?: boolean; created_at?: string;
        };
        Update: {
          id?: string; code?: string; name?: string; category?: ProduceCategory;
          species?: string | null; default_unit?: MeasurementUnit;
          description?: string | null; is_active?: boolean; created_at?: string;
        };
        Relationships: [];
      };
      stock_ledger: {
        Row: StockLedgerEntry;
        Insert: {
          id?: string; depot_id: string; product_id: string;
          transaction_type: LedgerTransactionType; quantity: number;
          unit: MeasurementUnit; batch_lot_no: string;
          quality_grade?: string | null; source_or_destination: string;
          vehicle_reg_no?: string | null; driver_name?: string | null;
          transit_pass_ref?: string | null; remarks?: string | null;
          reversal_of?: string | null; recorded_by?: string; recorded_at?: string;
        };
        // No UPDATE policy — see ADR 0002.
        Update: never;
        Relationships: [];
      };
      // ── Phase 2 tables ───────────────────────────────────────────────────
      vehicles: {
        Row: Vehicle;
        Insert: {
          id?: string; registration_no: string; vehicle_type?: VehicleType;
          owner_name?: string | null; capacity_value?: number | null;
          capacity_unit?: MeasurementUnit | null; is_active?: boolean;
          registered_by?: string; created_at?: string;
        };
        Update: {
          id?: string; registration_no?: string; vehicle_type?: VehicleType;
          owner_name?: string | null; capacity_value?: number | null;
          capacity_unit?: MeasurementUnit | null; is_active?: boolean;
          registered_by?: string; created_at?: string;
        };
        Relationships: [];
      };
      transit_passes: {
        Row: TransitPass;
        Insert: {
          id?: string; pass_no: string; depot_id: string;
          vehicle_id?: string | null; driver_name?: string | null;
          driver_license_no?: string | null; product_id: string;
          quantity: number; unit: MeasurementUnit;
          source_description: string; destination: string;
          batch_lot_ref?: string | null; issued_at?: string;
          valid_until?: string | null; status?: TransitPassStatus;
          remarks?: string | null; issued_by?: string; created_at?: string;
        };
        // Only status field is updatable in practice; the full Update type
        // is defined to allow the status-update mutation.
        Update: {
          status?: TransitPassStatus; remarks?: string | null;
          valid_until?: string | null;
        };
        Relationships: [];
      };
      checkpost_verifications: {
        Row: CheckpostVerification;
        Insert: {
          id?: string; transit_pass_id: string; checkpost_id: string;
          vehicle_id?: string | null; vehicle_reg_observed?: string | null;
          verified_quantity?: number | null; quantity_match?: boolean | null;
          discrepancy_notes?: string | null; verified_by?: string; verified_at?: string;
        };
        // Append-only, like stock_ledger.
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      stock_balance: {
        Row: StockBalance;
        Relationships: [];
      };
      v_stock_register: {
        Row: StockRegisterRow;
        Relationships: [];
      };
      v_transit_pass_report: {
        Row: TransitPassReportRow;
        Relationships: [];
      };
      v_checkpost_verification_report: {
        Row: CheckpostVerificationReportRow;
        Relationships: [];
      };
      v_daily_summary: {
        Row: DailySummaryRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      produce_category: ProduceCategory;
      measurement_unit: MeasurementUnit;
      ledger_transaction_type: LedgerTransactionType;
      transit_pass_status: TransitPassStatus;
      vehicle_type: VehicleType;
    };
    CompositeTypes: Record<string, never>;
  };
}