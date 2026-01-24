import { format, formatDistanceToNow } from "date-fns";
import { MoreVertical, Edit, ListTodo, Eye, Archive } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Progress } from "@/shared/components/ui/progress";
import { ServiceTypeBadge } from "./ServiceTypeBadge";
import { ServiceStatusBadge } from "./ServiceStatusBadge";

import type { ServiceProject } from "@/types/recruitmentService";
import type { Column } from "@/shared/components/tables/DataTable";

export const createServiceProjectColumns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onViewTasks: (id: string) => void,
  onArchive: (id: string) => void
): Column<ServiceProject>[] => [
  {
    key: "serviceType",
    label: "Service Type",
    sortable: true,
    render: (project) => <ServiceTypeBadge type={project.serviceType} />,
  },
  {
    key: "name",
    label: "Project & Client",
    sortable: true,
    render: (project) => (
      <div>
        <Link 
          to={`/recruitment-services/${project.id}`}
          className="font-semibold text-base hover:underline cursor-pointer line-clamp-1 block"
        >
          {project.name}
        </Link>
        <Link
          to={`/employers/${project.clientId}`}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline line-clamp-1 block transition-colors"
        >
          {project.clientName}
        </Link>
      </div>
    ),
  },
  {
    key: "consultants",
    label: "Team",
    render: (project) => (
      <div className="flex -space-x-2">
        {project.consultants.slice(0, 3).map((consultant) => (
          <Avatar key={consultant.id} className="h-8 w-8 border-2 border-background">
            <AvatarImage src={consultant.avatar} alt={consultant.name} />
            <AvatarFallback className="text-xs">
              {consultant.name
                .split(' ')
                .filter(n => n.length > 0)
                .map(n => n[0])
                .join('')
                .toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        ))}
        {project.consultants.length > 3 && (
          <Avatar className="h-8 w-8 border-2 border-background">
            <AvatarFallback className="text-xs">
              +{project.consultants.length - 3}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    ),
  },
  {
    key: "location",
    label: "Location",
    sortable: true,
    render: (project) => (
      <div className="text-sm">
        <p className="font-medium">{project.location}</p>
        <p className="text-xs text-muted-foreground">{project.country}</p>
      </div>
    ),
  },
  {
    key: "projectValue",
    label: "Service Fee",
    sortable: true,
    render: (project) => {
      // RPO services have special display format
      if (project.serviceType === 'rpo') {
        return (
          <div>
            <div className="text-sm font-semibold">
              ${project.projectValue.toLocaleString()}/mth
            </div>
            <div className="text-xs text-muted-foreground">
              $3,990/vac
            </div>
          </div>
        );
      }
      
      // All other service types - just show total fee
      return (
        <div className="text-sm font-semibold">
          ${project.projectValue.toLocaleString()}
        </div>
      );
    },
  },
  {
    key: "startDate",
    label: "Start Date",
    sortable: true,
    render: (project) => (
      <div className="text-sm">
        <p>{formatDistanceToNow(new Date(project.startDate), { addSuffix: true })}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(project.startDate), "MMM d, yyyy")}
        </p>
      </div>
    ),
  },
  {
    key: "progress",
    label: "Progress",
    sortable: true,
    render: (project) => (
      <div className="w-32">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-1.5" />
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (project) => <ServiceStatusBadge status={project.status} />,
  },
  {
    key: "actions",
    label: "Actions",
    width: "80px",
    render: (project) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onView(project.id)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(project.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewTasks(project.id)}>
            <ListTodo className="mr-2 h-4 w-4" />
            View Tasks
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onArchive(project.id)} className="text-destructive">
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
