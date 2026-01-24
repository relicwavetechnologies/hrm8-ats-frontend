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

interface LocationSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface LocationOption {
  name: string;
  code: string;
  flag?: string;
}

const buildLocationOptions = (): LocationOption[] => {
  return countriesData
    .map((country) => ({
      name: country.name.common,
      code: country.cca2 || country.cca3,
      flag: country.flag,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export function LocationSelect({
  value,
  onChange,
  placeholder = 'Select location',
  className,
}: LocationSelectProps) {
  const [open, setOpen] = useState(false);

  const locationOptions = useMemo(() => buildLocationOptions(), []);
  const selected = locationOptions.find((location) => location.name === value);

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
            </span>
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px]" align="start">
        <Command>
          <CommandInput placeholder="Search locations..." />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {locationOptions.map((location) => (
                <CommandItem
                  key={location.code}
                  value={location.name}
                  onSelect={() => {
                    onChange(location.name);
                    setOpen(false);
                  }}
                >
                  <span className="mr-2">{location.flag}</span>
                  <span className="flex-1 truncate">{location.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}




