import { Briefcase, Calendar, FileText, Star } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

interface CandidateQuickStatsProps {
  stats: {
    applications?: number;
    interviews?: number;
    lastContact?: string;
    rating?: number;
  };
}

export function CandidateQuickStats({ stats }: CandidateQuickStatsProps) {
  const statItems: StatItem[] = [
    {
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      label: 'Applications',
      value: stats.applications || 0,
    },
    {
      icon: <Briefcase className="h-4 w-4 text-muted-foreground" />,
      label: 'Interviews',
      value: stats.interviews || 0,
    },
    {
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
      label: 'Last Contact',
      value: stats.lastContact || 'Never',
    },
  ];

  if (stats.rating) {
    statItems.push({
      icon: <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />,
      label: 'Rating',
      value: `${stats.rating.toFixed(1)}/5`,
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
