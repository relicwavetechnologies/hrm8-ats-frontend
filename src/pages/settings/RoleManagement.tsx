import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Shield, Plus, Crown, Users, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useRBAC } from "@/shared/hooks/useRBAC";
import { getAllUserRoles } from "@/shared/lib/rbacService";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { UserRole, ROLE_PERMISSIONS } from "@/shared/types/rbac";
import { RoleAssignmentDialog } from "@/modules/settings/components/RoleAssignmentDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/shared/components/ui/delete-confirmation-dialog";
import { deleteRoleAssignment } from "@/shared/lib/rbacStorage";
import { toast } from "sonner";

export default function RoleManagement() {
  const { isSuperAdmin } = useRBAC();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<UserRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const userRoles = getAllUserRoles();

  const roleColumns: Column<UserRole>[] = [
    {
      key: "userId",
      label: "User ID",
      sortable: true,
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (userRole) => (
        <Badge variant="default">{userRole.role}</Badge>
      ),
    },
    {
      key: "departmentId",
      label: "Department",
      sortable: true,
      render: (userRole) => userRole.departmentId || "-",
    },
    {
      key: "grantedAt",
      label: "Granted",
      sortable: true,
      render: (userRole) => new Date(userRole.grantedAt).toLocaleDateString(),
    },
    {
      key: "expiresAt",
      label: "Expires",
      sortable: true,
      render: (userRole) => (userRole.expiresAt ? new Date(userRole.expiresAt).toLocaleDateString() : "Never"),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (userRole) => (
        <Badge variant={userRole.isActive ? "default" : "secondary"}>
          {userRole.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (userRole) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={() => {
              setEditingRole(userRole);
              setRoleDialogOpen(true);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Assignment
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setRoleToDelete(userRole);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Revoke Role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleDeleteRole = () => {
    if (!roleToDelete) return;

    setIsDeleting(true);
    try {
      const success = deleteRoleAssignment(roleToDelete.id);
      if (success) {
        toast.success("Role assignment revoked successfully");
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error("Failed to revoke role");
      }
    } catch (error) {
      toast.error("Failed to revoke role");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = () => {
    setIsDeleting(true);
    try {
      let successCount = 0;
      selectedRoles.forEach((id) => {
        if (deleteRoleAssignment(id)) {
          successCount++;
        }
      });

      toast.success(`Successfully revoked ${successCount} role${successCount > 1 ? 's' : ''}`);
      setBulkDeleteDialogOpen(false);
      setSelectedRoles([]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error("Failed to revoke roles");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <DashboardPageLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Shield className="h-8 w-8" />
                <div>
                  <p className="font-semibold">Access Restricted</p>
                  <p className="text-sm">Only super administrators can manage roles.</p>
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
              <Shield className="h-8 w-8" />
              Role Management
            </h1>
            <p className="text-muted-foreground">
              Manage user roles and permissions across the system
            </p>
          </div>
          <Button onClick={() => setRoleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Roles</p>
                  <p className="text-2xl font-bold">{userRoles.length}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{userRoles.filter((r) => r.isActive).length}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Administrators</p>
                  <p className="text-2xl font-bold">
                    {userRoles.filter((r) => r.role === 'super_admin' || r.role === 'hr_admin').length}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Definitions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Role Definitions</CardTitle>
            <CardDescription>Understanding role hierarchy and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ROLE_PERMISSIONS.map((rolePermission) => (
                <div key={rolePermission.role} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">{rolePermission.role}</Badge>
                        {(rolePermission.role === 'super_admin' || rolePermission.role === 'hr_admin') && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rolePermission.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {rolePermission.permissions.slice(0, 5).map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                        {rolePermission.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{rolePermission.permissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Assigned Roles</CardTitle>
            <CardDescription>Current role assignments across users</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={roleColumns}
              data={userRoles}
              searchKeys={["userId", "role"]}
              selectable={true}
              onSelectedRowsChange={setSelectedRoles}
              exportable={true}
              exportFilename="role-assignments"
              renderBulkActions={(selectedIds) => (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Revoke Selected
                </Button>
              )}
            />
          </CardContent>
        </Card>

        <RoleAssignmentDialog
          open={roleDialogOpen}
          onOpenChange={(open) => {
            setRoleDialogOpen(open);
            if (!open) setEditingRole(null);
          }}
          editingAssignment={editingRole}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1);
            setEditingRole(null);
          }}
        />

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Revoke Role Assignment"
          description={`Are you sure you want to revoke ${roleToDelete?.role} role from user ${roleToDelete?.userId}? This action cannot be undone.`}
          onConfirm={handleDeleteRole}
          isDeleting={isDeleting}
        />

        <DeleteConfirmationDialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
          title="Revoke Multiple Roles"
          description={`Are you sure you want to revoke ${selectedRoles.length} role assignment${selectedRoles.length > 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          isDeleting={isDeleting}
        />
      </div>
    </DashboardPageLayout>
  );
}
