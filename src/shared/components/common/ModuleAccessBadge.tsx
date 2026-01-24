import { Badge } from "@/shared/components/ui/badge";
import { Lock, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface ModuleAccessBadgeProps {
  hasAccess: boolean;
  moduleName: string;
  className?: string;
}

export function ModuleAccessBadge({ hasAccess, moduleName, className }: ModuleAccessBadgeProps) {
  if (hasAccess) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="default" className={className}>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{moduleName} is active</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={className}>
            <Lock className="h-3 w-3 mr-1" />
            Locked
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{moduleName} requires an upgrade</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
