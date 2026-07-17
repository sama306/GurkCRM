"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companiesRepository = void 0;
const prisma_1 = require("../../config/prisma");
const ALLOWED_SORT_FIELDS = ['name', 'industry', 'status', 'size', 'createdAt', 'updatedAt'];
exports.companiesRepository = {
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
        const sortBy = ALLOWED_SORT_FIELDS.includes(filters?.sortBy)
            ? filters.sortBy
            : 'createdAt';
        const order = filters?.order === 'asc' ? 'asc' : 'desc';
        return Promise.all([
            prisma_1.prisma.company.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: order },
            }),
            prisma_1.prisma.company.count({ where }),
        ]);
    },
    findById(id, organizationId) {
        return prisma_1.prisma.company.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: { contacts: true },
        });
    },
    create(data, organizationId) {
        return prisma_1.prisma.company.create({
            data: { ...data, organizationId },
        });
    },
    update(id, organizationId, data) {
        return prisma_1.prisma.company.updateMany({
            where: { id, organizationId, deletedAt: null },
            data,
        });
    },
    softDelete(id, organizationId) {
        return prisma_1.prisma.company.updateMany({
            where: { id, organizationId, deletedAt: null },
            data: { deletedAt: new Date() },
        });
    },
    countByOrganization(organizationId) {
        return prisma_1.prisma.company.count({
            where: { organizationId, deletedAt: null },
        });
    },
};
//# sourceMappingURL=companies.repository.js.map