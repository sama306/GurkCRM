import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/utils/permissions";
import { useDeleteDeal } from "@/features/deals/hooks/useDeals";
import { DealFormDialog } from "@/features/deals/components/DealFormDialog";
import type { Deal } from "@/types/deal";

interface DealCardProps {
  deal: Deal;
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function OwnerAvatar({ name }: { name: string }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";
  return (
    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
      {initial}
    </span>
  );
}

function DealCardActions({ deal }: { deal: Deal }) {
  const [editOpen, setEditOpen] = useState(false);
  const { canEdit, canDelete } = usePermissions();
  const deleteMutation = useDeleteDeal();

  function handleDelete() {
    if (window.confirm(`¿Eliminar el negocio "${deal.title}"?`)) {
      deleteMutation.mutate(deal.id);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-6 rounded-md text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-32">
          {canEdit && (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              Editar
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              variant="destructive"
              onClick={handleDelete}
            >
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {editOpen && (
        <DealFormDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          deal={deal}
        />
      )}
    </>
  );
}

export function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab touch-none rounded-lg border bg-card p-3 text-sm shadow-sm transition-all duration-200 ease-out hover:shadow-md active:cursor-grabbing",
        isDragging && "z-10 opacity-60 shadow-xl ring-2 ring-primary/30",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-medium leading-snug text-foreground">
          {deal.title}
        </span>
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="shrink-0"
        >
          <DealCardActions deal={deal} />
        </div>
      </div>
      <div className="mb-2 text-sm font-semibold text-primary">
        {formatCurrency(deal.estimatedValue, deal.currency)}
      </div>
      <div className="flex items-center justify-between">
        <span className="truncate text-xs text-muted-foreground">
          {deal.customerName}
        </span>
        <OwnerAvatar name={deal.ownerName} />
      </div>
    </div>
  );
}