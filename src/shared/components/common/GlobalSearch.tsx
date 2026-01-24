import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Search, 
  Users, 
  Briefcase, 
  Building2, 
  UserCheck, 
  Calendar,
  Target,
  FileText,
  GraduationCap,
  UserPlus,
} from "lucide-react";
import { getCandidates } from "@/shared/lib/mockCandidateStorage";
import { getEmployees } from "@/shared/lib/employeeStorage";
import { getJobs } from "@/shared/lib/mockJobStorage";
import { getPerformanceGoals, getPerformanceReviews } from "@/shared/lib/performanceStorage";

interface SearchResult {
  id: string;
  type: 'candidate' | 'employee' | 'job' | 'goal' | 'review';
  title: string;
  subtitle: string;
  icon: any;
  url: string;
  badge?: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    // Listen for custom event from header
    const handleSearchClick = () => setOpen(true);
    document.addEventListener("open-command-palette", handleSearchClick);
    document.addEventListener("keydown", down);

    return () => {
      document.removeEventListener("open-command-palette", handleSearchClick);
      document.removeEventListener("keydown", down);
    };
  }, []);

  const results = useMemo(() => {
    if (!search) return [];

    const searchLower = search.toLowerCase();
    const allResults: SearchResult[] = [];

    // Search candidates
    const candidates = getCandidates();
    candidates
      .filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.position.toLowerCase().includes(searchLower)
      )
      .slice(0, 5)
      .forEach(c => {
        allResults.push({
          id: c.id,
          type: 'candidate',
          title: c.name,
          subtitle: c.position,
          icon: Users,
          url: `/candidates/${c.id}`,
          badge: c.status,
        });
      });

    // Search employees
    const employees = getEmployees();
    employees
      .filter(e => 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchLower) ||
        e.email.toLowerCase().includes(searchLower) ||
        e.jobTitle.toLowerCase().includes(searchLower) ||
        e.employeeId.toLowerCase().includes(searchLower)
      )
      .slice(0, 5)
      .forEach(e => {
        allResults.push({
          id: e.id,
          type: 'employee',
          title: `${e.firstName} ${e.lastName}`,
          subtitle: e.jobTitle,
          icon: UserCheck,
          url: `/employees/${e.id}`,
          badge: e.status,
        });
      });

    // Search jobs
    const jobs = getJobs();
    jobs
      .filter(j => 
        j.title.toLowerCase().includes(searchLower) ||
        j.department.toLowerCase().includes(searchLower) ||
        j.location.toLowerCase().includes(searchLower)
      )
      .slice(0, 5)
      .forEach(j => {
        allResults.push({
          id: j.id,
          type: 'job',
          title: j.title,
          subtitle: `${j.department} • ${j.location}`,
          icon: Briefcase,
          url: `/jobs/${j.id}`,
          badge: j.status,
        });
      });

    // Search performance goals
    const goals = getPerformanceGoals();
    goals
      .filter(g => 
        g.title.toLowerCase().includes(searchLower) ||
        g.description.toLowerCase().includes(searchLower)
      )
      .slice(0, 3)
      .forEach(g => {
        allResults.push({
          id: g.id,
          type: 'goal',
          title: g.title,
          subtitle: `Goal • ${g.category}`,
          icon: Target,
          url: `/performance/goals/${g.id}`,
          badge: g.status,
        });
      });

    // Search reviews
    const reviews = getPerformanceReviews();
    reviews
      .filter(r => 
        r.employeeName.toLowerCase().includes(searchLower) ||
        r.reviewerName.toLowerCase().includes(searchLower)
      )
      .slice(0, 3)
      .forEach(r => {
        allResults.push({
          id: r.id,
          type: 'review',
          title: r.employeeName,
          subtitle: `Review by ${r.reviewerName}`,
          icon: FileText,
          url: `/performance/reviews/${r.id}`,
          badge: r.status,
        });
      });

    return allResults;
  }, [search]);

  const handleSelect = (url: string) => {
    setOpen(false);
    navigate(url);
    setSearch("");
  };

  const getGroupedResults = () => {
    const grouped: Record<string, SearchResult[]> = {
      candidates: [],
      employees: [],
      jobs: [],
      performance: [],
    };

    results.forEach(result => {
      if (result.type === 'candidate') grouped.candidates.push(result);
      else if (result.type === 'employee') grouped.employees.push(result);
      else if (result.type === 'job') grouped.jobs.push(result);
      else if (result.type === 'goal' || result.type === 'review') grouped.performance.push(result);
    });

    return grouped;
  };

  const grouped = getGroupedResults();

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search candidates, employees, jobs, goals..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {grouped.candidates.length > 0 && (
          <>
            <CommandGroup heading="Candidates">
              {grouped.candidates.map((result) => {
                const Icon = result.icon;
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result.url)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    {result.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {result.badge}
                      </Badge>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {grouped.employees.length > 0 && (
          <>
            <CommandGroup heading="Employees">
              {grouped.employees.map((result) => {
                const Icon = result.icon;
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result.url)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    {result.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {result.badge}
                      </Badge>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {grouped.jobs.length > 0 && (
          <>
            <CommandGroup heading="Jobs">
              {grouped.jobs.map((result) => {
                const Icon = result.icon;
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result.url)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    {result.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {result.badge}
                      </Badge>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {grouped.performance.length > 0 && (
          <CommandGroup heading="Performance">
            {grouped.performance.map((result) => {
              const Icon = result.icon;
              return (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result.url)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {result.subtitle}
                    </p>
                  </div>
                  {result.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {result.badge}
                    </Badge>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {results.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Showing {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
