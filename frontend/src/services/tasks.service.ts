import { apiClient } from "./api-client";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  ChangeStatusInput,
  TaskFilters,
  PaginatedResult,
} from "@/types/task";

export const tasksService = {
  getTasks(filters: TaskFilters) {
    return apiClient
      .get<PaginatedResult<Task>>("/tasks", { params: filters })
      .then((res) => res.data);
  },

  getTaskById(id: string) {
    return apiClient.get<Task>(`/tasks/${id}`).then((res) => res.data);
  },

  createTask(data: CreateTaskInput) {
    return apiClient.post<Task>("/tasks", data).then((res) => res.data);
  },

  updateTask(id: string, data: UpdateTaskInput) {
    return apiClient.patch<Task>(`/tasks/${id}`, data).then((res) => res.data);
  },

  changeTaskStatus(id: string, data: ChangeStatusInput) {
    return apiClient.patch<Task>(`/tasks/${id}/status`, data).then((res) => res.data);
  },

  deleteTask(id: string) {
    return apiClient.delete(`/tasks/${id}`).then((res) => res.data);
  },
};
