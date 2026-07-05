import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { customersRepository } from '../customers/customers.repository';
import { companiesRepository } from '../companies/companies.repository';
import { usersRepository } from '../users/users.repository';
import { dealsRepository } from './deals.repository';
import type {
  DealResponseDTO,
  DealCardDTO,
  DealBoardDTO,
  CreateDealDTO,
  UpdateDealDTO,
  ListDealsFilters,
  PaginatedResult,
} from './deals.dto';

type DealWithIncludes = Awaited<ReturnType<typeof dealsRepository.findById>>;

function toDealResponse(deal: NonNullable<DealWithIncludes>): DealResponseDTO {
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

function toDealCard(deal: NonNullable<DealWithIncludes>): DealCardDTO {
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

async function validateOwner(ownerId: string | undefined, organizationId: string, defaultOwnerId?: string) {
  const resolvedOwnerId = ownerId ?? defaultOwnerId;
  if (!resolvedOwnerId) {
    throw new AppError(400, 'OWNER_REQUIRED', 'El responsable del deal es requerido');
  }

  const owner = await usersRepository.findById(resolvedOwnerId, organizationId);
  if (!owner) {
    throw new AppError(404, 'USER_NOT_FOUND', 'El usuario responsable no existe o no pertenece a esta organización');
  }
  if (owner.role.name !== 'SALES' && owner.role.name !== 'ADMIN') {
    throw new AppError(400, 'INVALID_OWNER_ROLE', 'El responsable debe tener rol SALES o ADMIN');
  }

  return resolvedOwnerId;
}

async function validateCustomer(customerId: string | undefined, organizationId: string) {
  if (!customerId) return;

  const customer = await customersRepository.findById(customerId, organizationId);
  if (!customer) {
    throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'El cliente especificado no existe o no pertenece a esta organización');
  }
}

async function validateCompany(companyId: string | null | undefined, organizationId: string) {
  if (!companyId) return;

  const company = await companiesRepository.findById(companyId, organizationId);
  if (!company) {
    throw new AppError(404, 'COMPANY_NOT_FOUND', 'La empresa especificada no existe o no pertenece a esta organización');
  }
}

export const dealsService = {
  async listDeals(
    organizationId: string,
    filters?: ListDealsFilters,
  ): Promise<PaginatedResult<DealResponseDTO>> {
    const [deals, total] = await dealsRepository.findAll(organizationId, {
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

  async getBoardDeals(organizationId: string): Promise<DealBoardDTO> {
    const board = await dealsRepository.findBoard(organizationId);

    const result: DealBoardDTO = {};
    for (const [stage, deals] of Object.entries(board)) {
      result[stage] = deals.map(toDealCard);
    }
    return result;
  },

  async getDealById(organizationId: string, id: string): Promise<DealResponseDTO> {
    const deal = await dealsRepository.findById(id, organizationId);
    if (!deal) {
      throw new AppError(404, 'DEAL_NOT_FOUND', 'Deal no encontrado');
    }
    return toDealResponse(deal);
  },

  async createDeal(
    organizationId: string,
    data: CreateDealDTO,
    createdByUserId: string,
  ): Promise<DealResponseDTO> {
    await validateCustomer(data.customerId, organizationId);
    await validateCompany(data.companyId, organizationId);
    const ownerId = await validateOwner(data.ownerId, organizationId, createdByUserId);

    const deal = await dealsRepository.create(
      {
        title: data.title,
        customerId: data.customerId,
        companyId: data.companyId,
        ownerId,
        estimatedValue: data.estimatedValue ?? 0,
        currency: data.currency ?? 'USD',
        stage: data.stage ?? 'NEW',
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
        lostReason: data.lostReason,
      },
      organizationId,
    );

    return toDealResponse(deal);
  },

  async updateDeal(
    organizationId: string,
    id: string,
    data: UpdateDealDTO,
  ): Promise<DealResponseDTO> {
    if ('stage' in data || 'position' in data) {
      throw new AppError(400, 'STAGE_NOT_ALLOWED', 'No puedes cambiar stage o position desde este endpoint. Usa PATCH /deals/:id/stage');
    }

    await validateCustomer(data.customerId, organizationId);
    await validateCompany(data.companyId, organizationId);
    if (data.ownerId) {
      await validateOwner(data.ownerId, organizationId);
    }

    const parsedData: Record<string, unknown> = {};
    if (data.title !== undefined) parsedData.title = data.title;
    if (data.customerId !== undefined) parsedData.customerId = data.customerId;
    if (data.companyId !== undefined) parsedData.companyId = data.companyId;
    if (data.ownerId !== undefined) parsedData.ownerId = data.ownerId;
    if (data.estimatedValue !== undefined) parsedData.estimatedValue = data.estimatedValue;
    if (data.currency !== undefined) parsedData.currency = data.currency;
    if (data.expectedCloseDate !== undefined) {
      parsedData.expectedCloseDate = data.expectedCloseDate ? new Date(data.expectedCloseDate) : null;
    }

    const { count } = await dealsRepository.update(id, organizationId, parsedData);
    if (count === 0) {
      throw new AppError(404, 'DEAL_NOT_FOUND', 'Deal no encontrado');
    }

    const deal = await dealsRepository.findById(id, organizationId);
    return toDealResponse(deal!);
  },

  async changeDealStage(
    organizationId: string,
    id: string,
    newStage: string,
    newPosition: number,
    lostReason?: string,
  ): Promise<DealResponseDTO> {
    const deal = await dealsRepository.findById(id, organizationId);
    if (!deal) {
      throw new AppError(404, 'DEAL_NOT_FOUND', 'Deal no encontrado');
    }

    if (newStage === 'LOST' && !lostReason && !deal.lostReason) {
      throw new AppError(400, 'LOST_REASON_REQUIRED', 'lostReason es requerido al mover un deal a la columna LOST');
    }

    if (deal.stage === 'LOST' && newStage !== 'LOST' && deal.lostReason) {
      await dealsRepository.update(id, organizationId, { lostReason: null });
    }

    let clampedPosition = Math.max(newPosition, 0);
    const stageCount = await prisma.deal.count({
      where: { organizationId, stage: newStage, deletedAt: null },
    });
    if (newStage === deal.stage) {
      clampedPosition = Math.min(clampedPosition, stageCount - 1);
    } else {
      clampedPosition = Math.min(clampedPosition, stageCount);
    }

    const moved = await dealsRepository.moveToStage(id, organizationId, newStage, clampedPosition);
    if (!moved) {
      throw new AppError(404, 'DEAL_NOT_FOUND', 'Deal no encontrado');
    }

    const updated = await dealsRepository.findById(id, organizationId);
    return toDealResponse(updated!);
  },

  async deleteDeal(organizationId: string, id: string): Promise<void> {
    const { count } = await dealsRepository.softDelete(id, organizationId);
    if (count === 0) {
      throw new AppError(404, 'DEAL_NOT_FOUND', 'Deal no encontrado');
    }
  },
};
