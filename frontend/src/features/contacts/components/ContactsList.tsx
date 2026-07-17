import { useContactsByCompany } from "@/features/contacts/hooks/useContacts";
import type { Contact } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Briefcase, Pencil, Trash2, Plus, UserPlus } from "lucide-react";

interface ContactsListProps {
  companyId: string;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onAddClick: () => void;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
}

export function ContactsList({
  companyId,
  onEdit,
  onDelete,
  onAddClick,
  canEdit,
  canDelete,
  canCreate,
}: ContactsListProps) {
  const { data: contacts, isLoading, isError } = useContactsByCompany(companyId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Error al cargar los contactos.
      </p>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
        <UserPlus className="size-8 text-muted-foreground/40" />
        <p className="mt-2 text-sm text-muted-foreground">
          Esta empresa todavía no tiene contactos registrados
        </p>
        {canCreate && (
          <Button onClick={onAddClick} variant="outline" className="mt-3" size="sm">
            <Plus className="size-4" />
            Agregar contacto
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <Card key={contact.id} className="shadow-sm">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0 space-y-1.5">
              <p className="truncate font-medium">{contact.fullName}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {contact.position && (
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="size-3.5 shrink-0" />
                    <span className="truncate">{contact.position}</span>
                  </span>
                )}
                {contact.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3.5 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </span>
                )}
                {contact.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3.5 shrink-0" />
                    <span>{contact.phone}</span>
                  </span>
                )}
              </div>
            </div>
            {(canEdit || canDelete) && (
              <div className="flex shrink-0 items-center gap-1">
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(contact)}
                    title="Editar contacto"
                  >
                    <Pencil className="size-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(contact)}
                    title="Eliminar contacto"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
