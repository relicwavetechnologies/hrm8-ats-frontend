import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet";

interface JobEmailHubDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
}

export function JobEmailHubDrawer({ open, onOpenChange, jobId }: JobEmailHubDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Email Hub</SheetTitle>
          <SheetDescription>
            Manage emails for Job ID: {jobId}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Email hub functionality coming soon.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
