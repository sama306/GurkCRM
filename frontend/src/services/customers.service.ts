import { apiClient } from "./api-client";
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerFilters,
  PaginatedResult,
} from "@/types/customer";

export const customersService = {
  getCustomers(filters: CustomerFilters) {
    return apiClient
      .get<PaginatedResult<Customer>>("/customers", { params: filters })
      .then((res) => res.data);
  },

  getCustomerById(id: string) {
    return apiClient.get<Customer>(`/customers/${id}`).then((res) => res.data);
  },

  createCustomer(data: CreateCustomerInput) {
    return apiClient.post<Customer>("/customers", data).then((res) => res.data);
  },

  updateCustomer(id: string, data: UpdateCustomerInput) {
    return apiClient.patch<Customer>(`/customers/${id}`, data).then((res) => res.data);
  },

  deleteCustomer(id: string) {
    return apiClient.delete(`/customers/${id}`).then((res) => res.data);
  },

  async exportCustomers(filters?: Omit<CustomerFilters, "page" | "limit" | "sortBy" | "order">) {
    const response = await apiClient.get("/customers/export", {
      params: filters,
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clientes_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
