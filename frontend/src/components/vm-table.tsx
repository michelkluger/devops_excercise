import type { VM } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getColumns, type ColumnActions } from "./vm-columns";

interface VMTableProps {
  vms: VM[];
  permissions: Set<string>;
  actions: ColumnActions;
}

export function VMTable({ vms, permissions, actions }: VMTableProps) {
  const columns = getColumns(actions, permissions);

  if (vms.length === 0) {
    return (
      <div className="rounded-md border p-12 text-center text-muted-foreground">
        No virtual machines found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vms.map((vm) => (
            <TableRow key={vm.id}>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.render(vm)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
