import { ReactNode } from "react";
import { Permission } from "@/shared/types/employerUser";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Lock, PackageX } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface PermissionGateWithModulesProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  requiredModule?: 'ats' | 'hrms' | 'both';
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
}

export function PermissionGateWithModules({ 
  children, 
  permission, 
  permissions,
  requireAll = false,
  requiredModule,
  fallback,
  showUpgradePrompt = false,
  onUpgrade,
}: PermissionGateWithModulesProps) {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Check module availability
  let moduleEnabled = true;
  let missingModule: string | null = null;

  if (requiredModule) {
    if (requiredModule === 'ats' && !user.modules.atsEnabled) {
      moduleEnabled = false;
      missingModule = 'ATS';
    } else if (requiredModule === 'hrms' && !user.modules.hrmsEnabled) {
      moduleEnabled = false;
      missingModule = 'HRMS';
    } else if (requiredModule === 'both' && (!user.modules.atsEnabled || !user.modules.hrmsEnabled)) {
      moduleEnabled = false;
      missingModule = 'ATS and HRMS';
    }
  }

  // Check permission
  let hasAccess = true;
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // If module is not enabled, show module upgrade prompt
  if (!moduleEnabled) {
    if (showUpgradePrompt) {
      return (
        <Alert className="border-warning bg-warning/10">
          <PackageX className="h-4 w-4" />
          <AlertTitle>Module Not Enabled</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              This feature requires the {missingModule} module to be enabled for your organization.
            </p>
            {onUpgrade && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onUpgrade}
                className="mt-2"
              >
                Upgrade Plan
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  // If user doesn't have permission, show permission denied
  if (!hasAccess) {
    if (showUpgradePrompt) {
      return (
        <Alert className="border-destructive bg-destructive/10">
          <Lock className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this feature. Please contact your administrator.
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
