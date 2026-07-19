import { prisma } from '../../config/prisma';

export const invitationsRepository = {
  create(data: {
    organizationId: string;
    email: string;
    roleId: string;
    invitedById: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.invitation.create({
      data,
      include: {
        role: { select: { name: true } },
        invitedBy: { select: { fullName: true } },
      },
    });
  },

  findById(id: string, organizationId: string) {
    return prisma.invitation.findFirst({
      where: { id, organizationId },
      include: {
        role: { select: { name: true } },
        invitedBy: { select: { fullName: true } },
      },
    });
  },

  findByOrganization(organizationId: string, status?: string) {
    const where: Record<string, unknown> = { organizationId };
    if (status) {
      where.status = status;
    }

    return prisma.invitation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        role: { select: { name: true } },
        invitedBy: { select: { fullName: true } },
      },
    });
  },

  findByTokenHash(tokenHash: string) {
    return prisma.invitation.findFirst({
      where: { tokenHash },
      include: {
        role: { select: { name: true, id: true } },
        organization: { select: { name: true } },
      },
    });
  },

  findPendingByEmailAndOrganization(email: string, organizationId: string) {
    return prisma.invitation.findFirst({
      where: { email, organizationId, status: 'PENDING' },
    });
  },

  updateStatus(id: string, status: string, extra?: { acceptedAt?: Date; revokedAt?: Date }) {
    return prisma.invitation.update({
      where: { id },
      data: { status, ...extra },
      include: {
        role: { select: { name: true } },
        invitedBy: { select: { fullName: true } },
      },
    });
  },

  revoke(id: string, organizationId: string) {
    return prisma.invitation.updateMany({
      where: { id, organizationId },
      data: { status: 'REVOKED', revokedAt: new Date() },
    });
  },
};
