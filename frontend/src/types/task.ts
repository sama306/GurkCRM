export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: string;
  organizationId: string;
  assigneeId: string;
  assigneeName: string;
  relatedCustomerId: string | null;
  relatedCustomerTitle: string | null;
  relatedDealId: string | null;
  relatedDealTitle: string | null;
  title: string;
  description: string | null;
  priority: string;
  dueDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  assigneeId: string;
  relatedCustomerId?: string;
  relatedDealId?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  assigneeId?: string;
  relatedCustomerId?: string | null;
  relatedDealId?: string | null;
  priority?: string;
  status?: string;
  dueDate?: string | null;
}

export interface ChangeStatusInput {
  status: string;
}

export interface TaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  dueDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
