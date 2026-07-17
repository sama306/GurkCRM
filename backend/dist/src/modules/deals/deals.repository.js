"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealsRepository = void 0;
const prisma_1 = require("../../config/prisma");
const client_1 = require("@prisma/client");
const deals_dto_1 = require("./deals.dto");
const ALLOWED_SORT_FIELDS = [
    'title', 'stage', 'estimatedValue', 'currency', 'position',
    'customerId', 'companyId', 'ownerId', 'createdAt', 'updatedAt',
];
const dealIncludes = {
    customer: { select: { id: true, fullName: true } },
    company: { select: { id: true, name: true } },
    owner: { select: { id: true, fullName: true } },
};
exports.dealsRepository = {
    findAll(organizationId, filters) {
        const page = Math.max(filters?.page ?? 1, 1);
        const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
        const skip = (page - 1) * limit;
        const where = {
            organizationId,
            deletedAt: null,
        };
        if (filters?.search) {
            where.title = { contains: filters.search };
        }
        if (filters?.stage) {
            where.stage = filters.stage;
        }
        if (filters?.ownerId) {
            where.ownerId = filters.ownerId;
        }
        if (filters?.customerId) {
            where.customerId = filters.customerId;
        }
        const sortBy = ALLOWED_SORT_FIELDS.includes(filters?.sortBy)
            ? filters.sortBy
            : 'createdAt';
        const order = filters?.order === 'asc' ? 'asc' : 'desc';
        return Promise.all([
            prisma_1.prisma.deal.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: order },
                include: dealIncludes,
            }),
            prisma_1.prisma.deal.count({ where }),
        ]);
    },
    findById(id, organizationId) {
        return prisma_1.prisma.deal.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: dealIncludes,
        });
    },
    async findBoard(organizationId) {
        const deals = await prisma_1.prisma.deal.findMany({
            where: { organizationId, deletedAt: null },
            orderBy: { position: 'asc' },
            include: dealIncludes,
        });
        const empty = Object.fromEntries(deals_dto_1.DEAL_STAGES.map((s) => [s, []]));
        return deals.reduce((acc, deal) => {
            acc[deal.stage].push(deal);
            return acc;
        }, empty);
    },
    async create(data, organizationId) {
        const maxPosition = await prisma_1.prisma.deal.aggregate({
            where: { organizationId, stage: data.stage, deletedAt: null },
            _max: { position: true },
        });
        const position = (maxPosition._max.position ?? -1) + 1;
        return prisma_1.prisma.deal.create({
            data: { ...data, position, organizationId },
            include: dealIncludes,
        });
    },
    update(id, organizationId, data) {
        return prisma_1.prisma.deal.updateMany({
            where: { id, organizationId, deletedAt: null },
            data,
        });
    },
    softDelete(id, organizationId) {
        return prisma_1.prisma.deal.updateMany({
            where: { id, organizationId, deletedAt: null },
            data: { deletedAt: new Date() },
        });
    },
    /*
     * ── moveToStage Algorithm ─────────────────────────────────────────────────
     *
     * This method moves a deal to a new stage and/or position within the Kanban
     * board, while maintaining sequential integer positions without gaps or
     * duplicates within each column. The logic handles two scenarios inside a
     * single Prisma interactive transaction:
     *
     * ── Scenario A: Different stage (cross-column move) ──
     *
     *  1. Read the current deal to get oldStage + oldPosition.
     *  2. Close the gap left behind in the old stage:
     *       UPDATE deal SET position = position - 1
     *       WHERE stage = oldStage AND position > oldPosition
     *       AND organizationId = ? AND deletedAt IS NULL AND id != movedDealId
     *     (Every deal that was below the moved deal shifts up by 1.)
     *  3. Open space for the deal in the new stage:
     *       UPDATE deal SET position = position + 1
     *       WHERE stage = newStage AND position >= newPosition
     *       AND organizationId = ? AND deletedAt IS NULL
     *     (Every deal at or below the insertion point shifts down by 1,
     *      creating a vacant slot at newPosition.)
     *  4. Move the deal:
     *       UPDATE deal SET stage = newStage, position = newPosition
     *       WHERE id = movedDealId
     *     (This fills the vacant slot created in step 3.)
     *
     * ── Scenario B: Same stage (intra-column reorder) ──
     *
     *   Moving down (newPosition > oldPosition):
     *       UPDATE deal SET position = position - 1
     *       WHERE stage = stage AND position > oldPosition AND position <= newPosition
     *       AND organizationId = ? AND deletedAt IS NULL AND id != movedDealId
     *     (Deals in the range (oldPosition, newPosition] shift up by 1,
     *      collapsing the gap that would be left by the removed deal.)
     *
     *   Moving up (newPosition < oldPosition):
     *       UPDATE deal SET position = position + 1
     *       WHERE stage = stage AND position >= newPosition AND position < oldPosition
     *       AND organizationId = ? AND deletedAt IS NULL AND id != movedDealId
     *     (Deals in the range [newPosition, oldPosition) shift down by 1,
     *      making room for the deal at its new spot.)
     *
     *   Then update the deal's position to newPosition.
     *
     * ── Edge cases handled ──
     *
     *  - Same position, same stage → no-op (early return).
     *  - The moved deal is excluded from shift queries via `id: { not: id }`
     *    to prevent self-update in same-stage reorders.
     *  - Lost-reason cleanup on stage change FROM 'LOST' is intentionally NOT
     *    handled here — it belongs in the service layer as a business rule.
     *  - If newPosition exceeds the current max position in the target stage,
     *    a gap will be created. The service layer / frontend is responsible
     *    for sending valid positions aligned with column size.
   *  - The interactive Prisma $transaction uses Serializable isolation level
   *    explicitly (Prisma.TransactionIsolationLevel.Serializable), preventing
   *    race conditions from concurrent drag-and-drop operations via range locks.
     *
     * ─────────────────────────────────────────────────────────────────────────
     */
    async moveToStage(id, organizationId, newStage, newPosition) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const deal = await tx.deal.findFirst({
                where: { id, organizationId, deletedAt: null },
            });
            if (!deal)
                return null;
            const oldStage = deal.stage;
            const oldPosition = deal.position;
            if (oldStage === newStage && oldPosition === newPosition) {
                return deal;
            }
            if (oldStage === newStage) {
                if (newPosition > oldPosition) {
                    await tx.deal.updateMany({
                        where: {
                            organizationId,
                            stage: oldStage,
                            position: { gt: oldPosition, lte: newPosition },
                            deletedAt: null,
                            id: { not: id },
                        },
                        data: { position: { decrement: 1 } },
                    });
                }
                else if (newPosition < oldPosition) {
                    await tx.deal.updateMany({
                        where: {
                            organizationId,
                            stage: oldStage,
                            position: { gte: newPosition, lt: oldPosition },
                            deletedAt: null,
                            id: { not: id },
                        },
                        data: { position: { increment: 1 } },
                    });
                }
                await tx.deal.update({
                    where: { id },
                    data: { position: newPosition },
                });
            }
            else {
                await tx.deal.updateMany({
                    where: {
                        organizationId,
                        stage: oldStage,
                        position: { gt: oldPosition },
                        deletedAt: null,
                        id: { not: id },
                    },
                    data: { position: { decrement: 1 } },
                });
                await tx.deal.updateMany({
                    where: {
                        organizationId,
                        stage: newStage,
                        position: { gte: newPosition },
                        deletedAt: null,
                    },
                    data: { position: { increment: 1 } },
                });
                await tx.deal.update({
                    where: { id },
                    data: { stage: newStage, position: newPosition },
                });
            }
            return true;
        }, {
            isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 5000,
            timeout: 10000,
        });
    },
};
//# sourceMappingURL=deals.repository.js.map