import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermissions } from "@/utils/permissions";
import { useTasks, useDeleteTask, useChangeTaskStatus } from "@/features/tasks/hooks/useTasks";
import { TasksFilters } from "./TasksFilters";
import { TasksTable } from "./TasksTable";
import { TaskFormDialog } from "./TaskFormDialog";
import { Pagination } from "@/features/companies/components/Pagination";
import type { Task, TaskFilters } from "@/types/task";

export function TasksPage() {
  return (
    <QueryProvider>
      <TasksPageContent />
    </QueryProvider>
  );
}

function TasksPageContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deletingTask, setDeletingTask] = useState<Task | undefined>();

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, priority, assigneeId]);

  const filters: TaskFilters = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    priority: priority || undefined,
    assigneeId: assigneeId || undefined,
    page,
    limit: 20,
  };

  const { data, isLoading, isError } = useTasks(filters);
  const deleteMutation = useDeleteTask();
  const changeStatusMutation = useChangeTaskStatus();
  const { canCreate } = usePermissions();

  const tasks = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters = !!(debouncedSearch || status || priority || assigneeId);

  function handleCreateNew() {
    setEditingTask(undefined);
    setDialogOpen(true);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deletingTask) return;
    deleteMutation.mutate(deletingTask.id, {
      onSuccess: () => setDeletingTask(undefined),
    });
  }

  function handleDialogClose() {
    setDialogOpen(false);
    setEditingTask(undefined);
  }

  function handleStatusChange(taskId: string, newStatus: string) {
    changeStatusMutation.mutate({ id: taskId, data: { status: newStatus } });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Button onClick={handleCreateNew}>
              <Plus className="size-4" />
              Nueva tarea
            </Button>
          )}
        </div>
      </div>

      <TasksFilters
        search={search}
        status={status}
        priority={priority}
        assigneeId={assigneeId}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onAssigneeChange={setAssigneeId}
      />

      <TasksTable
        tasks={tasks}
        isLoading={isLoading}
        isError={isError}
        hasFilters={hasFilters}
        onEdit={handleEdit}
        onDelete={setDeletingTask}
        onStatusChange={handleStatusChange}
      />

      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      <TaskFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        task={editingTask}
      />

      <Dialog open={!!deletingTask} onOpenChange={(open) => !open && setDeletingTask(undefined)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar tarea</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar <strong>{deletingTask?.title}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingTask(undefined)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
