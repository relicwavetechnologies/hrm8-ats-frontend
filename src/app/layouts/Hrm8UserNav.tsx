import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { User, Settings, Keyboard, LogOut } from "lucide-react";
import { useHrm8Auth } from "@/app/providers/AuthContext";

export function Hrm8UserNav() {
  const { hrm8User, logout } = useHrm8Auth();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!hrm8User) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={`${hrm8User.firstName} ${hrm8User.lastName}`} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(hrm8User.firstName, hrm8User.lastName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {hrm8User.firstName} {hrm8User.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {hrm8User.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              {hrm8User.role === "GLOBAL_ADMIN" ? "Global Admin" : "Regional Licensee"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard shortcuts</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

































