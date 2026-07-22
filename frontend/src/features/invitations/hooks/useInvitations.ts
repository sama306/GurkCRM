import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { invitationsService } from "@/services/invitations.service";
import type { CreateInvitationInput } from "@/types/invitation";

function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ error: { message: string } }>;
  return (
    axiosError.response?.data?.error?.message ?? "Ocurrió un error inesperado"
  );
}

export function useInvitations(status?: string) {
  return useQuery({
    queryKey: ["invitations", status],
    queryFn: () => invitationsService.listInvitations(status),
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvitationInput) =>
      invitationsService.createInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitación enviada correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invitationsService.revokeInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitación revocada");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
