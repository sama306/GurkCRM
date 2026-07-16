import { prisma } from '../../config/prisma';

export const usersRepository = {
  findByOrganization(organizationId: string, filters?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    roleName?: string;
  }) {
    const page = Math.max(filters?.page ?? 1, 1);
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { organizationId };

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    if (filters?.roleName) {
      where.role = { name: filters.roleName };
    }

    return Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { role: true },
      }),
      prisma.user.count({ where }),
    ]);
  },

  findActiveByOrganization(organizationId: string) {
    return prisma.user.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    });
  },

  findById(id: string, organizationId: string) {
    return prisma.user.findFirst({
      where: { id, organizationId },
      include: { role: true },
    });
  },

  findByIdUnscoped(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  },

  findRoleByName(name: string) {
    return prisma.role.findFirst({ where: { name } });
  },

  countOwnerUsers(organizationId: string) {
    return prisma.user.count({
      where: {
        organizationId,
        role: { name: 'OWNER' },
        isActive: true,
      },
    });
  },

  updateRole(id: string, organizationId: string, roleId: string) {
    return prisma.user.updateMany({
      where: { id, organizationId },
      data: { roleId },
    });
  },

  updateActiveStatus(id: string, organizationId: string, isActive: boolean) {
    return prisma.user.updateMany({
      where: { id, organizationId },
      data: { isActive },
    });
  },

  updateOwnProfile(id: string, data: { fullName?: string; avatarUrl?: string | null }) {
    return prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  },

  updateOwnPassword(id: string, newPasswordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });
  },
};
