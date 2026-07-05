import { prisma } from '../../config/prisma';

export const contactsRepository = {
  findByCompany(companyId: string, organizationId: string) {
    return prisma.contact.findMany({
      where: {
        companyId,
        company: { organizationId },
      },
    });
  },

  findById(id: string, organizationId: string) {
    return prisma.contact.findFirst({
      where: {
        id,
        company: { organizationId },
      },
    });
  },

  create(companyId: string, data: {
    fullName: string;
    position?: string;
    email?: string;
    phone?: string;
    socialLinks?: string;
  }) {
    return prisma.contact.create({
      data: { ...data, companyId },
    });
  },

  update(id: string, data: {
    fullName?: string;
    position?: string;
    email?: string;
    phone?: string;
    socialLinks?: string;
  }) {
    return prisma.contact.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.contact.delete({ where: { id } });
  },
};
