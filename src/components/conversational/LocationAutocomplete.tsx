import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
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

interface LocationAutocompleteProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    isParsed?: boolean;
}

// Mock locations for demo purposes - in production this would call Google Places API
const MOCK_LOCATIONS = [
    "Sydney, NSW, Australia",
    "Melbourne, VIC, Australia",
    "Brisbane, QLD, Australia",
    "Perth, WA, Australia",
    "Adelaide, SA, Australia",
    "Canberra, ACT, Australia",
    "Hobart, TAS, Australia",
    "Darwin, NT, Australia",
    "Gold Coast, QLD, Australia",
    "Newcastle, NSW, Australia",
    "Auckland, New Zealand",
    "Wellington, New Zealand",
    "Christchurch, New Zealand",
    "London, United Kingdom",
    "New York, NY, USA",
    "San Francisco, CA, USA",
    "Singapore",
    "Toronto, ON, Canada",
    "Vancouver, BC, Canada"
];

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
    value,
    onChange,
    placeholder = "Search location...",
    className,
    disabled,
    isParsed
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<string[]>(MOCK_LOCATIONS);

    // Simulate API search
    useEffect(() => {
        if (!search) {
            setOptions(MOCK_LOCATIONS);
            return;
        }

        setLoading(true);
        const timer = setTimeout(() => {
            const filtered = MOCK_LOCATIONS.filter(loc =>
                loc.toLowerCase().includes(search.toLowerCase())
            );
            // If user typed something new that's not in list, add it as a "Custom" option
            // This is important for edge cases where the API doesn't return the specific location
            if (search.length > 2 && !filtered.includes(search)) {
                filtered.unshift(search);
            }
            setOptions(filtered);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-12 text-base px-4 rounded-xl border-input bg-background hover:bg-accent hover:text-accent-foreground",
                        !value && "text-muted-foreground",
                        isParsed && "border-green-500/50 bg-green-50 dark:bg-green-950/20",
                        className
                    )}
                    disabled={disabled}
                >
                    {value ? (
                        <div className="flex items-center gap-2 truncate">
                            <MapPin className="h-4 w-4 shrink-0 opacity-50" />
                            {value}
                        </div>
                    ) : (
                        placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search city, region or country..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {loading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>No location found. Press Enter to use "{search}"</CommandEmpty>
                                <CommandGroup heading="Suggestions">
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option}
                                            value={option}
                                            onSelect={(currentValue) => {
                                                onChange(currentValue === value ? "" : currentValue);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === option ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {option}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
