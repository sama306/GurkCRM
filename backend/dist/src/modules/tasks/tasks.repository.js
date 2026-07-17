"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksRepository = void 0;
const prisma_1 = require("../../config/prisma");
const ALLOWED_SORT_FIELDS = [
    'title', 'priority', 'dueDate', 'status', 'assigneeId',
    'createdAt', 'updatedAt',
];
const taskIncludes = {
    assignee: { select: { id: true, fullName: true } },
    customer: { select: { id: true, fullName: true } },
    deal: { select: { id: true, title: true } },
};
exports.tasksRepository = {
    findAll(organizationId, filters) {
        const page = Math.max(filters?.page ?? 1, 1);
        const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
        const skip = (page - 1) * limit;
        const where = { organizationId };
        if (filters?.search) {
            where.title = { contains: filters.search };
        }
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.priority) {
            where.priority = filters.priority;
        }
        if (filters?.assigneeId) {
            where.assigneeId = filters.assigneeId;
        }
        if (filters?.dueDateFrom || filters?.dueDateTo) {
            where.dueDate = {};
            if (filters.dueDateFrom) {
                where.dueDate.gte = new Date(filters.dueDateFrom);
            }
            if (filters.dueDateTo) {
                where.dueDate.lte = new Date(filters.dueDateTo);
            }
        }
        const sortBy = ALLOWED_SORT_FIELDS.includes(filters?.sortBy)
            ? filters.sortBy
            : 'createdAt';
        const order = filters?.order === 'asc' ? 'asc' : 'desc';
        return Promise.all([
            prisma_1.prisma.task.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: order },
                include: taskIncludes,
            }),
            prisma_1.prisma.task.count({ where }),
        ]);
    },
    findById(id, organizationId) {
        return prisma_1.prisma.task.findFirst({
            where: { id, organizationId },
            include: taskIncludes,
        });
    },
    create(data, organizationId) {
        return prisma_1.prisma.task.create({
            data: { ...data, organizationId },
            include: taskIncludes,
        });
    },
    update(id, organizationId, data) {
        return prisma_1.prisma.task.updateMany({
            where: { id, organizationId },
            data,
        });
    },
    delete(id, organizationId) {
        return prisma_1.prisma.task.deleteMany({
            where: { id, organizationId },
        });
    },
    updateStatus(id, organizationId, newStatus) {
        return prisma_1.prisma.task.updateMany({
            where: { id, organizationId },
            data: { status: newStatus },
        });
    },
};
//# sourceMappingURL=tasks.repository.js.map