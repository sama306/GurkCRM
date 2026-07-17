"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealsService = void 0;
const prisma_1 = require("../../config/prisma");
const AppError_1 = require("../../shared/errors/AppError");
const customers_repository_1 = require("../customers/customers.repository");
const companies_repository_1 = require("../companies/companies.repository");
const users_repository_1 = require("../users/users.repository");
const deals_repository_1 = require("./deals.repository");
function toDealResponse(deal) {
    return {
        id: deal.id,
        organizationId: deal.organizationId,
        title: deal.title,
        estimatedValue: Number(deal.estimatedValue),
        currency: deal.currency,
        stage: deal.stage,
        expectedCloseDate: deal.expectedCloseDate?.toISOString() ?? null,
        lostReason: deal.lostReason,
        position: deal.position,
        customerId: deal.customerId,
        customerName: deal.customer.fullName,
        companyId: deal.company?.id ?? null,
        companyName: deal.company?.name ?? null,
        ownerId: deal.ownerId,
        ownerName: deal.owner.fullName,
        createdAt: deal.createdAt.toISOString(),
        updatedAt: deal.updatedAt.toISOString(),
    };
}
function toDealCard(deal) {
    return {
        id: deal.id,
        title: deal.title,
        estimatedValue: Number(deal.estimatedValue),
        currency: deal.currency,
        stage: deal.stage,
        expectedCloseDate: deal.expectedCloseDate?.toISOString() ?? null,
        lostReason: deal.lostReason,
        position: deal.position,
        customerId: deal.customerId,
        customerName: deal.customer.fullName,
        companyId: deal.company?.id ?? null,
        companyName: deal.company?.name ?? null,
        ownerId: deal.ownerId,
        ownerName: deal.owner.fullName,
    };
}
async function validateOwner(ownerId, organizationId, defaultOwnerId) {
    const resolvedOwnerId = ownerId ?? defaultOwnerId;
    if (!resolvedOwnerId) {
        throw new AppError_1.AppError(400, 'OWNER_REQUIRED', 'El responsable del deal es requerido');
    }
    const owner = await users_repository_1.usersRepository.findById(resolvedOwnerId, organizationId);
    if (!owner) {
        throw new AppError_1.AppError(404, 'USER_NOT_FOUND', 'El usuario responsable no existe o no pertenece a esta organización');
    }
    if (owner.role.name !== 'SALES' && owner.role.name !== 'ADMIN') {
        throw new AppError_1.AppError(400, 'INVALID_OWNER_ROLE', 'El responsable debe tener rol SALES o ADMIN');
    }
    return resolvedOwnerId;
}
async function validateCustomer(customerId, organizationId) {
    if (!customerId)
        return;
    const customer = await customers_repository_1.customersRepository.findById(customerId, organizationId);
    if (!customer) {
        throw new AppError_1.AppError(404, 'CUSTOMER_NOT_FOUND', 'El cliente especificado no existe o no pertenece a esta organización');
    }
}
async function validateCompany(companyId, organizationId) {
    if (!companyId)
        return;
    const company = await companies_repository_1.companiesRepository.findById(companyId, organizationId);
    if (!company) {
        throw new AppError_1.AppError(404, 'COMPANY_NOT_FOUND', 'La empresa especificada no existe o no pertenece a esta organización');
    }
}
exports.dealsService = {
    async listDeals(organizationId, filters) {
        const [deals, total] = await deals_repository_1.dealsRepository.findAll(organizationId, {
            page: filters?.page,
            limit: filters?.limit,
            search: filters?.search,
            stage: filters?.stage,
            ownerId: filters?.ownerId,
            customerId: filters?.customerId,
            sortBy: filters?.sortBy,
            order: filters?.order,
        });
        const page = Math.max(filters?.page ?? 1, 1);
        const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
        return {
            data: deals.map(toDealResponse),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },
    async getBoardDeals(organizationId) {
        const board = await deals_repository_1.dealsRepository.findBoard(organizationId);
        const result = {};
        for (const [stage, deals] of Object.entries(board)) {
            result[stage] = deals.map(toDealCard);
        }
        return result;
    },
    async getDealById(organizationId, id) {
        const deal = await deals_repository_1.dealsRepository.findById(id, organizationId);
        if (!deal) {
            throw new AppError_1.AppError(404, 'DEAL_NOT_FOUND', 'Deal no encontrado');
        }
        return toDealResponse(deal);
    },
    async createDeal(organizationId, data, createdByUserId) {
        await validateCustomer(data.customerId, organizationId);
        await validateCompany(data.companyId, organizationId);
        const ownerId = await validateOwner(data.ownerId, organizationId, createdByUserId);
        const deal = await deals_repository_1.dealsRepository.create({
            title: data.title,
            customerId: data.customerId,
            companyId: data.companyId,
            ownerId,
            estimatedValue: data.estimatedValue ?? 0,
            currency: data.currency ?? 'USD',
            stage: data.stage ?? 'NEW',
            expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
            lostReason: data.lostReason,
        }, organizationId);
        return toDealResponse(deal);
    },
    async updateDeal(organizationId, id, data) {
        if ('stage' in data || 'position' in data) {
            throw new AppError_1.AppError(400, 'STAGE_NOT_ALLOWED', 'No puedes cambiar stage o position desde este endpoint. Usa PATCH /deals/:id/stage');
        }
        await validateCustomer(data.customerId, organizationId);
        await validateCompany(data.companyId, organizationId);
        if (data.ownerId) {
            await validateOwner(data.ownerId, organizationId);
        }
        const parsedData = {};
        if (data.title !== undefined)
            parsedData.title = data.title;
        if (data.customerId !== undefined)
            parsedData.customerId = data.customerId;
        if (data.companyId !== undefined)
            parsedData.companyId = data.companyId;
        if (data.ownerId !== undefined)
            parsedData.ownerId = data.ownerId;
        if (data.estimatedValue !== undefined)
            parsedData.estimatedValue = data.estimatedValue;
        if (data.currency !== undefined)
            parsedData.currency = data.currency;
        if (data.expectedCloseDate !== undefined) {
            parsedData.expectedCloseDate = data.expectedCloseDate ? new Date(data.expectedCloseDate) : null;
        }
        const { count } = await deals_repository_1.dealsRepository.update(id, organizationId, parsedData);
        if (count === 0) {
            throw new AppError_1.AppError(404, 'DEAL_NOT_FOUND', 'Deal no encontrado');
        }
        const deal = await deals_repository_1.dealsRepository.findById(id, organizationId);
        return toDealResponse(deal);
    },
    async changeDealStage(organizationId, id, newStage, newPosition, lostReason) {
        const deal = await deals_repository_1.dealsRepository.findById(id, organizationId);
        if (!deal) {
            throw new AppError_1.AppError(404, 'DEAL_NOT_FOUND', 'Deal no encontrado');
        }
        if (newStage === 'LOST' && !lostReason && !deal.lostReason) {
            throw new AppError_1.AppError(400, 'LOST_REASON_REQUIRED', 'lostReason es requerido al mover un deal a la columna LOST');
        }
        if (newStage === 'LOST' && lostReason) {
            await deals_repository_1.dealsRepository.update(id, organizationId, { lostReason });
        }
        if (deal.stage === 'LOST' && newStage !== 'LOST' && deal.lostReason) {
            await deals_repository_1.dealsRepository.update(id, organizationId, { lostReason: null });
        }
        let clampedPosition = Math.max(newPosition, 0);
        const stageCount = await prisma_1.prisma.deal.count({
            where: { organizationId, stage: newStage, deletedAt: null },
        });
        if (newStage === deal.stage) {
            clampedPosition = Math.min(clampedPosition, stageCount - 1);
        }
        else {
            clampedPosition = Math.min(clampedPosition, stageCount);
        }
        const moved = await deals_repository_1.dealsRepository.moveToStage(id, organizationId, newStage, clampedPosition);
        if (!moved) {
            throw new AppError_1.AppError(404, 'DEAL_NOT_FOUND', 'Deal no encontrado');
        }
        const updated = await deals_repository_1.dealsRepository.findById(id, organizationId);
        return toDealResponse(updated);
    },
    async deleteDeal(organizationId, id) {
        const { count } = await deals_repository_1.dealsRepository.softDelete(id, organizationId);
        if (count === 0) {
            throw new AppError_1.AppError(404, 'DEAL_NOT_FOUND', 'Deal no encontrado');
        }
    },
};
//# sourceMappingURL=deals.service.js.map