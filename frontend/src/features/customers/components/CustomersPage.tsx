import { useState, useEffect } from "react";
import { Download, Plus } from "lucide-react";
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
import { useCustomers, useDeleteCustomer } from "@/features/customers/hooks/useCustomers";
import { customersService } from "@/services/customers.service";
import { CustomersFilters } from "./CustomersFilters";
import { CustomersTable } from "./CustomersTable";
import { Pagination } from "@/features/companies/components/Pagination";
import type { Customer, CustomerFilters } from "@/types/customer";

export function CustomersPage() {
  return (
    <QueryProvider>
      <CustomersPageContent />
    </QueryProvider>
  );
}

function CustomersPageContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [page, setPage] = useState(1);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | undefined>();
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, companyId, ownerId]);

  const filters: CustomerFilters = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    companyId: companyId || undefined,
    ownerId: ownerId || undefined,
    page,
    limit: 20,
  };

  const { data, isLoading, isError } = useCustomers(filters);
  const deleteMutation = useDeleteCustomer();
  const { canCreate, canExport, canEdit, canDelete } = usePermissions();

  const customers = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters = !!(debouncedSearch || status || companyId || ownerId);

  function handleDeleteConfirm() {
    if (!deletingCustomer) return;
    deleteMutation.mutate(deletingCustomer.id, {
      onSuccess: () => setDeletingCustomer(undefined),
    });
  }

  async function handleExport() {
    setExporting(true);
    try {
      await customersService.exportCustomers({
        search: debouncedSearch || undefined,
        status: status || undefined,
        companyId: companyId || undefined,
        ownerId: ownerId || undefined,
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <div className="flex items-center gap-2">
          {canExport && (
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              <Download className="size-4" />
              {exporting ? "Exportando..." : "Exportar"}
            </Button>
          )}
          {canCreate && (
            <Button onClick={() => {}}>
              <Plus className="size-4" />
              Nuevo cliente
            </Button>
          )}
        </div>
      </div>

      <CustomersFilters
        search={search}
        status={status}
        companyId={companyId}
        ownerId={ownerId}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onCompanyChange={setCompanyId}
        onOwnerChange={setOwnerId}
      />

      <CustomersTable
        customers={customers}
        isLoading={isLoading}
        isError={isError}
        hasFilters={hasFilters}
        canCreate={canCreate}
        onCreateNew={() => {}}
        onEdit={() => {}}
        onDelete={setDeletingCustomer}
      />

      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      <Dialog open={!!deletingCustomer} onOpenChange={(open) => !open && setDeletingCustomer(undefined)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar cliente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar a <strong>{deletingCustomer?.fullName}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingCustomer(undefined)}
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
