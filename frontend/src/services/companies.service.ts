import { apiClient } from "./api-client";
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyFilters,
  PaginatedResult,
} from "@/types/company";

export const companiesService = {
  getCompanies(filters: CompanyFilters) {
    return apiClient
      .get<PaginatedResult<Company>>("/companies", { params: filters })
      .then((res) => res.data);
  },

  getCompanyById(id: string) {
    return apiClient.get<Company>(`/companies/${id}`).then((res) => res.data);
  },

  createCompany(data: CreateCompanyInput) {
    return apiClient.post<Company>("/companies", data).then((res) => res.data);
  },

  updateCompany(id: string, data: UpdateCompanyInput) {
    return apiClient.patch<Company>(`/companies/${id}`, data).then((res) => res.data);
  },

  deleteCompany(id: string) {
    return apiClient.delete(`/companies/${id}`).then((res) => res.data);
  },
};
