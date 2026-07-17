"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRepository = void 0;
const prisma_1 = require("../../config/prisma");
exports.usersRepository = {
    async findByOrganization(organizationId, filters) {
        const page = Math.max(filters?.page ?? 1, 1);
        const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
        const skip = (page - 1) * limit;
        const where = { organizationId };
        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters?.search) {
            const searchTerm = `%${filters.search}%`;
            const matching = await prisma_1.prisma.$queryRaw `
        SELECT [id] FROM [User]
        WHERE [organizationId] = ${organizationId}
        AND ([fullName] COLLATE Modern_Spanish_CI_AI LIKE ${searchTerm}
             OR [email] COLLATE Modern_Spanish_CI_AI LIKE ${searchTerm})
      `;
            where.id = { in: matching.map((r) => r.id) };
        }
        if (filters?.roleName) {
            where.role = { name: filters.roleName };
        }
        return Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { role: true },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
    },
    findActiveByOrganization(organizationId) {
        return prisma_1.prisma.user.findMany({
            where: { organizationId, isActive: true },
            select: { id: true, fullName: true },
            orderBy: { fullName: 'asc' },
        });
    },
    findById(id, organizationId) {
        return prisma_1.prisma.user.findFirst({
            where: { id, organizationId },
            include: { role: true },
        });
    },
    findByIdUnscoped(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
            include: { role: true },
        });
    },
    findRoleByName(name) {
        return prisma_1.prisma.role.findFirst({ where: { name } });
    },
    findRoleById(id) {
        return prisma_1.prisma.role.findUnique({ where: { id } });
    },
    findAllRoles() {
        return prisma_1.prisma.role.findMany({ orderBy: { name: 'asc' } });
    },
    countOwnerUsers(organizationId) {
        return prisma_1.prisma.user.count({
            where: {
                organizationId,
                role: { name: 'OWNER' },
                isActive: true,
            },
        });
    },
    updateRole(id, organizationId, roleId) {
        return prisma_1.prisma.user.updateMany({
            where: { id, organizationId },
            data: { roleId },
        });
    },
    updateActiveStatus(id, organizationId, isActive) {
        return prisma_1.prisma.user.updateMany({
            where: { id, organizationId },
            data: { isActive },
        });
    },
    updateOwnProfile(id, data) {
        return prisma_1.prisma.user.update({
            where: { id },
            data,
            include: { role: true },
        });
    },
    updateOwnPassword(id, newPasswordHash) {
        return prisma_1.prisma.user.update({
            where: { id },
            data: { passwordHash: newPasswordHash },
        });
    },
};
//# sourceMappingURL=users.repository.js.map