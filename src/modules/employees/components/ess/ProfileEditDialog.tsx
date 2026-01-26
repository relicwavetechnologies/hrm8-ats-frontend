import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { profileEditSchema, type ProfileEditFormData } from "@/schemas/employeeSchemas";
import { getEmployeeById, saveEmployee } from "@/shared/lib/employeeStorage";
import { toast } from "sonner";
import { useState } from "react";
import { X, Plus } from "lucide-react";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  onSuccess?: () => void;
}

export function ProfileEditDialog({ open, onOpenChange, employeeId, onSuccess }: ProfileEditDialogProps) {
  const employee = getEmployeeById(employeeId);
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>>([{ name: "", relationship: "", phone: "", email: "" }]);

  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: employee?.firstName || "",
      middleName: "",
      lastName: employee?.lastName || "",
      email: employee?.email || "",
      phone: employee?.phone || "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
      },
      emergencyContacts: [{ name: "", relationship: "", phone: "", email: "" }],
    },
  });

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: "", relationship: "", phone: "", email: "" }]);
  };

  const removeEmergencyContact = (index: number) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    setEmergencyContacts(updated);
    form.setValue("emergencyContacts", updated);
  };

  const onSubmit = (data: ProfileEditFormData) => {
    try {
      if (!employee) {
        toast.error("Employee not found");
        return;
      }

      saveEmployee({
        ...employee,
        firstName: data.firstName,
        lastName: `${data.middleName ? data.middleName + " " : ""}${data.lastName}`,
        email: data.email,
        phone: data.phone,
      });

      toast.success("Profile updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your personal information</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="middleName">Middle Name</Label>
              <Input id="middleName" {...form.register("middleName")} />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} placeholder="(555) 123-4567" />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Address</h3>
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input id="street" {...form.register("address.street")} placeholder="123 Main St" />
              {form.formState.errors.address?.street && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.address.street.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" {...form.register("address.city")} />
                {form.formState.errors.address?.city && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.address.city.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" {...form.register("address.state")} placeholder="CA" maxLength={2} />
                {form.formState.errors.address?.state && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.address.state.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input id="zipCode" {...form.register("address.zipCode")} placeholder="12345" />
                {form.formState.errors.address?.zipCode && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.address.zipCode.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Emergency Contacts</h3>
              <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                <Plus className="h-4 w-4 mr-1" /> Add Contact
              </Button>
            </div>

            {emergencyContacts.map((contact, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Contact {index + 1}</h4>
                  {emergencyContacts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmergencyContact(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      {...form.register(`emergencyContacts.${index}.name`)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label>Relationship</Label>
                    <Input
                      {...form.register(`emergencyContacts.${index}.relationship`)}
                      placeholder="Spouse, Parent, etc."
                    />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input
                      {...form.register(`emergencyContacts.${index}.phone`)}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label>Email (Optional)</Label>
                    <Input
                      type="email"
                      {...form.register(`emergencyContacts.${index}.email`)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>
            ))}
            {form.formState.errors.emergencyContacts && (
              <p className="text-sm text-destructive">{form.formState.errors.emergencyContacts.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
