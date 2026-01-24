import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Mail, Phone, MapPin, GripVertical } from "lucide-react";
import type { Employee } from "@/shared/types/employee";
import { getEmployees } from "@/shared/lib/employeeStorage";
import { EmployeeStatusBadge } from "@/components/hrms/EmployeeStatusBadge";

interface KanbanColumn {
  id: string;
  title: string;
  employees: Employee[];
  color: string;
}

interface EmployeeCardProps {
  employee: Employee;
  isDragging?: boolean;
}

function EmployeeCard({ employee, isDragging }: EmployeeCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: employee.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-card border rounded-lg p-4 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={employee.avatar} />
          <AvatarFallback>
            {employee.firstName[0]}{employee.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {employee.firstName} {employee.lastName}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {employee.jobTitle}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{employee.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {employee.department}
          </Badge>
          <EmployeeStatusBadge status={employee.status} />
        </div>
      </div>
    </div>
  );
}

export function EmployeesKanbanBoard() {
  const allEmployees = getEmployees();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'active',
      title: 'Active',
      employees: allEmployees.filter(e => e.status === 'active'),
      color: 'bg-green-50 dark:bg-green-950',
    },
    {
      id: 'on-leave',
      title: 'On Leave',
      employees: allEmployees.filter(e => e.status === 'on-leave'),
      color: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      id: 'notice-period',
      title: 'Notice Period',
      employees: allEmployees.filter(e => e.status === 'notice-period'),
      color: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      id: 'inactive',
      title: 'Inactive',
      employees: allEmployees.filter(e => e.status === 'inactive'),
      color: 'bg-gray-50 dark:bg-gray-950',
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeEmployeeId = active.id as string;
    const overColumnId = over.id as string;

    // Find the source and destination columns
    const sourceColumn = columns.find(col => 
      col.employees.some(emp => emp.id === activeEmployeeId)
    );
    const destColumn = columns.find(col => col.id === overColumnId);

    if (!sourceColumn || !destColumn || sourceColumn.id === destColumn.id) {
      setActiveId(null);
      return;
    }

    // Move employee between columns
    const employee = sourceColumn.employees.find(emp => emp.id === activeEmployeeId);
    if (!employee) {
      setActiveId(null);
      return;
    }

    setColumns(columns.map(col => {
      if (col.id === sourceColumn.id) {
        return {
          ...col,
          employees: col.employees.filter(emp => emp.id !== activeEmployeeId),
        };
      }
      if (col.id === destColumn.id) {
        return {
          ...col,
          employees: [...col.employees, { ...employee, status: destColumn.id as any }],
        };
      }
      return col;
    }));

    setActiveId(null);
  };

  const activeEmployee = activeId 
    ? columns.flatMap(col => col.employees).find(emp => emp.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <Card key={column.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{column.title}</CardTitle>
                <Badge variant="secondary">{column.employees.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <SortableContext
                id={column.id}
                items={column.employees.map(emp => emp.id)}
                strategy={verticalListSortingStrategy}
              >
                <div 
                  className={`space-y-3 p-3 rounded-lg min-h-[400px] ${column.color}`}
                >
                  {column.employees.map((employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      isDragging={activeId === employee.id}
                    />
                  ))}
                  {column.employees.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      No employees in this status
                    </div>
                  )}
                </div>
              </SortableContext>
            </CardContent>
          </Card>
        ))}
      </div>

      <DragOverlay>
        {activeEmployee ? (
          <div className="opacity-90">
            <EmployeeCard employee={activeEmployee} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
