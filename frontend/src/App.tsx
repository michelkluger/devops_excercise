import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Toolbar } from "@/components/toolbar";
import { VMTable } from "@/components/vm-table";
import { VMForm } from "@/components/vm-form";
import { DeleteDialog } from "@/components/delete-dialog";
import { Pagination } from "@/components/pagination";
import { UserSwitcher } from "@/components/user-switcher";
import {
  useVMs,
  useMe,
  useCreateVM,
  useUpdateVM,
  useDeleteVM,
  useStopVM,
  useStartVM,
  useRebootVM,
} from "@/hooks/use-vms";
import { getCurrentUser } from "@/lib/api";
import type { VM, VMFilters } from "@/lib/types";

const DEFAULT_FILTERS: VMFilters = { sort_by: "created_at", order: "desc" };
const PAGE_SIZE = 8;

export default function App() {
  const [currentUsername, setCurrentUsername] = useState(getCurrentUser());
  const { data: profile } = useMe(currentUsername);
  const perms = new Set(profile?.permissions ?? []);

  const [inputValue, setInputValue] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [filters, setFilters] = useState<VMFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingVM, setEditingVM] = useState<VM | null>(null);
  const [deletingVM, setDeletingVM] = useState<VM | null>(null);

  const { data, isLoading } = useVMs({
    q: committedQuery || undefined,
    ...filters,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const createVM = useCreateVM();
  const updateVM = useUpdateVM();
  const deleteVM = useDeleteVM();
  const stopVM = useStopVM();
  const startVM = useStartVM();
  const rebootVM = useRebootVM();

  function handleStop(vm: VM) {
    stopVM.mutate(vm.id, {
      onSuccess: () => toast.success(`VM "${vm.name}" stopped`),
      onError: (err) => toast.error(err.message),
    });
  }

  function handleStart(vm: VM) {
    startVM.mutate(vm.id, {
      onSuccess: () => toast.success(`VM "${vm.name}" starting...`),
      onError: (err) => toast.error(err.message),
    });
  }

  function handleReboot(vm: VM) {
    rebootVM.mutate(vm.id, {
      onSuccess: () => toast.success(`VM "${vm.name}" rebooting...`),
      onError: (err) => toast.error(err.message),
    });
  }

  function handleSearchCommit(query: string) {
    setCommittedQuery(query);
    setPage(0);
  }

  function handleInputChange(value: string) {
    setInputValue(value);
    if (value === "") {
      setCommittedQuery("");
      setPage(0);
    }
  }

  function handleFiltersChange(newFilters: VMFilters) {
    setFilters(newFilters);
    setPage(0);
  }

  function handleCreate() {
    setEditingVM(null);
    setFormOpen(true);
  }

  function handleEdit(vm: VM) {
    setEditingVM(vm);
    setFormOpen(true);
  }

  function handleDelete(vm: VM) {
    setDeletingVM(vm);
  }

  function handleFormSubmit(values: Record<string, unknown>) {
    if (editingVM) {
      updateVM.mutate(
        { id: editingVM.id, data: values },
        {
          onSuccess: () => {
            toast.success(`VM "${values.name}" updated`);
            setFormOpen(false);
          },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      createVM.mutate(values as Parameters<typeof createVM.mutate>[0], {
        onSuccess: () => {
          toast.success(`VM "${values.name}" created`);
          setFormOpen(false);
        },
        onError: (err) => toast.error(err.message),
      });
    }
  }

  function handleDeleteConfirm() {
    if (!deletingVM) return;
    deleteVM.mutate(deletingVM.id, {
      onSuccess: () => {
        toast.success(`VM "${deletingVM.name}" deleted`);
        setDeletingVM(null);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <img src="/psi-logo.svg" alt="Paul Scherrer Institute" className="h-12" />
          <div className="flex-1 text-center -ml-32">
            <h1 className="text-3xl font-bold tracking-tight">
              VM Provisioning
            </h1>
            <p className="mt-1 text-muted-foreground">
              Provision and manage our facility compute infrastructure
            </p>
          </div>
          <div className="ml-auto">
            <UserSwitcher currentUsername={currentUsername} onUserChange={setCurrentUsername} />
          </div>
        </div>

        <div className="space-y-4">
          <Toolbar
            search={inputValue}
            onSearchChange={handleInputChange}
            onSearchCommit={handleSearchCommit}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onCreateClick={handleCreate}
            canCreate={perms.has("create")}
          />

          {committedQuery && data && (
            <p className="text-sm text-muted-foreground">
              {data.total} result{data.total !== 1 ? "s" : ""} for
              &ldquo;{data.query}&rdquo;
              {data.processing_time_ms > 0 &&
                ` (${data.processing_time_ms}ms)`}
            </p>
          )}

          {isLoading ? (
            <div className="rounded-md border p-12 text-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <>
              <VMTable
                vms={data?.items ?? []}
                permissions={perms}
                actions={{
                  onEdit: handleEdit,
                  onDelete: handleDelete,
                  onStop: handleStop,
                  onStart: handleStart,
                  onReboot: handleReboot,
                }}
              />
              {data && (
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={data.total}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>

      <VMForm
        open={formOpen}
        onOpenChange={setFormOpen}
        vm={editingVM}
        onSubmit={handleFormSubmit}
        isPending={createVM.isPending || updateVM.isPending}
      />

      <DeleteDialog
        vm={deletingVM}
        open={!!deletingVM}
        onOpenChange={(open) => !open && setDeletingVM(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteVM.isPending}
      />

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
