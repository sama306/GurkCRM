import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
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
        "cursor-grab touch-none rounded-lg border bg-card p-3 text-sm shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
        isDragging && "z-10 opacity-50 shadow-lg ring-2 ring-primary/30",
      )}
    >
      <div className="mb-2 font-medium leading-snug text-foreground">
        {deal.title}
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
