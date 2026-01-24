import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { Settings, HelpCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

export function SidebarFooterContent() {
  const { open } = useSidebar();

  return (
    <div className={cn(
      "flex gap-2",
      !open && "flex-col items-center"
    )}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className={cn(
              open && "flex-1"
            )}
          >
            <NavLink to="/settings" className={cn(
              "flex items-center",
              open && "justify-start gap-2"
            )}>
              <Settings className="h-4 w-4" />
              {open && <span>Settings</span>}
            </NavLink>
          </Button>
        </TooltipTrigger>
        {!open && <TooltipContent side="right">Settings</TooltipContent>}
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className={cn(
              open && "flex-1"
            )}
          >
            <NavLink to="/help" className={cn(
              "flex items-center",
              open && "justify-start gap-2"
            )}>
              <HelpCircle className="h-4 w-4" />
              {open && <span>Help Center</span>}
            </NavLink>
          </Button>
        </TooltipTrigger>
        {!open && <TooltipContent side="right">Help Center</TooltipContent>}
      </Tooltip>
    </div>
  );
}
