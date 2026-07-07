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
import { Building2, ExternalLink, MoreHorizontal, Plus } from "lucide-react";
import type { Company } from "@/types/company";
import { usePermissions } from "@/utils/permissions";

interface CompaniesTableProps {
  companies: Company[];
  isLoading: boolean;
  isError: boolean;
  hasFilters: boolean;
  canCreate: boolean;
  onCreateNew: () => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

function LoadingSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Industria</TableHead>
          <TableHead>Sitio web</TableHead>
          <TableHead>Tamaño</TableHead>
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
      <Building2 className="size-12 text-muted-foreground/40" />
      <h3 className="mt-4 text-lg font-semibold">No se encontraron empresas</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasFilters
          ? "Intenta ajustar los filtros de búsqueda."
          : "Todavía no hay empresas registradas."}
      </p>
      {!hasFilters && canCreate && (
        <Button onClick={onCreateNew} className="mt-4">
          <Plus className="size-4" />
          Nueva empresa
        </Button>
      )}
    </div>
  );
}

const STATUS_BADGE: Record<string, { variant: "default" | "secondary"; label: string }> = {
  ACTIVE: { variant: "default", label: "Activo" },
  INACTIVE: { variant: "secondary", label: "Inactivo" },
};

function CompanyLink({ website }: { website: string | null }) {
  if (!website) return <span className="text-muted-foreground">—</span>;
  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {new URL(website).hostname}
      <ExternalLink className="size-3" />
    </a>
  );
}

export function CompaniesTable({
  companies,
  isLoading,
  isError,
  hasFilters,
  canCreate: _canCreate,
  onCreateNew,
  onEdit,
  onDelete,
}: CompaniesTableProps) {
  const { canEdit, canDelete } = usePermissions();
  const hasActions = canEdit || canDelete;

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-destructive">Error al cargar las empresas.</p>
      </div>
    );
  }

  if (companies.length === 0) {
    return <EmptyState hasFilters={hasFilters} canCreate={_canCreate} onCreateNew={onCreateNew} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Industria</TableHead>
          <TableHead>Sitio web</TableHead>
          <TableHead>Tamaño</TableHead>
          <TableHead>Estado</TableHead>
          {hasActions && <TableHead className="w-[50px]" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => {
          const badge = STATUS_BADGE[company.status] ?? {
            variant: "secondary" as const,
            label: company.status,
          };

          return (
            <TableRow
              key={company.id}
              className="cursor-pointer"
              onClick={() => {
                window.location.href = `/app/companies/${company.id}`;
              }}
            >
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {company.industry ?? "—"}
              </TableCell>
              <TableCell>
                <CompanyLink website={company.website} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {company.size ?? "—"}
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
                            onEdit(company);
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
                            onDelete(company);
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
