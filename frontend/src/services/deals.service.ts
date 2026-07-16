import { apiClient } from "./api-client";
import type {
  Deal,
  DealBoard,
  CreateDealInput,
  UpdateDealInput,
  ChangeStageInput,
  DealFilters,
  PaginatedResult,
} from "@/types/deal";

export const dealsService = {
  getDeals(filters: DealFilters) {
    return apiClient
      .get<PaginatedResult<Deal>>("/deals", { params: filters })
      .then((res) => res.data);
  },

  getDealsBoard() {
    return apiClient.get<DealBoard>("/deals/board").then((res) => res.data);
  },

  getDealById(id: string) {
    return apiClient.get<Deal>(`/deals/${id}`).then((res) => res.data);
  },

  createDeal(data: CreateDealInput) {
    return apiClient.post<Deal>("/deals", data).then((res) => res.data);
  },

  updateDeal(id: string, data: UpdateDealInput) {
    return apiClient.patch<Deal>(`/deals/${id}`, data).then((res) => res.data);
  },

  changeDealStage(id: string, data: ChangeStageInput) {
    return apiClient.patch<Deal>(`/deals/${id}/stage`, data).then((res) => res.data);
  },

  deleteDeal(id: string) {
    return apiClient.delete(`/deals/${id}`).then((res) => res.data);
  },
};
