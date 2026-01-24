import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Clock } from "lucide-react";
import { saveAttendanceRecord } from "@/shared/lib/attendanceStorage";
import { useToast } from "@/shared/hooks/use-toast";

interface ClockInOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ClockInOutDialog({ open, onOpenChange, onSuccess }: ClockInOutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleClockIn = async () => {
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const shiftStartTime = new Date();
      shiftStartTime.setHours(9, 0, 0, 0);
      
      const lateMinutes = new Date(now) > shiftStartTime 
        ? Math.floor((new Date(now).getTime() - shiftStartTime.getTime()) / 60000)
        : 0;

      saveAttendanceRecord({
        employeeId: 'emp1',
        employeeName: 'John Doe',
        date: new Date().toISOString().split('T')[0],
        shiftId: '1',
        shiftName: 'Morning Shift',
        checkIn: now,
        status: lateMinutes > 15 ? 'late' : 'present',
        workHours: 0,
        overtimeHours: 0,
        lateMinutes,
        earlyDepartureMinutes: 0,
      });

      toast({
        title: "Clocked In",
        description: `Check-in recorded at ${new Date(now).toLocaleTimeString()}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record check-in",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, we'd update the existing record
      toast({
        title: "Clocked Out",
        description: `Check-out recorded at ${new Date().toLocaleTimeString()}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record check-out",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Clock In/Out
          </DialogTitle>
          <DialogDescription>
            Record your attendance for today
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{new Date().toLocaleTimeString()}</p>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleClockOut}
            disabled={isSubmitting}
          >
            Clock Out
          </Button>
          <Button
            onClick={handleClockIn}
            disabled={isSubmitting}
          >
            Clock In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
