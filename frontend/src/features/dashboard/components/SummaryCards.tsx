import { Users, TrendingUp, DollarSign, CheckSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { DashboardSummary } from "@/types/dashboard";

interface SummaryCardsProps {
  data: DashboardSummary | undefined;
  isLoading: boolean;
}

const CARD_DEFS = [
  {
    key: "activeCustomers" as const,
    label: "Clientes Activos",
    icon: Users,
    format: (v: number) => v.toLocaleString("es-AR"),
  },
  {
    key: "openDeals" as const,
    label: "Oportunidades Abiertas",
    icon: TrendingUp,
    format: (v: number) => v.toLocaleString("es-AR"),
  },
  {
    key: "wonDealsValueThisMonth" as const,
    label: "Ventas del Mes",
    icon: DollarSign,
    format: (v: number) =>
      new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v),
  },
  {
    key: "myPendingTasks" as const,
    label: "Mis Tareas Pendientes",
    icon: CheckSquare,
    format: (v: number) => v.toLocaleString("es-AR"),
  },
];

function SkeletonCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="size-8 animate-pulse rounded-lg bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARD_DEFS.map((def) => {
        const Icon = def.icon;
        const value = data?.[def.key] ?? 0;
        return (
          <Card key={def.key} className="shadow-sm">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {def.label}
              </CardTitle>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {def.format(value)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
