import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = [
  'fullName', 'email', 'status', 'ownerId', 'companyId', 'createdAt', 'updatedAt',
] as const;
type SortField = typeof ALLOWED_SORT_FIELDS[number];

export const customersRepository = {
  async findAll(
    organizationId: string,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      ownerId?: string;
      companyId?: string;
      sortBy?: string;
      order?: 'asc' | 'desc';
    },
  ) {
    const page = Math.max(filters?.page ?? 1, 1);
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      const matching = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT [id] FROM [Customer]
        WHERE [organizationId] = ${organizationId}
        AND [deletedAt] IS NULL
        AND ([fullName] COLLATE Modern_Spanish_CI_AI LIKE ${searchTerm}
             OR [email] COLLATE Modern_Spanish_CI_AI LIKE ${searchTerm})
      `;
      where.id = { in: matching.map((r) => r.id) };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    const sortBy: SortField = ALLOWED_SORT_FIELDS.includes(filters?.sortBy as SortField)
      ? (filters.sortBy as SortField)
      : 'createdAt';
    const order: 'asc' | 'desc' = filters?.order === 'asc' ? 'asc' : 'desc';

    return Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          company: { select: { name: true } },
          owner: { select: { fullName: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);
  },

  findById(id: string, organizationId: string) {
    return prisma.customer.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        company: { select: { id: true, name: true } },
        owner: { select: { id: true, fullName: true } },
        deals: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        // TODO: incluir comments y files cuando existan esos módulos
      },
    });
  },

  create(
    data: {
      fullName: string;
      email?: string;
      phone?: string;
      address?: string;
      notes?: string;
      companyId?: string;
      ownerId: string;
      status: string;
    },
    organizationId: string,
  ) {
    return prisma.customer.create({
      data: { ...data, organizationId },
      include: {
        company: { select: { name: true } },
        owner: { select: { fullName: true } },
      },
    });
  },

  update(
    id: string,
    organizationId: string,
    data: {
      fullName?: string;
      email?: string;
      phone?: string;
      address?: string;
      notes?: string;
      companyId?: string | null;
      ownerId?: string;
      status?: string;
    },
  ) {
    return prisma.customer.updateMany({
      where: { id, organizationId, deletedAt: null },
      data,
    });
  },

  softDelete(id: string, organizationId: string) {
    return prisma.customer.updateMany({
      where: { id, organizationId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  },

  async findAllForExport(
    organizationId: string,
    filters: {
      search?: string;
      status?: string;
      ownerId?: string;
      companyId?: string;
    },
  ) {
    const where: Prisma.CustomerWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      const matching = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT [id] FROM [Customer]
        WHERE [organizationId] = ${organizationId}
        AND [deletedAt] IS NULL
        AND ([fullName] COLLATE Modern_Spanish_CI_AI LIKE ${searchTerm}
             OR [email] COLLATE Modern_Spanish_CI_AI LIKE ${searchTerm})
      `;
      where.id = { in: matching.map((r) => r.id) };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    return prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true } },
        owner: { select: { fullName: true } },
      },
    });
  },
};
