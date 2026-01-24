import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { createOffer } from "@/shared/lib/offerService";
import { useToast } from "@/shared/hooks/use-toast";

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId?: string;
  candidateId?: string;
}

export function CreateOfferDialog({
  open,
  onOpenChange,
  jobId,
  candidateId,
}: CreateOfferDialogProps) {
  const { toast } = useToast();
  const [salary, setSalary] = useState("");
  const [salaryPeriod, setSalaryPeriod] = useState<
    "hourly" | "daily" | "weekly" | "monthly" | "annual"
  >("annual");
  const [startDate, setStartDate] = useState("");
  const [additionalTerms, setAdditionalTerms] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!salary || !startDate) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createOffer({
      jobId: jobId || "1",
      jobTitle: "Sample Job",
      candidateId: candidateId || "c1",
      candidateName: "Sample Candidate",
      candidateEmail: "candidate@email.com",
      salary: parseInt(salary),
      currency: "USD",
      salaryPeriod,
      startDate,
      benefits: [
        "Health Insurance",
        "401(k) Matching",
        "Unlimited PTO",
        "Remote Work Options",
      ],
      additionalTerms,
      status: "draft",
      approvals: [],
      documents: [],
      createdBy: "u1",
      createdByName: "Admin User",
    });

    toast({
      title: "Offer created",
      description: "The job offer has been created successfully.",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Job Offer</DialogTitle>
          <DialogDescription>
            Create a new job offer for a candidate
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salary *</Label>
              <Input
                id="salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g., 120000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryPeriod">Period</Label>
              <Select
                value={salaryPeriod}
                onValueChange={(value: any) => setSalaryPeriod(value)}
              >
                <SelectTrigger id="salaryPeriod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalTerms">Additional Terms (Optional)</Label>
            <Textarea
              id="additionalTerms"
              value={additionalTerms}
              onChange={(e) => setAdditionalTerms(e.target.value)}
              placeholder="Add any additional terms or conditions"
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Offer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
