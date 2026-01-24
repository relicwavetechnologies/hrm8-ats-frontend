import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Employee } from "@/shared/types/employee";
import { format } from "date-fns";
import { Badge } from "@/shared/components/ui/badge";
import { Briefcase, MapPin, Calendar, DollarSign, Users, Award } from "lucide-react";

interface EmployeeOverviewTabProps {
  employee: Employee;
}

export function EmployeeOverviewTab({ employee }: EmployeeOverviewTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{format(new Date(employee.dateOfBirth), "MMMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{employee.gender}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium">{employee.address}</p>
            <p className="font-medium">{employee.city}, {employee.state} {employee.postalCode}</p>
            <p className="font-medium">{employee.country}</p>
          </div>
          {employee.emergencyContactName && (
            <div>
              <p className="text-sm text-muted-foreground">Emergency Contact</p>
              <p className="font-medium">{employee.emergencyContactName}</p>
              <p className="text-sm">{employee.emergencyContactPhone}</p>
              <p className="text-sm text-muted-foreground">{employee.emergencyContactRelationship}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-medium">{employee.department}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </p>
            <p className="font-medium">{employee.location}</p>
          </div>
          {employee.managerName && (
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Reports To
              </p>
              <p className="font-medium">{employee.managerName}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Hire Date
              </p>
              <p className="font-medium">{format(new Date(employee.hireDate), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">{format(new Date(employee.startDate), "MMM d, yyyy")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Compensation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Base Salary</p>
            <p className="text-2xl font-bold">
              {employee.currency} ${employee.salary.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground capitalize">{employee.payFrequency}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills & Certifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {employee.skills && employee.skills.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          {employee.certifications && employee.certifications.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {employee.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline">{cert}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {employee.notes && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{employee.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
