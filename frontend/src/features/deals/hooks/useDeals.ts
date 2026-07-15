import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { dealsService } from "@/services/deals.service";
import type {
  DealFilters,
  CreateDealInput,
  UpdateDealInput,
  ChangeStageInput,
  Deal,
  DealBoard,
  DealStage,
} from "@/types/deal";

function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ error: { message: string } }>;
  return (
    axiosError.response?.data?.error?.message ?? "Ocurrió un error inesperado"
  );
}

export function useDeals(filters: DealFilters) {
  return useQuery({
    queryKey: ["deals", filters],
    queryFn: () => dealsService.getDeals(filters),
  });
}

export function useDealsBoard() {
  return useQuery({
    queryKey: ["deals", "board"],
    queryFn: () => dealsService.getDealsBoard(),
    staleTime: 0,
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ["deals", id],
    queryFn: () => dealsService.getDealById(id),
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDealInput) => dealsService.createDeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "board"] });
      toast.success("Negocio creado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealInput }) =>
      dealsService.updateDeal(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "board"] });
      queryClient.invalidateQueries({ queryKey: ["deals", variables.id] });
      toast.success("Negocio actualizado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useChangeDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeStageInput }) =>
      dealsService.changeDealStage(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["deals", "board"] });

      const previousBoard = queryClient.getQueryData<DealBoard>(["deals", "board"]);

      if (previousBoard) {
        const stages = Object.keys(previousBoard) as DealStage[];
        let dealToMove: Deal | undefined;

        const updatedBoard: DealBoard = { ...previousBoard };
        for (const stage of stages) {
          const idx = updatedBoard[stage].findIndex((d) => d.id === id);
          if (idx !== -1) {
            dealToMove = updatedBoard[stage][idx];
            updatedBoard[stage] = [
              ...updatedBoard[stage].slice(0, idx),
              ...updatedBoard[stage].slice(idx + 1),
            ];
            break;
          }
        }

        if (dealToMove) {
          const targetStage = data.stage as DealStage;
          const updatedDeal: Deal = {
            ...dealToMove,
            stage: data.stage,
            position: data.position,
            ...(data.lostReason ? { lostReason: data.lostReason } : {}),
          };
          const targetArr = [...(updatedBoard[targetStage] || [])];
          targetArr.splice(data.position, 0, updatedDeal);
          updatedBoard[targetStage] = targetArr;
        }

        queryClient.setQueryData<DealBoard>(["deals", "board"], updatedBoard);
      }

      return { previousBoard };
    },
    onError: (error, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(["deals", "board"], context.previousBoard);
      }
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["deals", "board"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dealsService.deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "board"] });
      toast.success("Negocio eliminado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
