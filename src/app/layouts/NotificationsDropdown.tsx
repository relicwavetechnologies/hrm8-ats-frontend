// TODO: Extract NotificationBell from notifications module (Phase 6.2)
// import { NotificationBell } from "@/modules/notifications/components/NotificationBell";
import { Bell } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function NotificationsDropdown() {
  // Temporary placeholder until notifications module is extracted
  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
    </Button>
  );
}
