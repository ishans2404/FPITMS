import { Input } from "@/components/ui/Input";
import type { DateRange } from "@/lib/queries/useReports";

interface Props {
  value: DateRange;
  onChange: (r: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-end gap-sm">
      <Input
        label="From"
        type="date"
        value={value.from}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
      />
      <span className="mb-[10px] text-body-sm text-mute">—</span>
      <Input
        label="To"
        type="date"
        value={value.to}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
      />
    </div>
  );
}