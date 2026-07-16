import { prisma } from '../../config/prisma';

export const settingsRepository = {
  findByOrganizationId(organizationId: string) {
    return prisma.organization.findUnique({
      where: { id: organizationId },
    });
  },

  update(organizationId: string, data: {
    name?: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    timezone?: string;
  }) {
    return prisma.organization.update({
      where: { id: organizationId },
      data,
    });
  },
};
