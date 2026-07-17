import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { DealCard } from "./DealCard";
import type { Deal, DealStage } from "@/types/deal";

const STAGE_LABELS: Record<DealStage, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  MEETING: "Reunión",
  PROPOSAL: "Propuesta",
  NEGOTIATION: "Negociación",
  WON: "Ganado",
  LOST: "Perdido",
};

const STAGE_COLORS: Record<DealStage, string> = {
  NEW: "border-t-sky-500",
  CONTACTED: "border-t-blue-500",
  MEETING: "border-t-indigo-500",
  PROPOSAL: "border-t-violet-500",
  NEGOTIATION: "border-t-amber-500",
  WON: "border-t-emerald-500",
  LOST: "border-t-rose-500",
};

interface DealColumnProps {
  stage: DealStage;
  deals: Deal[];
}

export function DealColumn({ stage, deals }: DealColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${stage}`,
  });

  return (
    <div
      className={cn(
        "flex w-[280px] shrink-0 flex-col rounded-xl border-t-4 bg-muted/50 pt-3",
        STAGE_COLORS[stage],
        isOver && "bg-muted/70 ring-2 ring-primary/20",
      )}
    >
      <div className="mb-3 flex items-center justify-between px-3">
        <h3 className="text-sm font-semibold text-foreground">
          {STAGE_LABELS[stage]}
        </h3>
        <span className="flex size-6 items-center justify-center rounded-full bg-muted-foreground/10 text-xs font-medium text-muted-foreground">
          {deals.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-3"
      >
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
