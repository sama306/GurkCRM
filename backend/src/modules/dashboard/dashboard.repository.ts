import { prisma } from '../../config/prisma';

export const dashboardRepository = {
  countActiveCustomers(organizationId: string) {
    return prisma.customer.count({
      where: { organizationId, status: 'ACTIVE', deletedAt: null },
    });
  },

  countOpenDeals(organizationId: string) {
    return prisma.deal.count({
      where: {
        organizationId,
        deletedAt: null,
        stage: { notIn: ['WON', 'LOST'] },
      },
    });
  },

  async sumWonDealsThisMonth(organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const result = await prisma.deal.aggregate({
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

  countPendingTasks(organizationId: string, assigneeId?: string) {
    const where: {
      organizationId: string;
      status: { not: string };
      assigneeId?: string;
    } = {
      organizationId,
      status: { not: 'DONE' },
    };
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }
    return prisma.task.count({ where });
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
  async getRecentActivity(
    organizationId: string,
    limit = 10,
  ) {
    const [customers, deals, tasks] = await Promise.all([
      prisma.customer.findMany({
        where: { organizationId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, fullName: true, createdAt: true },
      }),
      prisma.deal.findMany({
        where: { organizationId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, title: true, createdAt: true },
      }),
      prisma.task.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, title: true, createdAt: true },
      }),
    ]);

    const mapped: Array<{
      id: string;
      type: 'CUSTOMER' | 'DEAL' | 'TASK';
      title: string;
      descriptionText: string;
      createdAt: Date;
    }> = [
      ...customers.map((c) => ({
        id: c.id,
        type: 'CUSTOMER' as const,
        title: c.fullName,
        descriptionText: `Nuevo cliente: ${c.fullName}`,
        createdAt: c.createdAt,
      })),
      ...deals.map((d) => ({
        id: d.id,
        type: 'DEAL' as const,
        title: d.title,
        descriptionText: `Nueva oportunidad: ${d.title}`,
        createdAt: d.createdAt,
      })),
      ...tasks.map((t) => ({
        id: t.id,
        type: 'TASK' as const,
        title: t.title,
        descriptionText: `Nueva tarea: ${t.title}`,
        createdAt: t.createdAt,
      })),
    ];

    mapped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return mapped.slice(0, limit);
  },
};
