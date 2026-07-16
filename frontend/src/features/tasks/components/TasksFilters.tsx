import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/features/tasks/schemas/task.schema";

interface TasksFiltersProps {
  search: string;
  status: string;
  priority: string;
  assigneeId: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  ...TASK_STATUSES.map((s) => ({ value: s, label: s === "PENDING" ? "Pendiente" : s === "IN_PROGRESS" ? "En progreso" : "Completada" })),
];

const PRIORITY_OPTIONS = [
  { value: "", label: "Todas las prioridades" },
  ...TASK_PRIORITIES.map((p) => ({ value: p, label: p === "LOW" ? "Baja" : p === "MEDIUM" ? "Media" : "Alta" })),
];

export function TasksFilters({
  search,
  status,
  priority,
  assigneeId,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
}: TasksFiltersProps) {
  const { data: usersData } = useUsers();
  const users = usersData ?? [];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar tareas..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={assigneeId} onValueChange={onAssigneeChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Asignado a" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos los responsables</SelectItem>
          {users.map((u: { id: string; fullName: string }) => (
            <SelectItem key={u.id} value={u.id}>
              {u.fullName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
