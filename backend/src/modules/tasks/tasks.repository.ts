import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = [
  'title', 'priority', 'dueDate', 'status', 'assigneeId',
  'createdAt', 'updatedAt',
] as const;
type SortField = typeof ALLOWED_SORT_FIELDS[number];

const taskIncludes = {
  assignee: { select: { id: true, fullName: true } },
  customer: { select: { id: true, fullName: true } },
  deal: { select: { id: true, title: true } },
} as const;

export const tasksRepository = {
  findAll(
    organizationId: string,
    filters: {
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
    },
  ) {
    const page = Math.max(filters?.page ?? 1, 1);
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = { organizationId };

    if (filters?.search) {
      where.title = { contains: filters.search };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters?.dueDateFrom || filters?.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate.gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        where.dueDate.lte = new Date(filters.dueDateTo);
      }
    }

    const sortBy: SortField = ALLOWED_SORT_FIELDS.includes(filters?.sortBy as SortField)
      ? (filters.sortBy as SortField)
      : 'createdAt';
    const order: 'asc' | 'desc' = filters?.order === 'asc' ? 'asc' : 'desc';

    return Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: taskIncludes,
      }),
      prisma.task.count({ where }),
    ]);
  },

  findById(id: string, organizationId: string) {
    return prisma.task.findFirst({
      where: { id, organizationId },
      include: taskIncludes,
    });
  },

  create(
    data: {
      title: string;
      description?: string;
      assigneeId: string;
      relatedCustomerId?: string;
      relatedDealId?: string;
      priority: string;
      status: string;
      dueDate?: Date;
    },
    organizationId: string,
  ) {
    return prisma.task.create({
      data: { ...data, organizationId },
      include: taskIncludes,
    });
  },

  update(
    id: string,
    organizationId: string,
    data: Record<string, unknown>,
  ) {
    return prisma.task.updateMany({
      where: { id, organizationId },
      data,
    });
  },

  delete(id: string, organizationId: string) {
    return prisma.task.deleteMany({
      where: { id, organizationId },
    });
  },

  updateStatus(id: string, organizationId: string, newStatus: string) {
    return prisma.task.updateMany({
      where: { id, organizationId },
      data: { status: newStatus },
    });
  },
};
