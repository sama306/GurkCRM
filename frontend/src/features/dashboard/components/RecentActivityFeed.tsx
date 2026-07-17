import { User, TrendingUp, CheckSquare, Loader2 } from "lucide-react";
import type { RecentActivityItem } from "@/types/dashboard";

interface RecentActivityFeedProps {
  data: RecentActivityItem[] | undefined;
  isLoading: boolean;
}

const TYPE_ICON = {
  CUSTOMER: User,
  DEAL: TrendingUp,
  TASK: CheckSquare,
} as const;

const TYPE_COLOR = {
  CUSTOMER: "bg-info/10 text-info",
  DEAL: "bg-warning/15 text-warning",
  TASK: "bg-success/15 text-success",
} as const;

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  if (seconds < 60) return rtf.format(-seconds, "second");
  if (minutes < 60) return rtf.format(-minutes, "minute");
  if (hours < 24) return rtf.format(-hours, "hour");
  if (days < 7) return rtf.format(-days, "day");
  if (weeks < 5) return rtf.format(-weeks, "week");
  return rtf.format(-months, "month");
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="size-9 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentActivityFeed({ data, isLoading }: RecentActivityFeedProps) {
  if (isLoading) return <LoadingSkeleton />;

  if (!data || data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No hay actividad reciente.
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {data.map((item) => {
        const Icon = TYPE_ICON[item.type];
        const colorClass = TYPE_COLOR[item.type];
        return (
          <div key={item.id} className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ease-out hover:bg-muted/50">
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
              <Icon className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.descriptionText}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(item.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
