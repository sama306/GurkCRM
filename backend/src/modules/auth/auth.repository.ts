import { prisma } from '../../config/prisma';

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  },

  findRoleByNameAndOrganization(name: string, organizationId?: string) {
    return prisma.role.findFirst({
      where: {
        name,
        // Roles are global in the current schema (no organizationId on Role)
        // This method exists for future scoping if needed
      },
    });
  },

  createOrganization(data: { name: string; timezone?: string }) {
    return prisma.organization.create({
      data: {
        name: data.name,
        timezone: data.timezone ?? 'UTC',
      },
    });
  },

  createUser(data: {
    organizationId: string;
    roleId: string;
    fullName: string;
    email: string;
    passwordHash: string;
  }) {
    return prisma.user.create({
      data: {
        organizationId: data.organizationId,
        roleId: data.roleId,
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        isActive: true,
      },
      include: { role: true },
    });
  },

  findActiveRefreshTokensByUserId(userId: string) {
    return prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  },

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  },

  revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async createOrganizationWithOwner(data: {
    organizationName: string;
    fullName: string;
    email: string;
    passwordHash: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.organizationName,
          timezone: 'UTC',
        },
      });

      let ownerRole = await tx.role.findFirst({ where: { name: 'OWNER' } });
      if (!ownerRole) {
        ownerRole = await tx.role.create({
          data: {
            name: 'OWNER',
            permissions: JSON.stringify({
              users: { read: true, create: true, update: true, delete: true },
              settings: { read: true, create: true, update: true, delete: true },
              companies: { read: true, create: true, update: true, delete: true },
              customers: { read: true, create: true, update: true, delete: true },
              contacts: { read: true, create: true, update: true, delete: true },
              deals: { read: true, create: true, update: true, delete: true },
              tasks: { read: true, create: true, update: true, delete: true },
              dashboard: { read: true },
            }),
          },
        });
      }

      const user = await tx.user.create({
        data: {
          organizationId: org.id,
          roleId: ownerRole.id,
          fullName: data.fullName,
          email: data.email,
          passwordHash: data.passwordHash,
          isActive: true,
        },
        include: { role: true },
      });

      return { user, org };
    });
  },

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  },
};
