import { useState, useEffect, useMemo } from "react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { Pagination } from "@/features/companies/components/Pagination";
import { useDashboardSummary, useRecentActivity } from "../hooks/useDashboard";
import { SummaryCards } from "./SummaryCards";
import { RecentActivityFeed } from "./RecentActivityFeed";
import type { Task } from "@/types/task";

const PRIORITY_BADGE: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
  LOW: { variant: "secondary", label: "Baja" },
  MEDIUM: { variant: "outline", label: "Media" },
  HIGH: { variant: "destructive", label: "Alta" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  } catch {
    return dateStr;
  }
}

export function DashboardPage() {
  return (
    <QueryProvider>
      <DashboardContent />
    </QueryProvider>
  );
}

function DashboardContent() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "";

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(10);

  const [taskPage, setTaskPage] = useState(1);
  const { data: tasksData, isLoading: tasksLoading } = useTasks({
    assigneeId: userId || undefined,
    limit: 20,
  });

  useEffect(() => {
    setTaskPage(1);
  }, [userId]);

  const allTasks = (tasksData?.data ?? []) as Task[];
  const pendingTasks = useMemo(
    () => allTasks.filter((t) => t.status !== "DONE"),
    [allTasks],
  );

  const tasksPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(pendingTasks.length / tasksPerPage));
  const safePage = Math.min(taskPage, totalPages);
  const paginatedTasks = pendingTasks.slice(
    (safePage - 1) * tasksPerPage,
    safePage * tasksPerPage,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <SummaryCards data={summary} isLoading={summaryLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityFeed data={recentActivity} isLoading={activityLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis Tareas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-14 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : paginatedTasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No tenés tareas pendientes. ¡Bien ahí!
              </p>
            ) : (
              <div className="space-y-1">
                {paginatedTasks.map((task) => {
                  const pb = PRIORITY_BADGE[task.priority] ?? { variant: "secondary" as const, label: task.priority };
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Vence: {formatDate(task.dueDate)}
                        </p>
                      </div>
                      <Badge variant={pb.variant} className="shrink-0">
                        {pb.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
            {totalPages > 1 && (
              <Pagination
                page={safePage}
                totalPages={totalPages}
                total={pendingTasks.length}
                onPageChange={setTaskPage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
