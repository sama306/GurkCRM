"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactsRepository = void 0;
const prisma_1 = require("../../config/prisma");
exports.contactsRepository = {
    findByCompany(companyId, organizationId) {
        return prisma_1.prisma.contact.findMany({
            where: {
                companyId,
                company: { organizationId },
            },
        });
    },
    findById(id, organizationId) {
        return prisma_1.prisma.contact.findFirst({
            where: {
                id,
                company: { organizationId },
            },
        });
    },
    create(companyId, data) {
        return prisma_1.prisma.contact.create({
            data: { ...data, companyId },
        });
    },
    update(id, data) {
        return prisma_1.prisma.contact.update({
            where: { id },
            data,
        });
    },
    delete(id) {
        return prisma_1.prisma.contact.delete({ where: { id } });
    },
};
//# sourceMappingURL=contacts.repository.js.map