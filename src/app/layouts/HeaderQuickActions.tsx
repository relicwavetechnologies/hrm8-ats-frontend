import { Plus, UserPlus, Calendar } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";

export function HeaderQuickActions() {
  const navigate = useNavigate();

  return (
    <>
      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Primary Action - Post Job */}
      <div className="hidden md:flex items-center">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              onClick={() => navigate('/ats/jobs?action=create')}
              className={cn(
                // Sleeker design with less rounded corners
                "rounded-lg shadow-sm hover:shadow-md transition-all",
                // Show text on large screens, icon-only on medium
                "lg:px-3.5 lg:gap-2",
                "md:h-9 md:w-9 md:p-0 lg:h-9 lg:w-auto"
              )}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline font-medium">Post Job</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="lg:hidden">
            <p>Post Job</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2 hidden lg:block" />

      {/* Secondary Quick Actions */}
      <div className="hidden md:flex items-center gap-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/candidates?action=create')}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Add Candidate</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/calendar')}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Schedule Interview</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}
