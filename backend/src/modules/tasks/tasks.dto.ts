export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE'] as const;

export interface TaskResponseDTO {
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

export interface CreateTaskDTO {
  title: string;
  description?: string;
  assigneeId: string;
  relatedCustomerId?: string;
  relatedDealId?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string | null;
  assigneeId?: string;
  relatedCustomerId?: string | null;
  relatedDealId?: string | null;
  priority?: string;
  status?: string;
  dueDate?: string | null;
}

export interface ListTasksFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
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
