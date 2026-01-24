import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar as CalendarIcon,
  DollarSign,
  Info,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { getAllConsultants } from '@/shared/lib/consultantStorage';
import { assignConsultantToRPO, checkConsultantAvailability } from '@/shared/lib/rpoConsultantAssignmentUtils';
import type { Consultant } from '@/shared/types/consultant';
import type { ServiceProject } from '@/shared/types/recruitmentService';
import { toast } from 'sonner';

interface RPOConsultantAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: ServiceProject;
  onAssignmentComplete: () => void;
}

interface DraggableConsultantProps {
  consultant: Consultant;
  availability: ReturnType<typeof checkConsultantAvailability>;
}

function DraggableConsultant({ consultant, availability }: DraggableConsultantProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: consultant.id,
    data: { consultant, availability },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-3 p-3 border rounded-lg bg-background cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-50",
        !availability.available && "opacity-60"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={consultant.photo} />
        <AvatarFallback>
          {consultant.firstName[0]}{consultant.lastName[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {consultant.firstName} {consultant.lastName}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {consultant.type.replace('-', ' ')}
        </p>
      </div>
      <div className="text-right">
        <Badge variant={availability.available ? 'default' : 'secondary'}>
          {availability.currentAssignments}/{availability.maxCapacity}
        </Badge>
        {!availability.available && (
          <p className="text-xs text-warning mt-1">At capacity</p>
        )}
      </div>
    </div>
  );
}

export function RPOConsultantAssignmentDialog({
  open,
  onOpenChange,
  contract,
  onAssignmentComplete,
}: RPOConsultantAssignmentDialogProps) {
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [monthlyRate, setMonthlyRate] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    contract.rpoEndDate ? new Date(contract.rpoEndDate) : undefined
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConsultant, setActiveConsultant] = useState<string | null>(null);

  const consultants = useMemo(() => {
    const all = getAllConsultants().filter(c => c.status === 'active');
    if (!searchQuery) return all;
    
    const query = searchQuery.toLowerCase();
    return all.filter(c =>
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.specialization.some(s => s.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const consultantAvailability = useMemo(() => {
    const map = new Map();
    consultants.forEach(c => {
      const availability = checkConsultantAvailability(
        c.id,
        startDate.toISOString(),
        endDate?.toISOString()
      );
      map.set(c.id, availability);
    });
    return map;
  }, [consultants, startDate, endDate]);

  const selectedAvailability = selectedConsultant
    ? consultantAvailability.get(selectedConsultant.id)
    : null;

  const getGuideRate = (consultant: Consultant) => {
    const rates: Record<string, number> = {
      'recruiter': 5000,
      'sales-rep': 4500,
      '360-consultant': 6000,
      'industry-partner': 5500,
    };
    return rates[consultant.type] || 5000;
  };

  const { setNodeRef } = useDroppable({
    id: 'assignment-zone',
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'assignment-zone') {
      const consultant = consultants.find(c => c.id === active.id);
      if (consultant) {
        setSelectedConsultant(consultant);
        setMonthlyRate(getGuideRate(consultant).toString());
      }
    }
  };

  const handleAssign = async () => {
    if (!selectedConsultant) {
      toast.error('Please select a consultant');
      return;
    }

    const rate = parseFloat(monthlyRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error('Please enter a valid monthly rate');
      return;
    }

    const availability = consultantAvailability.get(selectedConsultant.id);
    if (!availability?.available) {
      toast.error('Consultant is not available for the selected dates');
      return;
    }

    const result = assignConsultantToRPO(contract.id, {
      consultantId: selectedConsultant.id,
      consultantName: `${selectedConsultant.firstName} ${selectedConsultant.lastName}`,
      monthlyRate: rate,
      startDate: startDate.toISOString(),
      endDate: endDate?.toISOString(),
      isActive: true,
    });

    if (result) {
      toast.success('Consultant assigned successfully');
      onAssignmentComplete();
      onOpenChange(false);
      // Reset form
      setSelectedConsultant(null);
      setMonthlyRate('');
      setStartDate(new Date());
    } else {
      toast.error('Failed to assign consultant');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Assign Consultant to RPO Contract</DialogTitle>
          <DialogDescription>
            Drag and drop a consultant to the assignment zone or click to select. Validate capacity and negotiate rates.
          </DialogDescription>
        </DialogHeader>

        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 gap-6">
            {/* Available Consultants */}
            <div className="space-y-4">
              <div>
                <Label>Available Consultants</Label>
                <Input
                  placeholder="Search by name or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-2"
                />
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {consultants.map((consultant) => (
                    <DraggableConsultant
                      key={consultant.id}
                      consultant={consultant}
                      availability={consultantAvailability.get(consultant.id)!}
                    />
                  ))}
                  {consultants.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No consultants found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Assignment Zone */}
            <div className="space-y-4">
              <Label>Assignment Details</Label>
              
              {/* Drop Zone */}
              <div
                ref={setNodeRef}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 min-h-[120px] flex items-center justify-center transition-colors",
                  selectedConsultant ? "border-primary bg-primary/5" : "border-muted-foreground/30"
                )}
              >
                {selectedConsultant ? (
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedConsultant.photo} />
                        <AvatarFallback>
                          {selectedConsultant.firstName[0]}{selectedConsultant.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {selectedConsultant.firstName} {selectedConsultant.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {selectedConsultant.type.replace('-', ' ')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedConsultant(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Availability Check */}
                    {selectedAvailability && (
                      <Alert variant={selectedAvailability.available ? 'default' : 'destructive'}>
                        <AlertDescription className="flex items-center gap-2">
                          {selectedAvailability.available ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Available ({selectedAvailability.currentAssignments}/{selectedAvailability.maxCapacity} assignments)
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4" />
                              At capacity or has conflicting assignments
                            </>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Conflicting Contracts Warning */}
                    {selectedAvailability?.conflictingContracts && selectedAvailability.conflictingContracts.length > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-semibold mb-1">Date Conflicts Detected:</p>
                          <ul className="text-xs space-y-1">
                            {selectedAvailability.conflictingContracts.map((conflict, i) => (
                              <li key={i}>
                                {conflict.contractName} ({format(new Date(conflict.startDate), 'MMM d, yyyy')} - 
                                {conflict.endDate ? format(new Date(conflict.endDate), 'MMM d, yyyy') : 'Ongoing'})
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Drag a consultant here or click to select</p>
                  </div>
                )}
              </div>

              {/* Assignment Form */}
              {selectedConsultant && (
                <div className="space-y-4">
                  {/* Monthly Rate */}
                  <div>
                    <Label htmlFor="monthlyRate">Monthly Rate</Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="monthlyRate"
                        type="number"
                        value={monthlyRate}
                        onChange={(e) => setMonthlyRate(e.target.value)}
                        className="pl-9"
                        placeholder="Enter monthly rate"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Guide rate: ${getGuideRate(selectedConsultant).toLocaleString()}/month
                    </p>
                  </div>

                  {/* Start Date */}
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div>
                    <Label>End Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleAssign}
                      disabled={!selectedAvailability?.available}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Assign Consultant
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedConsultant(null)}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeConsultant && (
              <div className="p-3 border rounded-lg bg-background shadow-lg">
                <p className="font-medium">Dragging consultant...</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </DialogContent>
    </Dialog>
  );
}
