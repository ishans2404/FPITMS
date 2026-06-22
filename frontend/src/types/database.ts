// Hand-written types matching supabase/migrations/000{1,2,3}_*.sql.
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

export type UserRole = "depot_staff" | "dfo" | "checkpost_staff" | "hq_analytics";
export type ProduceCategory = "timber" | "ntfp_mfp";
export type MeasurementUnit = "cum" | "quintal" | "kg" | "nos" | "mt";
export type LedgerTransactionType = "inward" | "outward";

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
          id?: string;
          division_id: string;
          name: string;
          code: string;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          division_id?: string;
          name?: string;
          code?: string;
          location?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      checkposts: {
        Row: Checkpost;
        Insert: {
          id?: string;
          division_id: string;
          name: string;
          code: string;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          division_id?: string;
          name?: string;
          code?: string;
          location?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name: string;
          role: UserRole;
          depot_id?: string | null;
          division_id?: string | null;
          checkpost_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          depot_id?: string | null;
          division_id?: string | null;
          checkpost_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      product_master: {
        Row: ProductMaster;
        Insert: {
          id?: string;
          code: string;
          name: string;
          category: ProduceCategory;
          species?: string | null;
          default_unit: MeasurementUnit;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          category?: ProduceCategory;
          species?: string | null;
          default_unit?: MeasurementUnit;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      stock_ledger: {
        Row: StockLedgerEntry;
        Insert: {
          id?: string;
          depot_id: string;
          product_id: string;
          transaction_type: LedgerTransactionType;
          quantity: number;
          unit: MeasurementUnit;
          batch_lot_no: string;
          quality_grade?: string | null;
          source_or_destination: string;
          vehicle_reg_no?: string | null;
          driver_name?: string | null;
          transit_pass_ref?: string | null;
          remarks?: string | null;
          reversal_of?: string | null;
          recorded_by?: string;
          recorded_at?: string;
        };
        // No UPDATE policy exists on this table — see ADR 0002. `never` here
        // makes a future `.update()` call fail to typecheck before it ever
        // reaches Postgres (which would also deny it).
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      stock_balance: {
        Row: StockBalance;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      produce_category: ProduceCategory;
      measurement_unit: MeasurementUnit;
      ledger_transaction_type: LedgerTransactionType;
    };
    CompositeTypes: Record<string, never>;
  };
}
