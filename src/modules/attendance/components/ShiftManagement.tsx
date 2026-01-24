import { useState } from "react";
import { Clock, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { getShifts } from "@/shared/lib/attendanceStorage";
import type { Shift, ShiftType } from "@/shared/types/attendance";

export function ShiftManagement() {
  const shifts = getShifts();

  const getShiftTypeBadge = (type: ShiftType) => {
    const variants: Record<ShiftType, { variant: any; label: string }> = {
      morning: { variant: 'default', label: 'Morning' },
      afternoon: { variant: 'secondary', label: 'Afternoon' },
      night: { variant: 'outline', label: 'Night' },
      flexible: { variant: 'secondary', label: 'Flexible' },
    };
    return variants[type];
  };

  const getDayNames = (daysOfWeek: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOfWeek.map(d => dayNames[d]).join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage shift schedules and work hours
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Shift
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shifts.map((shift) => {
          const typeBadge = getShiftTypeBadge(shift.type);
          
          return (
            <Card key={shift.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{shift.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                    {shift.isActive ? (
                      <Badge variant="outline">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Time</p>
                    <p className="text-lg font-semibold">{shift.startTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Time</p>
                    <p className="text-lg font-semibold">{shift.endTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Break Duration</p>
                    <p className="text-lg font-semibold">{shift.breakDuration} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grace Period</p>
                    <p className="text-lg font-semibold">{shift.gracePeriod} min</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Working Days</p>
                  <p className="text-sm font-medium mt-1">{getDayNames(shift.daysOfWeek)}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {shifts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Shifts Configured</h3>
            <p className="text-muted-foreground mb-4">
              Create your first shift to start managing schedules
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Shift
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
