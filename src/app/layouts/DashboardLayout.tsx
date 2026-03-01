import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { CommandPalette } from "@/shared/components/common/CommandPalette";
import { KeyboardShortcutsDialog } from "@/shared/components/dialogs/KeyboardShortcutsDialog";
import { useNavigationShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { useSidebarState } from "@/shared/hooks/useSidebarState";
import { CustomResizablePanel } from "@/shared/components/ui/custom-resizable";
import { AiAssistantSidebar } from "@/shared/components/common/AiAssistantSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { useState, useCallback, useEffect } from "react";
import { GlobalNotificationHandler } from "./GlobalNotificationHandler";

export function DashboardLayout() {
  const { open, setOpen } = useSidebarState();
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  useNavigationShortcuts();

  const toggleAiPanel = useCallback(() => {
    setIsAiPanelOpen((prev) => !prev);
  }, []);

  // Global keyboard shortcut for AI panel (Cmd+Shift+K)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Cmd+Shift+K or Ctrl+Shift+K to toggle AI panel
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsAiPanelOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Make toggle function available globally
  useEffect(() => {
    const handleToggleAi = () => {
      setIsAiPanelOpen((prev) => !prev);
    };
    const handleOpenAi = () => {
      setIsAiPanelOpen(true);
    };

    window.addEventListener('toggle-ai-panel', handleToggleAi);
    window.addEventListener('open-ai-panel', handleOpenAi);
    return () => {
      window.removeEventListener('toggle-ai-panel', handleToggleAi);
      window.removeEventListener('open-ai-panel', handleOpenAi);
    };
  }, []);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <GlobalNotificationHandler />
      <div className="flex h-svh w-full overflow-hidden">
        <AppSidebar />

        <SidebarInset className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header */}
          <DashboardHeader />

          {/* Main Content */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <main className="flex-1 min-h-0 overflow-y-auto">
              <Outlet />
            </main>

            {/* AI Assistant Sidebar */}
            <CustomResizablePanel
              isOpen={isAiPanelOpen}
              defaultWidth={500}
              minWidth={320}
              maxWidthPercent={40}
            >
              <AiAssistantSidebar
                streamEndpoint="/api/assistant/chat/stream"
              />
            </CustomResizablePanel>
          </div>
        </SidebarInset>
      </div>

      <CommandPalette />
      <KeyboardShortcutsDialog />
    </SidebarProvider>
  );
}
