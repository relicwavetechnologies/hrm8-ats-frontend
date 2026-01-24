import { useParams, useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, DollarSign } from "lucide-react";
import { getEmployeeById } from "@/shared/lib/employeeStorage";
import { EmployeeStatusBadge } from "@/modules/employees/components/EmployeeStatusBadge";
import { EmploymentTypeBadge } from "@/modules/employees/components/EmploymentTypeBadge";
import { EntityAvatar } from "@/shared/components/tables/EntityAvatar";
import { format } from "date-fns";
import { useState } from "react";
import { EmployeeFormDialog } from "@/modules/employees/components/EmployeeFormDialog";
import { EmployeeDocuments } from "@/modules/employees/components/EmployeeDocuments";
import { EmployeeNotes } from "@/modules/employees/components/EmployeeNotes";
import { EmployeeHistory } from "@/modules/employees/components/EmployeeHistory";

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const employee = getEmployeeById(id!);

  if (!employee) {
    return (
      <DashboardPageLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Employee Not Found</h2>
            <p className="text-muted-foreground mb-4">The employee you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/employees")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Employees
            </Button>
          </div>
        </div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6" key={refreshKey}>
        <AtsPageHeader
          title={`${employee.firstName} ${employee.lastName}`}
          subtitle={employee.jobTitle}
        >
          <div className="text-base font-semibold flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/employees")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
            <EmployeeStatusBadge status={employee.status} />
            <Badge variant="outline" className="h-6 px-2 text-xs">{employee.department}</Badge>
            <EmploymentTypeBadge type={employee.employmentType} />
            <Badge variant="outline" className="h-6 px-2 text-xs font-mono">{employee.employeeId}</Badge>
            <Button size="sm" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Employee
            </Button>
          </div>
        </AtsPageHeader>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-6">
              <EntityAvatar
                name={`${employee.firstName} ${employee.lastName}`}
                src={employee.avatar}
                type="person"
                size="lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-base font-semibold">
                    {employee.firstName} {employee.lastName}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm">{employee.jobTitle}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <div className="overflow-x-auto -mx-1 px-1">
            <TabsList className="inline-flex w-auto gap-1 rounded-full border bg-muted/40 px-1 py-1 shadow-sm">
              <TabsTrigger 
                value="overview"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-base font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="text-base font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <div>{employee.address}</div>
                      <div>{employee.city}, {employee.state} {employee.postalCode}</div>
                      <div>{employee.country}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Hired: {format(new Date(employee.hireDate), "MMM d, yyyy")}</span>
                  </div>
                  <div className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Location: {employee.location}</span>
                  </div>
                  {employee.managerName && (
                    <div>
                      <span className="text-sm text-muted-foreground">Manager: </span>
                      <span>{employee.managerName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Compensation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-base font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: employee.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(employee.salary)}
                    </span>
                    <span className="text-sm text-muted-foreground">/ {employee.payFrequency}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Date of Birth: </span>
                    <span>{format(new Date(employee.dateOfBirth), "MMM d, yyyy")}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Gender: </span>
                    <span className="capitalize">{employee.gender.replace('-', ' ')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {employee.emergencyContactName && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Name: </span>
                    <span>{employee.emergencyContactName}</span>
                  </div>
                  {employee.emergencyContactPhone && (
                    <div>
                      <span className="text-sm text-muted-foreground">Phone: </span>
                      <span>{employee.emergencyContactPhone}</span>
                    </div>
                  )}
                  {employee.emergencyContactRelationship && (
                    <div>
                      <span className="text-sm text-muted-foreground">Relationship: </span>
                      <span>{employee.emergencyContactRelationship}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {(employee.skills && employee.skills.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(employee.certifications && employee.certifications.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {employee.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">{cert}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {employee.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{employee.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents">
            <EmployeeDocuments employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="notes">
            <EmployeeNotes employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="history">
            <EmployeeHistory employeeId={employee.id} />
          </TabsContent>
        </Tabs>

        <EmployeeFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          employee={employee}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      </div>
    </DashboardPageLayout>
  );
}
