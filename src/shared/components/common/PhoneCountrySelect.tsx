import { useMemo, useState } from 'react';
import countriesData from 'world-countries';

import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/utils';

interface PhoneCountrySelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface CountryOption {
  name: string;
  code: string;
  dialCode: string;
  flag?: string;
}

const buildCountryOptions = (): CountryOption[] => {
  return countriesData
    .map((country) => {
      const dialCode =
        country.idd?.root && country.idd?.suffixes?.length
          ? `${country.idd.root}${country.idd.suffixes[0]}`
          : null;

      if (!dialCode) {
        return null;
      }

      return {
        name: country.name.common,
        code: country.cca2 || country.cca3,
        dialCode,
        flag: country.flag,
      };
    })
    .filter((country): country is CountryOption => Boolean(country))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export function PhoneCountrySelect({
  value,
  onChange,
  placeholder = 'Select country code',
  className,
}: PhoneCountrySelectProps) {
  const [open, setOpen] = useState(false);

  const countryOptions = useMemo(() => buildCountryOptions(), []);
  const selected = countryOptions.find((country) => country.dialCode === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !selected && 'text-muted-foreground',
            className
          )}
        >
          {selected ? (
            <span className="flex w-full items-center gap-2 truncate">
              <span>{selected.flag}</span>
              <span className="truncate">{selected.name}</span>
              <span className="ml-auto text-muted-foreground">{selected.dialCode}</span>
            </span>
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px]" align="start">
        <Command>
          <CommandInput placeholder="Search countries..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {countryOptions.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.dialCode}`}
                  onSelect={() => {
                    onChange(country.dialCode);
                    setOpen(false);
                  }}
                >
                  <span className="mr-2">{country.flag}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-muted-foreground">{country.dialCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}




