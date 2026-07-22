import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { useCustomer } from "@/features/customers/hooks/useCustomers";
import { ArrowLeft, Briefcase, Mail, MapPin, Phone, Building2, User, DollarSign } from "lucide-react";

interface CustomerDetailProps {
  id: string;
}

const STAGE_BADGE: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
  NEW: { variant: "outline", label: "Nuevo" },
  CONTACTED: { variant: "secondary", label: "Contactado" },
  MEETING: { variant: "default", label: "Reunión" },
  PROPOSAL: { variant: "default", label: "Propuesta" },
  NEGOTIATION: { variant: "default", label: "Negociación" },
  WON: { variant: "default", label: "Ganado" },
  LOST: { variant: "destructive", label: "Perdido" },
};

const STATUS_BADGE: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  LEAD: { variant: "outline", label: "Lead" },
  ACTIVE: { variant: "default", label: "Activo" },
  INACTIVE: { variant: "secondary", label: "Inactivo" },
};

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function CustomerDetail({ id }: CustomerDetailProps) {
  return (
    <QueryProvider>
      <CustomerDetailContent id={id} />
    </QueryProvider>
  );
}

function CustomerDetailContent({ id }: { id: string }) {
  const { data: customer, isLoading, isError } = useCustomer(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <User className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">Cliente no encontrado</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          El cliente que buscás no existe o fue eliminado.
        </p>
        <Button asChild className="mt-4">
          <a href="/app/customers">Volver a clientes</a>
        </Button>
      </div>
    );
  }

  const statusBadge = STATUS_BADGE[customer.status] ?? {
    variant: "secondary" as const,
    label: customer.status,
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <a href="/app/customers">
          <ArrowLeft className="size-4" />
          Volver a clientes
        </a>
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <User className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{customer.fullName}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              <span className="text-sm text-muted-foreground">ID: {customer.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Información de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-sm">{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground" />
                <span className="text-sm">{customer.phone}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-3">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="text-sm">{customer.address}</span>
              </div>
            )}
            {customer.notes && (
              <div className="flex items-start gap-3">
                <Briefcase className="size-4 text-muted-foreground mt-0.5" />
                <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
              </div>
            )}
            {!customer.email && !customer.phone && !customer.address && !customer.notes && (
              <p className="text-sm text-muted-foreground">No hay información de contacto.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Detalles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Responsable</span>
              <span>{customer.ownerName}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Empresa</span>
              {customer.companyId ? (
                <a
                  href={`/app/companies/${customer.companyId}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Building2 className="size-3" />
                  {customer.companyName ?? "Ver empresa"}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Creado</span>
              <span>{new Date(customer.createdAt).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Actualizado</span>
              <span>{new Date(customer.updatedAt).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {customer.deals && customer.deals.length > 0 ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Oportunidades ({customer.deals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {customer.deals.map((deal) => {
                const stageBadge = STAGE_BADGE[deal.stage] ?? {
                  variant: "secondary" as const,
                  label: deal.stage,
                };

                return (
                  <div key={deal.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <DollarSign className="size-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(deal.estimatedValue, deal.currency)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={stageBadge.variant} className="shrink-0">
                      {stageBadge.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Oportunidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">Sin oportunidades asociadas</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
