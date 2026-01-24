import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { ReviewSection } from "@/shared/types/performance";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (section: ReviewSection) => void;
  section?: ReviewSection | null;
}

export function AddSectionDialog({ open, onOpenChange, onSave, section }: AddSectionDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("20");

  useEffect(() => {
    if (section) {
      setTitle(section.title);
      setDescription(section.description || "");
      setWeight(section.weight.toString());
    } else {
      setTitle("");
      setDescription("");
      setWeight("20");
    }
  }, [section, open]);

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }

    const weightNum = parseInt(weight);
    if (isNaN(weightNum) || weightNum < 1 || weightNum > 100) {
      return;
    }

    const newSection: ReviewSection = {
      id: section?.id || `section-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      weight: weightNum,
      questions: section?.questions || []
    };

    onSave(newSection);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{section ? "Edit Section" : "Add Section"}</DialogTitle>
          <DialogDescription>
            {section ? "Update the section details below." : "Create a new review section with questions."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="section-title">Section Title *</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Technical Skills"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-description">Description</Label>
            <Textarea
              id="section-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this section"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-weight">Weight (%) *</Label>
            <Input
              id="section-weight"
              type="number"
              min="1"
              max="100"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="20"
            />
            <p className="text-xs text-muted-foreground">
              All section weights must add up to 100%
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !weight}>
            {section ? "Update" : "Add"} Section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
