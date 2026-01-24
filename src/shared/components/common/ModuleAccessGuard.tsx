import { ReactNode } from "react";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { PackageX, Sparkles } from "lucide-react";

interface ModuleAccessGuardProps {
  children: ReactNode;
  requiredModule: 'ats' | 'hrms';
  moduleName?: string;
  onUpgrade?: () => void;
}

/**
 * Guard component that blocks access to content when required module is not enabled
 * Shows an upgrade card when module is disabled
 */
export function ModuleAccessGuard({ 
  children, 
  requiredModule,
  moduleName,
  onUpgrade,
}: ModuleAccessGuardProps) {
  const { user } = usePermissions();

  const isModuleEnabled = requiredModule === 'ats' 
    ? user.modules.atsEnabled 
    : user.modules.hrmsEnabled;

  if (!isModuleEnabled) {
    const displayName = moduleName || (requiredModule === 'ats' ? 'ATS' : 'HRMS');
    
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="max-w-lg border-2 border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <PackageX className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">
              {displayName} Module Not Enabled
            </CardTitle>
            <CardDescription className="text-base">
              This feature is part of the {displayName} module. 
              Enable it to unlock powerful capabilities for your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <strong>Enhanced Features:</strong> Access advanced tools and workflows
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <strong>Better Insights:</strong> Get detailed analytics and reporting
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <strong>Streamlined Operations:</strong> Automate and optimize your processes
                </div>
              </div>
            </div>
            {onUpgrade && (
              <Button 
                onClick={onUpgrade} 
                className="w-full"
                size="lg"
              >
                Enable {displayName} Module
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
