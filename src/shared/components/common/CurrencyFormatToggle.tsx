import { DollarSign, Euro, PoundSterling } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/shared/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useCurrencyFormat } from "@/app/providers/CurrencyFormatContext";
import { toast } from "@/shared/hooks/use-toast";

const CURRENCY_ICONS = {
  USD: DollarSign,
  EUR: Euro,
  GBP: PoundSterling,
};

const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
};

export function CurrencyFormatToggle() {
  const { currencyFormat, setCurrencyFormat, selectedCurrency, setSelectedCurrency, exchangeRates } = useCurrencyFormat();
  const CurrencyIcon = CURRENCY_ICONS[selectedCurrency];

  const handleFormatChange = (value: string) => {
    const newFormat = value as 'whole' | 'decimal';
    setCurrencyFormat(newFormat);

    toast({
      title: "Currency Format Updated",
      description: `Currency values will now display ${newFormat === 'whole' ? 'without' : 'with'} decimal places.`,
    });
  };

  const handleCurrencyChange = (value: string) => {
    const newCurrency = value as 'USD' | 'EUR' | 'GBP';
    setSelectedCurrency(newCurrency);

    toast({
      title: "Currency Changed",
      description: `All values will now be displayed in ${CURRENCY_NAMES[newCurrency]} with live conversion rates.`,
    });
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <CurrencyIcon className="h-4 w-4" />
              <span className="sr-only">Toggle currency settings</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{CURRENCY_NAMES[selectedCurrency]} • {currencyFormat === 'whole' ? 'Whole Numbers' : 'With Decimals'}</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Currency Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">Currency</span>
        </div>
        <DropdownMenuRadioGroup value={selectedCurrency} onValueChange={handleCurrencyChange}>
          <DropdownMenuRadioItem value="USD">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">US Dollar (USD)</span>
              </div>
              <span className="text-xs text-muted-foreground">1.00</span>
            </div>
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="EUR">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                <span className="font-medium">Euro (EUR)</span>
              </div>
              <span className="text-xs text-muted-foreground">{exchangeRates.EUR.toFixed(4)}</span>
            </div>
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="GBP">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <PoundSterling className="h-4 w-4" />
                <span className="font-medium">British Pound (GBP)</span>
              </div>
              <span className="text-xs text-muted-foreground">{exchangeRates.GBP.toFixed(4)}</span>
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">Display Format</span>
        </div>
        <DropdownMenuRadioGroup value={currencyFormat} onValueChange={handleFormatChange}>
          <DropdownMenuRadioItem value="whole">
            <div className="flex flex-col">
              <span className="font-medium">Whole Numbers</span>
              <span className="text-xs text-muted-foreground">
                {selectedCurrency === 'EUR' ? '€1.234.567' : selectedCurrency === 'GBP' ? '£1,234,567' : '$1,234,567'}
              </span>
            </div>
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="decimal">
            <div className="flex flex-col">
              <span className="font-medium">With Decimals</span>
              <span className="text-xs text-muted-foreground">
                {selectedCurrency === 'EUR' ? '€1.234.567,00' : selectedCurrency === 'GBP' ? '£1,234,567.00' : '$1,234,567.00'}
              </span>
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Live exchange rates • Updates hourly
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
