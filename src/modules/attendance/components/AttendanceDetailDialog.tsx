import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import type { AttendanceRecord } from "@/shared/types/attendance";
import { format } from "date-fns";

interface AttendanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AttendanceRecord | null;
}

export function AttendanceDetailDialog({ open, onOpenChange, record }: AttendanceDetailDialogProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
          <DialogDescription>
            Complete attendance record information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Employee</p>
            <p className="font-medium">{record.employeeName}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{format(new Date(record.date), 'MMMM dd, yyyy')}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Shift</p>
            <p className="font-medium">{record.shiftName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Check In</p>
              <p className="font-medium">
                {record.checkIn ? format(new Date(record.checkIn), 'HH:mm') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check Out</p>
              <p className="font-medium">
                {record.checkOut ? format(new Date(record.checkOut), 'HH:mm') : 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Work Hours</p>
              <p className="font-medium">{record.workHours.toFixed(2)} hrs</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overtime</p>
              <p className="font-medium">{record.overtimeHours.toFixed(2)} hrs</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Late By</p>
              <p className="font-medium">{record.lateMinutes} min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Early Departure</p>
              <p className="font-medium">{record.earlyDepartureMinutes} min</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge
              variant={
                record.status === 'present' ? 'default' :
                record.status === 'late' ? 'secondary' :
                record.status === 'absent' ? 'destructive' : 'outline'
              }
              className="mt-1"
            >
              {record.status}
            </Badge>
          </div>

          {record.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm">{record.notes}</p>
            </div>
          )}

          {record.location && (
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="text-sm">{record.location}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
