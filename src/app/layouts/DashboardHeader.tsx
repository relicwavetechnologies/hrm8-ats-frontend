import { SidebarTrigger, useSidebar } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { Search, Command, MessageSquare, MoreVertical, UserPlus, Calendar, DollarSign, Moon, Sun, Bell } from "lucide-react";
import { UserNav } from "./UserNav";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Breadcrumbs } from "@/shared/components/common/Breadcrumbs";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useCurrencyFormat } from "@/app/providers/CurrencyFormatContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';

export function DashboardHeader() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { selectedCurrency, setSelectedCurrency } = useCurrencyFormat();
  const { open: sidebarOpen } = useSidebar();
  const navigate = useNavigate();

  const handleSearchClick = () => {
    const event = new CustomEvent('open-command-palette');
    window.dispatchEvent(event);
  };

  const handleAiToggle = () => {
    const event = new CustomEvent('toggle-ai-panel');
    window.dispatchEvent(event);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleCurrency = () => {
    // Cycle through USD -> EUR -> GBP -> USD
    const currencies = ['USD', 'EUR', 'GBP'] as const;
    const currentIndex = currencies.indexOf(selectedCurrency);
    const nextIndex = (currentIndex + 1) % currencies.length;
    setSelectedCurrency(currencies[nextIndex]);
  };

  // Listen for AI panel state changes
  useEffect(() => {
    const handleToggle = () => {
      setIsAiOpen((prev) => !prev);
    };

    window.addEventListener('toggle-ai-panel', handleToggle);
    return () => window.removeEventListener('toggle-ai-panel', handleToggle);
  }, []);

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full shadow-sm">
        {/* Thin top accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-primary/60 via-primary/80 to-violet-500/60" />

        {/* Single unified row */}
        <div className="relative flex h-14 items-center gap-3 px-4 md:px-6 bg-background/95 backdrop-blur-xl border-b border-border/50">
          {/* Left: Sidebar trigger + Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <SidebarTrigger className="shrink-0 hover:bg-accent/60 transition-colors rounded-lg" />
            <Separator orientation="vertical" className="h-5 shrink-0 bg-border/60" />
            <div className="hidden sm:block min-w-0 overflow-hidden">
              <Breadcrumbs />
            </div>
          </div>

          {/* Center spacer */}
          <div className="flex-1" />

          {/* Center/Right: Search bar */}
          <div
            className="relative max-w-xs w-full hidden md:block cursor-pointer group"
            onClick={handleSearchClick}
          >
            <div className="flex items-center gap-2 px-3.5 h-9 rounded-full bg-muted border border-border hover:border-primary/50 hover:bg-accent transition-all duration-200 group-hover:shadow-sm">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground truncate">Search...</span>
              <Badge
                variant="outline"
                className="ml-auto text-[10px] px-1.5 py-0 font-mono opacity-70 group-hover:opacity-100 transition-opacity flex items-center bg-background border-border shrink-0"
              >
                <Command className="h-2.5 w-2.5 mr-0.5" />
                K
              </Badge>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">

            {/* Post Job Button */}
            <Button
              variant="default"
              onClick={() => navigate('/ats/jobs?action=create')}
              className="h-9 px-3.5 gap-2 rounded-lg shadow-sm hover:shadow-md transition-all hidden md:flex"
            >
              <span className="text-[24px] leading-none">+</span>
              <span className="font-medium">Post Job</span>
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/candidates?action=create')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Candidate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/calendar')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Settings</DropdownMenuLabel>

                <DropdownMenuItem onClick={toggleCurrency}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Currency: {selectedCurrency}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  Theme: {theme === "dark" ? "Light" : "Dark"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* AI Button */}
            <Button
              type="button"
              variant={isAiOpen ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={handleAiToggle}
              title="Toggle AI Assistant (Cmd/Ctrl + Shift + K)"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            {/* Notifications - Keep separate */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Bell className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-5 mx-1 bg-border/40 hidden md:block" />
            <UserNav />
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
