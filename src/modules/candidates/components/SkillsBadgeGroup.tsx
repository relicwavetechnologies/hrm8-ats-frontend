import { Badge } from "@/shared/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface SkillsBadgeGroupProps {
  skills: string[];
  maxVisible?: number;
  onRemove?: (skill: string) => void;
  editable?: boolean;
}

export function SkillsBadgeGroup({ 
  skills, 
  maxVisible = 3, 
  onRemove,
  editable = false 
}: SkillsBadgeGroupProps) {
  const visibleSkills = skills.slice(0, maxVisible);
  const hiddenSkills = skills.slice(maxVisible);
  const hasMore = hiddenSkills.length > 0;

  const renderSkill = (skill: string, showRemove: boolean = false) => (
    <Badge key={skill} variant="outline" className="gap-1">
      {skill}
      {showRemove && editable && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-3 w-3 p-0 hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(skill);
          }}
        >
          <X className="h-2 w-2" />
        </Button>
      )}
    </Badge>
  );

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visibleSkills.map(skill => renderSkill(skill, editable))}
      {hasMore && (
        <Popover>
          <PopoverTrigger asChild>
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
              +{hiddenSkills.length} more
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">All Skills</h4>
              <div className="flex flex-wrap gap-1">
                {skills.map(skill => renderSkill(skill, editable))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
