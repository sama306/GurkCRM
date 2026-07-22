import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Button } from "@/components/ui/button";
import { useDealsBoard, useChangeDealStage } from "@/features/deals/hooks/useDeals";
import { usePermissions } from "@/utils/permissions";
import { DealColumn } from "./DealColumn";
import { DealFormDialog } from "./DealFormDialog";
import type { Deal, DealBoard, DealStage } from "@/types/deal";

const STAGES: DealStage[] = [
  "NEW",
  "CONTACTED",
  "MEETING",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
];

export function KanbanBoard() {
  return (
    <QueryProvider>
      <KanbanBoardInner />
    </QueryProvider>
  );
}

function KanbanBoardInner() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: board, isLoading, isError } = useDealsBoard();
  const changeStageMutation = useChangeDealStage();
  const queryClient = useQueryClient();
  const { canCreate } = usePermissions();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const boardData = queryClient.getQueryData<DealBoard>(["deals", "board"]);
    if (!boardData) return;

    let activeStage: string | undefined;
    let activeIdx = -1;
    for (const [stage, deals] of Object.entries(boardData)) {
      const idx = deals.findIndex((d) => d.id === dealId);
      if (idx !== -1) {
        activeStage = stage;
        activeIdx = idx;
        break;
      }
    }
    if (!activeStage) return;

    const overId = over.id as string;
    let targetStage: string | undefined;
    let position = 0;

    if (overId.startsWith("column-")) {
      targetStage = overId.slice(7);
      position = boardData[targetStage as DealStage]?.length ?? 0;
    } else {
      for (const [stage, deals] of Object.entries(boardData)) {
        const idx = deals.findIndex((d) => d.id === overId);
        if (idx !== -1) {
          targetStage = stage;
          position = idx;
          break;
        }
      }
    }
    if (!targetStage) return;

    if (activeStage === targetStage && activeIdx === position) return;

    const activeDeal = boardData[activeStage as DealStage]?.[activeIdx];
    let lostReason: string | undefined;

    if (targetStage === "LOST" && !activeDeal?.lostReason) {
      const reason = window.prompt("¿Por qué se perdió este negocio?");
      if (!reason) return;
      lostReason = reason;
    }

    changeStageMutation.mutate({
      id: dealId,
      data: { stage: targetStage, position, lostReason },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        Cargando tablero...
      </div>
    );
  }

  if (isError || !board) {
    return (
      <div className="flex items-center justify-center py-32 text-destructive">
        Error al cargar el tablero.
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tablero de negocios</h2>
        {canCreate && (
          <Button onClick={() => setDialogOpen(true)}>
            Nueva oportunidad
          </Button>
        )}
      </div>

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <DealColumn
              key={stage}
              stage={stage}
              deals={board[stage] ?? []}
            />
          ))}
        </div>
        <DragOverlay>
          {null}
        </DragOverlay>
      </DndContext>

      <DealFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
