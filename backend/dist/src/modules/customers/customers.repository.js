"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersRepository = void 0;
const prisma_1 = require("../../config/prisma");
const ALLOWED_SORT_FIELDS = [
    'fullName', 'email', 'status', 'ownerId', 'companyId', 'createdAt', 'updatedAt',
];
exports.customersRepository = {
    async findAll(organizationId, filters) {
        const page = Math.max(filters?.page ?? 1, 1);
        const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
        const skip = (page - 1) * limit;
        const where = {
            organizationId,
            deletedAt: null,
        };
        if (filters?.search) {
            const searchTerm = `%${filters.search}%`;
            const matching = await prisma_1.prisma.$queryRaw `
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
        const sortBy = ALLOWED_SORT_FIELDS.includes(filters?.sortBy)
            ? filters.sortBy
            : 'createdAt';
        const order = filters?.order === 'asc' ? 'asc' : 'desc';
        return Promise.all([
            prisma_1.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: order },
                include: {
                    company: { select: { name: true } },
                    owner: { select: { fullName: true } },
                },
            }),
            prisma_1.prisma.customer.count({ where }),
        ]);
    },
    findById(id, organizationId) {
        return prisma_1.prisma.customer.findFirst({
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
    create(data, organizationId) {
        return prisma_1.prisma.customer.create({
            data: { ...data, organizationId },
            include: {
                company: { select: { name: true } },
                owner: { select: { fullName: true } },
            },
        });
    },
    update(id, organizationId, data) {
        return prisma_1.prisma.customer.updateMany({
            where: { id, organizationId, deletedAt: null },
            data,
        });
    },
    softDelete(id, organizationId) {
        return prisma_1.prisma.customer.updateMany({
            where: { id, organizationId, deletedAt: null },
            data: { deletedAt: new Date() },
        });
    },
    async findAllForExport(organizationId, filters) {
        const where = {
            organizationId,
            deletedAt: null,
        };
        if (filters?.search) {
            const searchTerm = `%${filters.search}%`;
            const matching = await prisma_1.prisma.$queryRaw `
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
        return prisma_1.prisma.customer.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                company: { select: { name: true } },
                owner: { select: { fullName: true } },
            },
        });
    },
};
//# sourceMappingURL=customers.repository.js.map