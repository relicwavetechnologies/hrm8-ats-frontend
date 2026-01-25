import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { CommandPalette } from "@/shared/components/common/CommandPalette";
import { KeyboardShortcutsDialog } from "@/shared/components/dialogs/KeyboardShortcutsDialog";
import { useNavigationShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { useSidebarState } from "@/shared/hooks/useSidebarState";


import { GlobalNotificationHandler } from "./GlobalNotificationHandler";

export function DashboardLayout() {
  const { open, setOpen } = useSidebarState();
  useNavigationShortcuts();

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <GlobalNotificationHandler />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">

          <div className="min-w-0">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
      <CommandPalette />
      <KeyboardShortcutsDialog />
    </SidebarProvider>
  );
}
