import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListTodo, MoreHorizontal } from "lucide-react";
import type { Task } from "@/types/task";
import { TASK_STATUSES } from "@/features/tasks/schemas/task.schema";
import { useAuthStore } from "@/stores/auth.store";
import { canEditTask, canDeleteTask } from "@/utils/permissions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TasksTableProps {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  hasFilters: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: string) => void;
}

const PRIORITY_BADGE: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
  LOW: { variant: "secondary", label: "Baja" },
  MEDIUM: { variant: "outline", label: "Media" },
  HIGH: { variant: "destructive", label: "Alta" },
};

const STATUS_BADGE: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
  PENDING: { variant: "outline", label: "Pendiente" },
  IN_PROGRESS: { variant: "default", label: "En progreso" },
  DONE: { variant: "secondary", label: "Completada" },
};

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    return format(new Date(dateStr), "dd MMM yyyy", { locale: es });
  } catch {
    return dateStr;
  }
}

function isOverdue(dateStr: string | null, status: string): boolean {
  if (!dateStr || status === "DONE") return false;
  try {
    return new Date(dateStr) < new Date();
  } catch {
    return false;
  }
}

function LoadingSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Prioridad</TableHead>
          <TableHead>Fecha límite</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 6 }).map((_, j) => (
              <TableCell key={j}>
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ListTodo className="size-12 text-muted-foreground/40" />
      <h3 className="mt-4 text-lg font-semibold">No se encontraron tareas</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasFilters
          ? "Intenta ajustar los filtros de búsqueda."
          : "Todavía no hay tareas registradas."}
      </p>
    </div>
  );
}

export function TasksTable({
  tasks,
  isLoading,
  isError,
  hasFilters,
  onEdit,
  onDelete,
  onStatusChange,
}: TasksTableProps) {
  const user = useAuthStore((s) => s.user);
  const role = user?.roleName ?? "VIEWER";
  const userId = user?.id ?? "";

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-destructive">Error al cargar las tareas.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState hasFilters={hasFilters} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Prioridad</TableHead>
          <TableHead>Fecha límite</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const pb = PRIORITY_BADGE[task.priority] ?? { variant: "secondary" as const, label: task.priority };
          const sb = STATUS_BADGE[task.status] ?? { variant: "outline" as const, label: task.status };
          const isOverdueTask = isOverdue(task.dueDate, task.status);
          const isEditable = canEditTask(role, userId, task);
          const isDeletable = canDeleteTask(role, userId, task);
          const hasActions = isEditable || isDeletable;

          return (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge variant={pb.variant}>{pb.label}</Badge>
              </TableCell>
              <TableCell>
                <span
                  className={
                    isOverdueTask
                      ? "font-semibold text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {formatDate(task.dueDate) ?? "—"}
                </span>
              </TableCell>
              <TableCell>
                {isEditable ? (
                  <Select
                    defaultValue={task.status}
                    onValueChange={(val) => onStatusChange(task.id, val)}
                  >
                    <SelectTrigger className="h-7 w-[140px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_BADGE[s]?.label ?? s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={sb.variant}>{sb.label}</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {task.assigneeName}
              </TableCell>
              <TableCell>
                {hasActions ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isEditable && (
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          Editar
                        </DropdownMenuItem>
                      )}
                      {isDeletable && (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(task)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span className="text-muted-foreground/40 text-xs">—</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
