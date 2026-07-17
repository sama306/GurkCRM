"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRepository = void 0;
const prisma_1 = require("../../config/prisma");
exports.dashboardRepository = {
    countActiveCustomers(organizationId) {
        return prisma_1.prisma.customer.count({
            where: { organizationId, status: 'ACTIVE', deletedAt: null },
        });
    },
    countOpenDeals(organizationId) {
        return prisma_1.prisma.deal.count({
            where: {
                organizationId,
                deletedAt: null,
                stage: { notIn: ['WON', 'LOST'] },
            },
        });
    },
    async sumWonDealsThisMonth(organizationId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const result = await prisma_1.prisma.deal.aggregate({
            where: {
                organizationId,
                deletedAt: null,
                stage: 'WON',
                updatedAt: { gte: startOfMonth, lt: startOfNextMonth },
            },
            _sum: { estimatedValue: true },
        });
        return Number(result._sum.estimatedValue ?? 0);
    },
    countPendingTasks(organizationId, assigneeId) {
        const where = {
            organizationId,
            status: { not: 'DONE' },
        };
        if (assigneeId) {
            where.assigneeId = assigneeId;
        }
        return prisma_1.prisma.task.count({ where });
    },
    /*
     * ── getRecentActivity ────────────────────────────────────────────────────
     *
     * Construye un feed combinado de los registros más recientes creados en
     * Customer, Deal y Task.
     *
     * ⚠️  Limitación conocida:
     *   Esto es un sustituto simplificado hasta que exista el módulo Activity
     *   real (Fase 2/7 según docs/07-funcionalidades.md). El módulo Activity
     *   proveerá auditoría con acciones (CREATED/UPDATED/DELETED), metadatos
     *   y autor. Este feed solo refleja CREATED en 3 tablas, sin información
     *   de quién realizó la acción.
     *
     * ─────────────────────────────────────────────────────────────────────────
     */
    async getRecentActivity(organizationId, limit = 10) {
        const [customers, deals, tasks] = await Promise.all([
            prisma_1.prisma.customer.findMany({
                where: { organizationId, deletedAt: null },
                orderBy: { createdAt: 'desc' },
                take: limit,
                select: { id: true, fullName: true, createdAt: true },
            }),
            prisma_1.prisma.deal.findMany({
                where: { organizationId, deletedAt: null },
                orderBy: { createdAt: 'desc' },
                take: limit,
                select: { id: true, title: true, createdAt: true },
            }),
            prisma_1.prisma.task.findMany({
                where: { organizationId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                select: { id: true, title: true, createdAt: true },
            }),
        ]);
        const mapped = [
            ...customers.map((c) => ({
                id: c.id,
                type: 'CUSTOMER',
                title: c.fullName,
                descriptionText: `Nuevo cliente: ${c.fullName}`,
                createdAt: c.createdAt,
            })),
            ...deals.map((d) => ({
                id: d.id,
                type: 'DEAL',
                title: d.title,
                descriptionText: `Nueva oportunidad: ${d.title}`,
                createdAt: d.createdAt,
            })),
            ...tasks.map((t) => ({
                id: t.id,
                type: 'TASK',
                title: t.title,
                descriptionText: `Nueva tarea: ${t.title}`,
                createdAt: t.createdAt,
            })),
        ];
        mapped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return mapped.slice(0, limit);
    },
};
//# sourceMappingURL=dashboard.repository.js.map