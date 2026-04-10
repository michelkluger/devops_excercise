import type { VM } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Square,
  Play,
  RotateCcw,
} from "lucide-react";

const statusColors: Record<string, string> = {
  running: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  stopped: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  provisioning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  failed:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 line-through",
};

const networkColors: Record<string, string> = {
  office: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  machine:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  test: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

const networkLabels: Record<string, string> = {
  office: "OFLNET",
  machine: "MNET",
  test: "TNET",
};

function formatRAM(mb: number): string {
  return mb >= 1024
    ? `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`
    : `${mb} MB`;
}

export interface ColumnActions {
  onEdit: (vm: VM) => void;
  onDelete: (vm: VM) => void;
  onStop: (vm: VM) => void;
  onStart: (vm: VM) => void;
  onReboot: (vm: VM) => void;
}

export function getColumns(actions: ColumnActions, permissions: Set<string>) {
  const can = (action: string) => permissions.has(action);

  return [
    {
      key: "name" as const,
      header: "Name",
      render: (vm: VM) => <span className="font-medium">{vm.name}</span>,
    },
    {
      key: "cpu" as const,
      header: "CPU",
      render: (vm: VM) => <span>{vm.cpu} cores</span>,
    },
    {
      key: "ram" as const,
      header: "RAM",
      render: (vm: VM) => <span>{formatRAM(vm.ram)}</span>,
    },
    {
      key: "disk" as const,
      header: "Disk",
      render: (vm: VM) => <span>{vm.disk} GB</span>,
    },
    {
      key: "os" as const,
      header: "OS",
      render: (vm: VM) => <span>{vm.os}</span>,
    },
    {
      key: "network" as const,
      header: "Network",
      render: (vm: VM) => (
        <Badge variant="outline" className={networkColors[vm.network] ?? ""}>
          {networkLabels[vm.network] ?? vm.network}
        </Badge>
      ),
    },
    {
      key: "status" as const,
      header: "Status",
      render: (vm: VM) => (
        <Badge variant="outline" className={statusColors[vm.status] ?? ""}>
          {vm.status}
        </Badge>
      ),
    },
    {
      key: "users" as const,
      header: "Users",
      render: (vm: VM) => <span>{vm.users.length}</span>,
    },
    {
      key: "packages" as const,
      header: "Pkgs",
      render: (vm: VM) => <span>{vm.packages.length}</span>,
    },
    {
      key: "actions" as const,
      header: "",
      render: (vm: VM) => (
        <div className="flex gap-1">
          {can("stop") && (vm.status === "running" || vm.status === "provisioning") && (
            <Button
              variant="ghost"
              size="icon"
              title="Stop"
              onClick={(e) => {
                e.stopPropagation();
                actions.onStop(vm);
              }}
            >
              <Square className="h-4 w-4 text-orange-600" />
            </Button>
          )}
          {can("start") && (vm.status === "stopped" || vm.status === "failed") && (
            <Button
              variant="ghost"
              size="icon"
              title="Start"
              onClick={(e) => {
                e.stopPropagation();
                actions.onStart(vm);
              }}
            >
              <Play className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {can("reboot") && vm.status === "running" && (
            <Button
              variant="ghost"
              size="icon"
              title="Reboot"
              onClick={(e) => {
                e.stopPropagation();
                actions.onReboot(vm);
              }}
            >
              <RotateCcw className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          {can("edit") && (
            <Button
              variant="ghost"
              size="icon"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                actions.onEdit(vm);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {can("delete") && (
            <Button
              variant="ghost"
              size="icon"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                actions.onDelete(vm);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}
