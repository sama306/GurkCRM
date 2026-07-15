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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, MoreHorizontal, Plus } from "lucide-react";
import type { Customer } from "@/types/customer";
import { usePermissions } from "@/utils/permissions";

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  isError: boolean;
  hasFilters: boolean;
  canCreate: boolean;
  onCreateNew: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

function LoadingSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead>Estado</TableHead>
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

function EmptyState({ hasFilters, canCreate, onCreateNew }: { hasFilters: boolean; canCreate: boolean; onCreateNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Users className="size-12 text-muted-foreground/40" />
      <h3 className="mt-4 text-lg font-semibold">No se encontraron clientes</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasFilters
          ? "Intenta ajustar los filtros de búsqueda."
          : "Todavía no hay clientes registrados."}
      </p>
      {!hasFilters && canCreate && (
        <Button onClick={onCreateNew} className="mt-4">
          <Plus className="size-4" />
          Nuevo cliente
        </Button>
      )}
    </div>
  );
}

const STATUS_BADGE: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
  LEAD: { variant: "outline", label: "Lead" },
  ACTIVE: { variant: "default", label: "Activo" },
  INACTIVE: { variant: "secondary", label: "Inactivo" },
};

export function CustomersTable({
  customers,
  isLoading,
  isError,
  hasFilters,
  canCreate: _canCreate,
  onCreateNew,
  onEdit,
  onDelete,
}: CustomersTableProps) {
  const { canEdit, canDelete } = usePermissions();
  const hasActions = canEdit || canDelete;

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-destructive">Error al cargar los clientes.</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return <EmptyState hasFilters={hasFilters} canCreate={_canCreate} onCreateNew={onCreateNew} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead>Estado</TableHead>
          {hasActions && <TableHead className="w-[50px]" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => {
          const badge = STATUS_BADGE[customer.status] ?? {
            variant: "secondary" as const,
            label: customer.status,
          };

          return (
            <TableRow
              key={customer.id}
              className="cursor-pointer"
              onClick={() => {
                window.location.href = `/app/customers/${customer.id}`;
              }}
            >
              <TableCell className="font-medium">{customer.fullName}</TableCell>
              <TableCell className="text-muted-foreground">
                {customer.email ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {customer.companyName ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {customer.ownerName}
              </TableCell>
              <TableCell>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </TableCell>
              <TableCell>
                {hasActions ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEdit && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(customer);
                          }}
                        >
                          Editar
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(customer);
                          }}
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
