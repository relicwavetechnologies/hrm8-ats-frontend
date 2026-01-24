import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { SalesSidebar } from "./SalesSidebar";
import { CommandPalette } from "@/shared/components/common/CommandPalette";
import { KeyboardShortcutsDialog } from "@/shared/components/common/KeyboardShortcutsDialog";
import { useNavigationShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { useSidebarState } from "@/shared/hooks/useSidebarState";
import { ConsultantUserNav } from "./ConsultantUserNav";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { NotificationBell } from "@/modules/notifications/components/NotificationBell";
import { useConsultantAuth } from "@/app/AuthProvider";
import { Button } from "@/shared/components/ui/button";
import { ArrowRightLeft } from "lucide-react";
import { Link } from "react-router-dom";

function PortalSwitchButton() {
  const { consultant } = useConsultantAuth();

  if (consultant?.role !== 'CONSULTANT_360') {
    return null;
  }

  return (
    <Button
      asChild
      size="sm"
      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
    >
      <Link to="/consultant/dashboard">
        <ArrowRightLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Switch to Consultant</span>
      </Link>
    </Button>
  );
}

export function SalesLayout() {
  const { open, setOpen } = useSidebarState("sales");
  useNavigationShortcuts();

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div className="min-h-screen flex w-full">
        <SalesSidebar />
        <SidebarInset className="flex-1">
          {/* Global Navbar */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="flex flex-1 items-center justify-end gap-4">
              <PortalSwitchButton />
              <NotificationBell />
              <ConsultantUserNav />
            </div>
          </header>

          {/* Main Content */}
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
