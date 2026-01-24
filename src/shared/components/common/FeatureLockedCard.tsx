import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureLockedCardProps {
  featureName: string;
  description?: string;
  requiredTier?: string;
  className?: string;
}

export function FeatureLockedCard({ 
  featureName, 
  description = "This feature is not available in your current plan",
  requiredTier,
  className 
}: FeatureLockedCardProps) {
  const navigate = useNavigate();

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">{featureName}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {requiredTier && (
          <p className="text-sm text-muted-foreground">
            Available in <span className="font-semibold">{requiredTier}</span> and higher
          </p>
        )}
        <Button 
          onClick={() => navigate('/settings?tab=subscription')}
          className="w-full max-w-xs"
        >
          <Zap className="mr-2 h-4 w-4" />
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  );
}
