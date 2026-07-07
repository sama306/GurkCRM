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
import { useCompanies, useDeleteCompany } from "@/features/companies/hooks/useCompanies";
import { CompaniesFilters } from "./CompaniesFilters";
import { CompaniesTable } from "./CompaniesTable";
import { CompanyFormDialog } from "./CompanyFormDialog";
import { Pagination } from "./Pagination";
import type { Company, CompanyFilters } from "@/types/company";

export function CompaniesPage() {
  return (
    <QueryProvider>
      <CompaniesPageContent />
    </QueryProvider>
  );
}

function CompaniesPageContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [size, setSize] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();
  const [deletingCompany, setDeletingCompany] = useState<Company | undefined>();

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, size]);

  const filters: CompanyFilters = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    size: size || undefined,
    page,
    limit: 20,
  };

  const { data, isLoading, isError } = useCompanies(filters);
  const deleteMutation = useDeleteCompany();

  const companies = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters = !!(debouncedSearch || status || size);

  function handleCreateNew() {
    setEditingCompany(undefined);
    setDialogOpen(true);
  }

  function handleEdit(company: Company) {
    setEditingCompany(company);
    setDialogOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deletingCompany) return;
    deleteMutation.mutate(deletingCompany.id, {
      onSuccess: () => setDeletingCompany(undefined),
    });
  }

  function handleDialogClose() {
    setDialogOpen(false);
    setEditingCompany(undefined);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Empresas</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="size-4" />
          Nueva empresa
        </Button>
      </div>

      <CompaniesFilters
        search={search}
        status={status}
        size={size}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSizeChange={setSize}
      />

      <CompaniesTable
        companies={companies}
        isLoading={isLoading}
        isError={isError}
        hasFilters={hasFilters}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDelete={setDeletingCompany}
      />

      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      <CompanyFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        company={editingCompany}
      />

      <Dialog open={!!deletingCompany} onOpenChange={(open) => !open && setDeletingCompany(undefined)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar empresa</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar <strong>{deletingCompany?.name}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingCompany(undefined)}
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
