import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/components/ui/select";
import { X, Mail, Archive, Trash2, Download, Users } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useState } from "react";

interface EmployeesBulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStatusUpdate: (status: string) => void;
  onBulkDepartmentUpdate: (department: string) => void;
  onBulkLocationUpdate: (location: string) => void;
  onBulkExport: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
}

export function EmployeesBulkActionsToolbar({ 
  selectedCount, 
  onClearSelection, 
  onBulkStatusUpdate,
  onBulkDepartmentUpdate,
  onBulkLocationUpdate,
  onBulkExport,
  onBulkArchive,
  onBulkDelete,
}: EmployeesBulkActionsToolbarProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  if (selectedCount === 0) return null;

  const handleStatusUpdate = (status: string) => {
    onBulkStatusUpdate(status);
    toast({
      title: "Status updated",
      description: `${selectedCount} employee(s) status updated successfully.`,
    });
  };

  const handleDepartmentUpdate = (department: string) => {
    onBulkDepartmentUpdate(department);
    toast({
      title: "Department updated",
      description: `${selectedCount} employee(s) department updated.`,
    });
  };

  const handleLocationUpdate = (location: string) => {
    onBulkLocationUpdate(location);
    toast({
      title: "Location updated",
      description: `${selectedCount} employee(s) location updated.`,
    });
  };

  const handleDelete = () => {
    onBulkDelete();
    setShowDeleteDialog(false);
    toast({
      title: "Employees deleted",
      description: `${selectedCount} employee(s) deleted successfully.`,
      variant: "destructive",
    });
  };

  const handleArchive = () => {
    onBulkArchive();
    setShowArchiveDialog(false);
    toast({
      title: "Employees archived",
      description: `${selectedCount} employee(s) archived successfully.`,
    });
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-primary/10 border-b border-primary/20 p-4 mb-4 rounded-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="font-semibold">
              {selectedCount} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select onValueChange={handleStatusUpdate}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
                <SelectItem value="notice-period">Notice Period</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleDepartmentUpdate}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Change Dept." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleLocationUpdate}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Change Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="San Francisco">San Francisco</SelectItem>
                <SelectItem value="London">London</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={onBulkExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchiveDialog(true)}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} employee(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected employee records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {selectedCount} employee(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Archived employees can be restored later from the archive section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
