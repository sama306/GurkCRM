import { prisma } from '../../config/prisma';
import type { Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = ['name', 'industry', 'status', 'size', 'createdAt', 'updatedAt'] as const;
type SortField = typeof ALLOWED_SORT_FIELDS[number];

export const companiesRepository = {
  async findAll(
    organizationId: string,
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      industry?: string;
      status?: string;
      size?: string;
      sortBy?: string;
      order?: 'asc' | 'desc';
    },
  ) {
    const page = Math.max(filters?.page ?? 1, 1);
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CompanyWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      const matching = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT [id] FROM [Company]
        WHERE [organizationId] = ${organizationId}
        AND [deletedAt] IS NULL
        AND [name] COLLATE Modern_Spanish_CI_AI LIKE ${searchTerm}
      `;
      where.id = { in: matching.map((r) => r.id) };
    }

    if (filters?.industry) {
      where.industry = filters.industry;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.size) {
      where.size = filters.size;
    }

    const sortBy: SortField = ALLOWED_SORT_FIELDS.includes(filters?.sortBy as SortField)
      ? (filters.sortBy as SortField)
      : 'createdAt';
    const order: 'asc' | 'desc' = filters?.order === 'asc' ? 'asc' : 'desc';

    return Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.company.count({ where }),
    ]);
  },

  findById(id: string, organizationId: string) {
    return prisma.company.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: { contacts: true },
    });
  },

  create(data: {
    name: string;
    industry?: string;
    website?: string;
    address?: string;
    size?: string;
    status: string;
  }, organizationId: string) {
    return prisma.company.create({
      data: { ...data, organizationId },
    });
  },

  update(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      industry?: string;
      website?: string;
      address?: string;
      size?: string;
      status?: string;
    },
  ) {
    return prisma.company.updateMany({
      where: { id, organizationId, deletedAt: null },
      data,
    });
  },

  softDelete(id: string, organizationId: string) {
    return prisma.company.updateMany({
      where: { id, organizationId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  },

  countByOrganization(organizationId: string) {
    return prisma.company.count({
      where: { organizationId, deletedAt: null },
    });
  },
};
