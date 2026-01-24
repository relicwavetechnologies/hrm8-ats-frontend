import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { ModuleAccessGuard } from "./ModuleAccessGuard";

interface ProtectedRoutesProps {
  children?: ReactNode;
  requiredModule: 'ats' | 'hrms';
  moduleName?: string;
}

/**
 * Wrapper component for protecting route groups that require specific modules
 * Uses Outlet to render child routes when access is granted
 */
export function ProtectedRoutes({ children, requiredModule, moduleName }: ProtectedRoutesProps) {
  const handleUpgrade = () => {
    // Navigate to settings or subscription page
    window.location.href = '/settings?tab=subscription';
  };

  return (
    <ModuleAccessGuard
      requiredModule={requiredModule}
      moduleName={moduleName}
      onUpgrade={handleUpgrade}
    >
      {children || <Outlet />}
    </ModuleAccessGuard>
  );
}
