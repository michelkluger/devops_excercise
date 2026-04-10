import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSystemUsers, useMe } from "@/hooks/use-vms";
import { getCurrentUser, setCurrentUser } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  operator: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  viewer: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

interface UserSwitcherProps {
  currentUsername: string;
  onUserChange: (username: string) => void;
}

export function UserSwitcher({ currentUsername, onUserChange }: UserSwitcherProps) {
  const { data: systemUsers = [] } = useSystemUsers();
  const { data: profile } = useMe(currentUsername);
  const qc = useQueryClient();

  function handleChange(username: string) {
    setCurrentUser(username);
    onUserChange(username);
    qc.invalidateQueries();
  }

  return (
    <div className="flex items-center gap-3">
      <User className="h-4 w-4 text-muted-foreground" />
      <Select value={currentUsername} onValueChange={handleChange}>
        <SelectTrigger className="w-[220px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {systemUsers.map((u) => (
            <SelectItem key={u.username} value={u.username}>
              <span className="flex items-center gap-2">
                {u.full_name}
                <Badge variant="outline" className={`text-[10px] px-1 py-0 ${ROLE_COLORS[u.role] ?? ""}`}>
                  {u.role}
                </Badge>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {profile && (
        <span className="text-xs text-muted-foreground">
          {profile.department}
        </span>
      )}
    </div>
  );
}
