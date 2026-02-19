import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";

export interface NumberFormat {
  type: "number" | "currency" | "percentage";
  decimals: number;
  currencySymbol?: string;
  thousandsSeparator?: boolean;
}

interface PivotFormattingProps {
  format: NumberFormat;
  onFormatChange: (format: NumberFormat) => void;
}

export function PivotFormatting({ format, onFormatChange }: PivotFormattingProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Number Format</Label>
          <Select
            value={format.type}
            onValueChange={(value) =>
              onFormatChange({ ...format, type: value as NumberFormat["type"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="currency">Currency</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Decimal Places</Label>
          <Input
            type="number"
            min="0"
            max="10"
            value={format.decimals}
            onChange={(e) =>
              onFormatChange({ ...format, decimals: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      {format.type === "currency" && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Currency Symbol</Label>
          <Input
            value={format.currencySymbol || "$"}
            onChange={(e) =>
              onFormatChange({ ...format, currencySymbol: e.target.value })
            }
            placeholder="$"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          id="thousands"
          checked={format.thousandsSeparator}
          onCheckedChange={(checked) =>
            onFormatChange({ ...format, thousandsSeparator: checked === true })
          }
        />
        <Label htmlFor="thousands" className="text-sm cursor-pointer">
          Use thousands separator
        </Label>
      </div>
    </div>
  );
}

export function formatNumber(value: number, format: NumberFormat): string {
  let result = value.toFixed(format.decimals);

  if (format.thousandsSeparator) {
    const [integer, decimal] = result.split(".");
    result = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (decimal) result += "." + decimal;
  }

  switch (format.type) {
    case "currency":
      return `${format.currencySymbol || "$"}${result}`;
    case "percentage":
      return `${result}%`;
    default:
      return result;
  }
}
