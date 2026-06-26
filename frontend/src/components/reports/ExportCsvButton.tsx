import { Button } from "@/components/ui/Button";

export interface CsvColumn<T> {
  key: keyof T;
  label: string;
  // Optional formatter — defaults to String(value)
  format?: (v: T[keyof T]) => string;
}

interface Props<T extends Record<string, unknown>> {
  data: T[];
  filename: string;
  columns: CsvColumn<T>[];
  disabled?: boolean;
}

export function ExportCsvButton<T extends Record<string, unknown>>({
  data,
  filename,
  columns,
  disabled,
}: Props<T>) {
  function download() {
    if (!data.length) return;

    const header = columns.map((c) => `"${c.label}"`).join(",");
    const rows = data.map((row) =>
      columns
        .map((c) => {
          const raw = row[c.key as string];
          const val = c.format ? c.format(raw as T[keyof T]) : raw == null ? "" : String(raw);
          // RFC 4180: quote fields containing comma, quote, or newline
          return /[,"\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="secondary"
      onClick={download}
      disabled={disabled || data.length === 0}
      title={data.length === 0 ? "No data to export" : `Download ${data.length} rows as CSV`}
    >
      ↓ Download CSV
    </Button>
  );
}