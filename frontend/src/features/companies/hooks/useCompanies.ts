import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { companiesService } from "@/services/companies.service";
import type {
  CompanyFilters,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "@/types/company";

function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ error: { message: string } }>;
  return (
    axiosError.response?.data?.error?.message ?? "Ocurrió un error inesperado"
  );
}

export function useCompanies(filters: CompanyFilters) {
  return useQuery({
    queryKey: ["companies", filters],
    queryFn: () => companiesService.getCompanies(filters),
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ["companies", id],
    queryFn: () => companiesService.getCompanyById(id),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyInput) => companiesService.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Empresa creada correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyInput }) =>
      companiesService.updateCompany(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies", variables.id] });
      toast.success("Empresa actualizada correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companiesService.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Empresa eliminada correctamente");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
