import { AppError } from '../../shared/errors/AppError';
import { usersRepository } from '../users/users.repository';
import { customersRepository } from '../customers/customers.repository';
import { dealsRepository } from '../deals/deals.repository';
import { tasksRepository } from './tasks.repository';
import type {
  TaskResponseDTO,
  CreateTaskDTO,
  UpdateTaskDTO,
  ListTasksFilters,
  PaginatedResult,
} from './tasks.dto';

type TaskWithIncludes = Awaited<ReturnType<typeof tasksRepository.findById>>;

function toTaskResponse(task: NonNullable<TaskWithIncludes>): TaskResponseDTO {
  return {
    id: task.id,
    organizationId: task.organizationId,
    assigneeId: task.assigneeId,
    assigneeName: task.assignee.fullName,
    relatedCustomerId: task.relatedCustomerId ?? null,
    relatedCustomerTitle: task.customer?.fullName ?? null,
    relatedDealId: task.relatedDealId ?? null,
    relatedDealTitle: task.deal?.title ?? null,
    title: task.title,
    description: task.description ?? null,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

async function validateAssignee(assigneeId: string, organizationId: string) {
  const user = await usersRepository.findById(assigneeId, organizationId);
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'El usuario asignado no existe o no pertenece a esta organización');
  }
}

export const tasksService = {
  async listTasks(
    organizationId: string,
    filters?: ListTasksFilters,
  ): Promise<PaginatedResult<TaskResponseDTO>> {
    const [tasks, total] = await tasksRepository.findAll(organizationId, {
      page: filters?.page,
      limit: filters?.limit,
      search: filters?.search,
      status: filters?.status,
      priority: filters?.priority,
      assigneeId: filters?.assigneeId,
      dueDateFrom: filters?.dueDateFrom,
      dueDateTo: filters?.dueDateTo,
      sortBy: filters?.sortBy,
      order: filters?.order,
    });

    const page = Math.max(filters?.page ?? 1, 1);
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);

    return {
      data: tasks.map(toTaskResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getTaskById(organizationId: string, id: string): Promise<TaskResponseDTO> {
    const task = await tasksRepository.findById(id, organizationId);
    if (!task) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Tarea no encontrada');
    }
    return toTaskResponse(task);
  },

  async createTask(
    organizationId: string,
    data: CreateTaskDTO,
  ): Promise<TaskResponseDTO> {
    await validateAssignee(data.assigneeId, organizationId);

    if (data.relatedCustomerId) {
      const customer = await customersRepository.findById(data.relatedCustomerId, organizationId);
      if (!customer) {
        throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'El cliente relacionado no existe o no pertenece a esta organización');
      }
    }

    if (data.relatedDealId) {
      const deal = await dealsRepository.findById(data.relatedDealId, organizationId);
      if (!deal) {
        throw new AppError(404, 'DEAL_NOT_FOUND', 'El deal relacionado no existe o no pertenece a esta organización');
      }
    }

    const task = await tasksRepository.create(
      {
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        relatedCustomerId: data.relatedCustomerId,
        relatedDealId: data.relatedDealId,
        priority: data.priority ?? 'MEDIUM',
        status: data.status ?? 'PENDING',
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      organizationId,
    );

    return toTaskResponse(task);
  },

  async updateTask(
    actorId: string,
    actorRole: string,
    organizationId: string,
    id: string,
    data: UpdateTaskDTO,
  ): Promise<TaskResponseDTO> {
    const task = await tasksRepository.findById(id, organizationId);
    if (!task) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Tarea no encontrada');
    }

    const isOwnerOrAdmin = actorRole === 'OWNER' || actorRole === 'ADMIN';
    if (!isOwnerOrAdmin && task.assigneeId !== actorId) {
      throw new AppError(403, 'FORBIDDEN', 'No tenés permiso para modificar una tarea asignada a otro usuario');
    }

    if (data.assigneeId && data.assigneeId !== task.assigneeId) {
      await validateAssignee(data.assigneeId, organizationId);
    }

    if (data.relatedCustomerId !== undefined) {
      if (data.relatedCustomerId !== null) {
        const customer = await customersRepository.findById(data.relatedCustomerId, organizationId);
        if (!customer) {
          throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'El cliente relacionado no existe o no pertenece a esta organización');
        }
      }
    }

    if (data.relatedDealId !== undefined) {
      if (data.relatedDealId !== null) {
        const deal = await dealsRepository.findById(data.relatedDealId, organizationId);
        if (!deal) {
          throw new AppError(404, 'DEAL_NOT_FOUND', 'El deal relacionado no existe o no pertenece a esta organización');
        }
      }
    }

    const parsedData: Record<string, unknown> = {};
    if (data.title !== undefined) parsedData.title = data.title;
    if (data.description !== undefined) parsedData.description = data.description;
    if (data.assigneeId !== undefined) parsedData.assigneeId = data.assigneeId;
    if (data.relatedCustomerId !== undefined) parsedData.relatedCustomerId = data.relatedCustomerId;
    if (data.relatedDealId !== undefined) parsedData.relatedDealId = data.relatedDealId;
    if (data.priority !== undefined) parsedData.priority = data.priority;
    if (data.status !== undefined) parsedData.status = data.status;
    if (data.dueDate !== undefined) {
      parsedData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const { count } = await tasksRepository.update(id, organizationId, parsedData);
    if (count === 0) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Tarea no encontrada');
    }

    const updated = await tasksRepository.findById(id, organizationId);
    return toTaskResponse(updated!);
  },

  async deleteTask(
    actorId: string,
    actorRole: string,
    organizationId: string,
    id: string,
  ): Promise<void> {
    const task = await tasksRepository.findById(id, organizationId);
    if (!task) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Tarea no encontrada');
    }

    const isOwnerOrAdmin = actorRole === 'OWNER' || actorRole === 'ADMIN';
    if (!isOwnerOrAdmin && task.assigneeId !== actorId) {
      throw new AppError(403, 'FORBIDDEN', 'No tenés permiso para eliminar una tarea asignada a otro usuario');
    }

    const { count } = await tasksRepository.delete(id, organizationId);
    if (count === 0) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Tarea no encontrada');
    }
  },

  async updateTaskStatus(
    actorId: string,
    actorRole: string,
    organizationId: string,
    id: string,
    newStatus: string,
  ): Promise<TaskResponseDTO> {
    const task = await tasksRepository.findById(id, organizationId);
    if (!task) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Tarea no encontrada');
    }

    const isOwnerOrAdmin = actorRole === 'OWNER' || actorRole === 'ADMIN';
    if (!isOwnerOrAdmin && task.assigneeId !== actorId) {
      throw new AppError(403, 'FORBIDDEN', 'No tenés permiso para modificar una tarea asignada a otro usuario');
    }

    const { count } = await tasksRepository.updateStatus(id, organizationId, newStatus);
    if (count === 0) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Tarea no encontrada');
    }

    const updated = await tasksRepository.findById(id, organizationId);
    return toTaskResponse(updated!);
  },
};
