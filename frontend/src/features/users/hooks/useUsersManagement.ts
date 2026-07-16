import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { usersService } from "@/services/users.service";
import type { UserFilters, UpdateUserInput } from "@/types/user";

function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ error: { message: string } }>;
  return (
    axiosError.response?.data?.error?.message ?? "Ocurrió un error inesperado"
  );
}

export function useUsersList(filters: UserFilters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersService.getUsers(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => usersService.getUserById(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersService.updateUser(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
      toast.success("Usuario actualizado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
