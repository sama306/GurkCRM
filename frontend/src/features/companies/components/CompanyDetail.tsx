import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { useCompany } from "@/features/companies/hooks/useCompanies";
import { usePermissions } from "@/utils/permissions";
import { useDeleteContact } from "@/features/contacts/hooks/useContacts";
import { ContactsList } from "@/features/contacts/components/ContactsList";
import { ContactFormDialog } from "@/features/contacts/components/ContactFormDialog";
import { ArrowLeft, Building2, ExternalLink, Globe, MapPin, Plus, UserPlus, Users } from "lucide-react";
import type { Contact } from "@/types/contact";

interface CompanyDetailProps {
  id: string;
}

export function CompanyDetail({ id }: CompanyDetailProps) {
  return (
    <QueryProvider>
      <CompanyDetailContent id={id} />
    </QueryProvider>
  );
}

const STATUS_BADGE: Record<string, { variant: "default" | "secondary"; label: string }> = {
  ACTIVE: { variant: "default", label: "Activo" },
  INACTIVE: { variant: "secondary", label: "Inactivo" },
};

function CompanyDetailContent({ id }: { id: string }) {
  const { data: company, isLoading, isError } = useCompany(id);
  const { canCreate, canEdit, canDelete } = usePermissions();
  const deleteContactMutation = useDeleteContact();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [deletingContact, setDeletingContact] = useState<Contact | undefined>();

  function handleAddContact() {
    setEditingContact(undefined);
    setContactDialogOpen(true);
  }

  function handleEditContact(contact: Contact) {
    setEditingContact(contact);
    setContactDialogOpen(true);
  }

  function handleDeleteContactConfirm() {
    if (!deletingContact) return;
    deleteContactMutation.mutate(
      { id: deletingContact.id, companyId: id },
      { onSuccess: () => setDeletingContact(undefined) },
    );
  }

  function handleContactDialogClose() {
    setContactDialogOpen(false);
    setEditingContact(undefined);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Building2 className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">Empresa no encontrada</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          La empresa que buscás no existe o fue eliminada.
        </p>
        <Button asChild className="mt-4">
          <a href="/app/companies">Volver a empresas</a>
        </Button>
      </div>
    );
  }

  const badge = STATUS_BADGE[company.status] ?? {
    variant: "secondary" as const,
    label: company.status,
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <a href="/app/companies">
          <ArrowLeft className="size-4" />
          Volver a empresas
        </a>
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={badge.variant}>{badge.label}</Badge>
              {company.industry && (
                <span className="text-sm text-muted-foreground">{company.industry}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Información general</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.website && (
              <div className="flex items-center gap-3">
                <Globe className="size-4 text-muted-foreground" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {new URL(company.website).hostname}
                  <ExternalLink className="size-3" />
                </a>
              </div>
            )}
            {company.size && (
              <div className="flex items-center gap-3">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm">{company.size} empleados</span>
              </div>
            )}
            {company.address && (
              <div className="flex items-center gap-3">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="text-sm">{company.address}</span>
              </div>
            )}
            {!company.website && !company.size && !company.address && (
              <p className="text-sm text-muted-foreground">No hay información adicional.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Detalles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ID</span>
              <span className="font-mono text-xs">{company.id}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Creado</span>
              <span>{new Date(company.createdAt).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Actualizado</span>
              <span>{new Date(company.updatedAt).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Contactos</h2>
          </div>
          {canCreate && (
            <Button onClick={handleAddContact} size="sm">
              <Plus className="size-4" />
              Agregar contacto
            </Button>
          )}
        </div>

        <ContactsList
          companyId={id}
          onEdit={handleEditContact}
          onDelete={setDeletingContact}
          onAddClick={handleAddContact}
          canEdit={canEdit}
          canDelete={canDelete}
          canCreate={canCreate}
        />
      </section>

      <ContactFormDialog
        open={contactDialogOpen}
        onClose={handleContactDialogClose}
        companyId={id}
        contact={editingContact}
      />

      <Dialog
        open={!!deletingContact}
        onOpenChange={(open) => !open && setDeletingContact(undefined)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar contacto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar a{" "}
              <strong>{deletingContact?.fullName}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingContact(undefined)}
              disabled={deleteContactMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteContactConfirm}
              disabled={deleteContactMutation.isPending}
            >
              {deleteContactMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
