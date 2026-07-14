import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { contactsService } from "@/services/contacts.service";
import type { CreateContactInput, UpdateContactInput } from "@/types/contact";

function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ error: { message: string } }>;
  return (
    axiosError.response?.data?.error?.message ?? "Ocurrió un error inesperado"
  );
}

export function useContactsByCompany(companyId: string) {
  return useQuery({
    queryKey: ["contacts", "byCompany", companyId],
    queryFn: () => contactsService.getContactsByCompany(companyId),
    enabled: !!companyId,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: CreateContactInput }) =>
      contactsService.createContact(companyId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", "byCompany", variables.companyId],
      });
      toast.success("Contacto creado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, companyId }: { id: string; data: UpdateContactInput; companyId: string }) =>
      contactsService.updateContact(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", "byCompany", variables.companyId],
      });
      toast.success("Contacto actualizado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, companyId }: { id: string; companyId: string }) =>
      contactsService.deleteContact(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", "byCompany", variables.companyId],
      });
      toast.success("Contacto eliminado correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
