import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { Heart, Plus, Calendar, AlertCircle, FileCheck, Users, DollarSign, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useRBAC } from "@/shared/hooks/useRBAC";
import { getEnrollmentPeriods, getLifeEvents, getCOBRAEvents, deleteEnrollmentPeriod, deleteLifeEvent, deleteCOBRAEvent } from "@/shared/lib/benefitsEnhancedStorage";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, Column } from "@/components/tables/DataTable";
import { EnrollmentPeriod, LifeEvent, COBRAEvent } from "@/shared/types/benefitsEnhanced";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { EnrollmentPeriodDialog } from "@/components/benefits/EnrollmentPeriodDialog";
import { LifeEventDialog } from "@/components/benefits/LifeEventDialog";
import { COBRADialog } from "@/components/benefits/COBRADialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { toast } from "sonner";
import { useCurrencyFormat } from "@/app/providers/CurrencyFormatContext";

export default function BenefitsAdmin() {
  const { isHRAdmin, isSuperAdmin } = useRBAC();
  const { formatCurrency } = useCurrencyFormat();
  const [activeTab, setActiveTab] = useState("enrollment");
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [lifeEventDialogOpen, setLifeEventDialogOpen] = useState(false);
  const [cobraDialogOpen, setCobraDialogOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<EnrollmentPeriod | null>(null);
  const [editingLifeEvent, setEditingLifeEvent] = useState<LifeEvent | null>(null);
  const [editingCOBRA, setEditingCOBRA] = useState<COBRAEvent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"enrollment" | "life-event" | "cobra" | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteType, setBulkDeleteType] = useState<"enrollment" | "life-event" | "cobra" | null>(null);
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);
  const [selectedLifeEvents, setSelectedLifeEvents] = useState<string[]>([]);
  const [selectedCOBRA, setSelectedCOBRA] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const enrollmentPeriods = getEnrollmentPeriods();
  const lifeEvents = getLifeEvents({ processed: false });
  const cobraEvents = getCOBRAEvents();

  const hasAccess = isHRAdmin || isSuperAdmin;

  const handleDelete = () => {
    if (!itemToDelete || !deleteType) return;
    
    setIsDeleting(true);
    try {
      let success = false;
      let message = "";
      
      if (deleteType === "enrollment") {
        success = deleteEnrollmentPeriod(itemToDelete.id);
        message = "Enrollment period deleted successfully";
      } else if (deleteType === "life-event") {
        success = deleteLifeEvent(itemToDelete.id);
        message = "Life event deleted successfully";
      } else if (deleteType === "cobra") {
        success = deleteCOBRAEvent(itemToDelete.id);
        message = "COBRA event deleted successfully";
      }
      
      if (success) {
        toast.success(message);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        setDeleteType(null);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = () => {
    if (!bulkDeleteType) return;
    
    setIsDeleting(true);
    try {
      let successCount = 0;
      let selectedIds: string[] = [];
      
      if (bulkDeleteType === "enrollment") {
        selectedIds = selectedEnrollments;
        selectedIds.forEach((id) => {
          if (deleteEnrollmentPeriod(id)) successCount++;
        });
      } else if (bulkDeleteType === "life-event") {
        selectedIds = selectedLifeEvents;
        selectedIds.forEach((id) => {
          if (deleteLifeEvent(id)) successCount++;
        });
      } else if (bulkDeleteType === "cobra") {
        selectedIds = selectedCOBRA;
        selectedIds.forEach((id) => {
          if (deleteCOBRAEvent(id)) successCount++;
        });
      }
      
      toast.success(`Successfully deleted ${successCount} item${successCount > 1 ? 's' : ''}`);
      setBulkDeleteDialogOpen(false);
      setSelectedEnrollments([]);
      setSelectedLifeEvents([]);
      setSelectedCOBRA([]);
      setBulkDeleteType(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to delete items");
    } finally {
      setIsDeleting(false);
    }
  };

  const enrollmentColumns: Column<EnrollmentPeriod>[] = [
    {
      key: "name",
      label: "Period Name",
      sortable: true,
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (period) => {
        const colors = {
          open: "bg-blue-50 text-blue-700",
          "new-hire": "bg-green-50 text-green-700",
          "life-event": "bg-purple-50 text-purple-700",
        };
        return <Badge className={colors[period.type]}>{period.type}</Badge>;
      },
    },
    {
      key: "startDate",
      label: "Start Date",
      sortable: true,
      render: (period) => new Date(period.startDate).toLocaleDateString(),
    },
    {
      key: "endDate",
      label: "End Date",
      sortable: true,
      render: (period) => new Date(period.endDate).toLocaleDateString(),
    },
    {
      key: "effectiveDate",
      label: "Effective",
      sortable: true,
      render: (period) => new Date(period.effectiveDate).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (period) => {
        const colors = {
          upcoming: "bg-gray-50 text-gray-700",
          active: "bg-green-50 text-green-700",
          closed: "bg-red-50 text-red-700",
        };
        return <Badge className={colors[period.status]}>{period.status}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (period) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => {
              setEditingEnrollment(period);
              setEnrollmentDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Period
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setDeleteType("enrollment");
                setItemToDelete(period);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Period
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const lifeEventColumns: Column<LifeEvent>[] = [
    {
      key: "employeeName",
      label: "Employee",
      sortable: true,
    },
    {
      key: "eventType",
      label: "Event Type",
      sortable: true,
      render: (event) => (
        <Badge variant="secondary">{event.eventType}</Badge>
      ),
    },
    {
      key: "eventDate",
      label: "Event Date",
      sortable: true,
      render: (event) => new Date(event.eventDate).toLocaleDateString(),
    },
    {
      key: "specialEnrollmentPeriod",
      label: "SEP Days",
      sortable: true,
      render: (event) => `${event.specialEnrollmentPeriod} days`,
    },
    {
      key: "documentationReceived",
      label: "Documentation",
      render: (event) => (
        event.documentationReceived ? (
          <FileCheck className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-orange-500" />
        )
      ),
    },
    {
      key: "processed",
      label: "Status",
      sortable: true,
      render: (event) => (
        <Badge variant={event.processed ? "default" : "secondary"}>
          {event.processed ? "Processed" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (event) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => {
              setEditingLifeEvent(event);
              setLifeEventDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Event
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setDeleteType("life-event");
                setItemToDelete(event);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const cobraColumns: Column<COBRAEvent>[] = [
    {
      key: "employeeName",
      label: "Employee",
      sortable: true,
    },
    {
      key: "qualifyingEvent",
      label: "Qualifying Event",
      sortable: true,
      render: (cobra) => (
        <Badge variant="outline">{cobra.qualifyingEvent}</Badge>
      ),
    },
    {
      key: "eventDate",
      label: "Event Date",
      sortable: true,
      render: (cobra) => new Date(cobra.eventDate).toLocaleDateString(),
    },
    {
      key: "cobraStartDate",
      label: "COBRA Start",
      sortable: true,
      render: (cobra) => new Date(cobra.cobraStartDate).toLocaleDateString(),
    },
    {
      key: "premiumAmount",
      label: "Premium",
      sortable: true,
      render: (cobra) => formatCurrency(cobra.premiumAmount),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (cobra) => {
        const colors = {
          pending: "bg-gray-50 text-gray-700",
          active: "bg-green-50 text-green-700",
          expired: "bg-red-50 text-red-700",
          terminated: "bg-orange-50 text-orange-700",
        };
        return <Badge className={colors[cobra.status]}>{cobra.status}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (cobra) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => {
              setEditingCOBRA(cobra);
              setCobraDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit COBRA
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                setDeleteType("cobra");
                setItemToDelete(cobra);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete COBRA
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (!hasAccess) {
    return (
      <DashboardPageLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Heart className="h-8 w-8" />
                <div>
                  <p className="font-semibold">Access Restricted</p>
                  <p className="text-sm">You don't have permission to manage benefits administration.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="h-8 w-8" />
              Benefits Administration
            </h1>
            <p className="text-muted-foreground">
              Manage enrollments, life events, and COBRA administration
            </p>
          </div>
          <Button onClick={() => setEnrollmentDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Enrollment Period
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Enrollment</p>
                  <p className="text-2xl font-bold">
                    {enrollmentPeriods.filter((e) => e.status === 'active').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Life Events</p>
                  <p className="text-2xl font-bold">{lifeEvents.length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active COBRA</p>
                  <p className="text-2xl font-bold">
                    {cobraEvents.filter((c) => c.status === 'active').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enrollment Rate</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="enrollment">Enrollment Periods</TabsTrigger>
            <TabsTrigger value="life-events">Life Events</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility Rules</TabsTrigger>
            <TabsTrigger value="cobra">COBRA</TabsTrigger>
            <TabsTrigger value="costs">Cost Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Enrollment Periods</CardTitle>
                <CardDescription>
                  Manage open enrollment and special enrollment periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={enrollmentColumns}
                  data={enrollmentPeriods}
                  searchKeys={["name", "type"]}
                  selectable={true}
                  onSelectedRowsChange={setSelectedEnrollments}
                  exportable={true}
                  exportFilename="enrollment-periods"
                  renderBulkActions={(selectedIds) => (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setBulkDeleteType("enrollment");
                        setBulkDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="life-events" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="text-base font-semibold flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Life Events</CardTitle>
                    <CardDescription>
                      Process qualifying life events and special enrollment periods
                    </CardDescription>
                  </div>
                  <Button onClick={() => setLifeEventDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {lifeEvents.length > 0 ? (
                  <DataTable
                    columns={lifeEventColumns}
                    data={lifeEvents}
                    searchKeys={["employeeName", "eventType"]}
                    selectable={true}
                    onSelectedRowsChange={setSelectedLifeEvents}
                    exportable={true}
                    exportFilename="life-events"
                    renderBulkActions={(selectedIds) => (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setBulkDeleteType("life-event");
                          setBulkDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    )}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No pending life events.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eligibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Eligibility Rules</CardTitle>
                <CardDescription>
                  Define and manage plan eligibility criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Configure eligibility rules based on tenure, employment type, and other criteria.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cobra" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="text-base font-semibold flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">COBRA Administration</CardTitle>
                    <CardDescription>
                      Manage COBRA qualifying events and continuation coverage
                    </CardDescription>
                  </div>
                  <Button onClick={() => setCobraDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create COBRA Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {cobraEvents.length > 0 ? (
                  <DataTable
                    columns={cobraColumns}
                    data={cobraEvents}
                    searchKeys={["employeeName", "qualifyingEvent"]}
                    selectable={true}
                    onSelectedRowsChange={setSelectedCOBRA}
                    exportable={true}
                    exportFilename="cobra-events"
                    renderBulkActions={(selectedIds) => (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setBulkDeleteType("cobra");
                          setBulkDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    )}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No COBRA events to display.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Benefits Cost Calculator</CardTitle>
                <CardDescription>
                  Calculate employee and employer contributions by coverage tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Use the cost calculator to estimate benefits costs for different coverage tiers.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <EnrollmentPeriodDialog
          open={enrollmentDialogOpen}
          onOpenChange={(open) => {
            setEnrollmentDialogOpen(open);
            if (!open) setEditingEnrollment(null);
          }}
          editingPeriod={editingEnrollment}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setEditingEnrollment(null);
          }}
        />
        <LifeEventDialog
          open={lifeEventDialogOpen}
          onOpenChange={(open) => {
            setLifeEventDialogOpen(open);
            if (!open) setEditingLifeEvent(null);
          }}
          editingEvent={editingLifeEvent}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setEditingLifeEvent(null);
          }}
        />
        <COBRADialog
          open={cobraDialogOpen}
          onOpenChange={(open) => {
            setCobraDialogOpen(open);
            if (!open) setEditingCOBRA(null);
          }}
          editingEvent={editingCOBRA}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setEditingCOBRA(null);
          }}
        />
        
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={`Delete ${deleteType === "enrollment" ? "Enrollment Period" : deleteType === "life-event" ? "Life Event" : "COBRA Event"}`}
          description={`Are you sure you want to delete this ${deleteType === "enrollment" ? "enrollment period" : deleteType === "life-event" ? "life event" : "COBRA event"}? This action cannot be undone.`}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
        
        <DeleteConfirmationDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          title="Delete Multiple Items"
          description={`Are you sure you want to delete ${
            bulkDeleteType === 'enrollment' ? selectedEnrollments.length :
            bulkDeleteType === 'life-event' ? selectedLifeEvents.length :
            selectedCOBRA.length
          } item${
            (bulkDeleteType === 'enrollment' ? selectedEnrollments.length :
            bulkDeleteType === 'life-event' ? selectedLifeEvents.length :
            selectedCOBRA.length) > 1 ? 's' : ''
          }? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          isDeleting={isDeleting}
        />
      </div>
    </DashboardPageLayout>
  );
}
