import { Input } from "@/components/ui/Input";
import type { DateRange } from "@/lib/queries/useReports";

interface Props {
  value: DateRange;
  onChange: (r: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-sm">
      <Input
        label="From"
        type="date"
        value={value.from}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
      />
      <span className="mb-[10px] hidden text-body-sm text-mute sm:block">—</span>
      <Input
        label="To"
        type="date"
        value={value.to}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
      />
    </div>
  );
}