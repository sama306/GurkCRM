import { AppError } from '../../shared/errors/AppError';
import { companiesRepository } from '../companies/companies.repository';
import { usersRepository } from '../users/users.repository';
import { customersRepository } from './customers.repository';
import type {
  CustomerResponseDTO,
  CustomerDetailDTO,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  ListCustomersFilters,
  PaginatedResult,
} from './customers.dto';

function toCustomerResponse(customer: {
  id: string;
  organizationId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  notes: string | null;
  companyId: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  company: { name: string } | null;
  owner: { fullName: string };
}): CustomerResponseDTO {
  return {
    id: customer.id,
    organizationId: customer.organizationId,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    status: customer.status,
    notes: customer.notes,
    companyId: customer.companyId,
    companyName: customer.company?.name ?? null,
    ownerId: customer.ownerId,
    ownerName: customer.owner.fullName,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}

export const customersService = {
  async listCustomers(
    organizationId: string,
    filters?: ListCustomersFilters,
  ): Promise<PaginatedResult<CustomerResponseDTO>> {
    const [customers, total] = await customersRepository.findAll(organizationId, {
      page: filters?.page,
      limit: filters?.limit,
      search: filters?.search,
      status: filters?.status,
      ownerId: filters?.ownerId,
      companyId: filters?.companyId,
      sortBy: filters?.sortBy,
      order: filters?.order,
    });

    const page = Math.max(filters?.page ?? 1, 1);
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);

    return {
      data: customers.map(toCustomerResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getCustomerById(
    organizationId: string,
    id: string,
  ): Promise<CustomerDetailDTO> {
    const customer = await customersRepository.findById(id, organizationId);
    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');
    }

    return {
      ...toCustomerResponse(customer),
      deals: customer.deals.map((deal) => ({
        id: deal.id,
        title: deal.title,
        stage: deal.stage,
        estimatedValue: Number(deal.estimatedValue),
        currency: deal.currency,
      })),
    };
  },

  async createCustomer(
    organizationId: string,
    data: CreateCustomerDTO,
  ): Promise<CustomerResponseDTO> {
    const ownerId = data.ownerId;
    if (!ownerId) {
      throw new AppError(400, 'OWNER_REQUIRED', 'El responsable del cliente es requerido');
    }

    const owner = await usersRepository.findById(ownerId, organizationId);
    if (!owner) {
      throw new AppError(404, 'USER_NOT_FOUND', 'El usuario responsable no existe o no pertenece a esta organización');
    }
    if (owner.role.name !== 'SALES' && owner.role.name !== 'ADMIN') {
      throw new AppError(400, 'INVALID_OWNER_ROLE', 'El responsable debe tener rol SALES o ADMIN');
    }

    if (data.companyId) {
      const company = await companiesRepository.findById(data.companyId, organizationId);
      if (!company) {
        throw new AppError(404, 'COMPANY_NOT_FOUND', 'La empresa especificada no existe o no pertenece a esta organización');
      }
    }

    const customer = await customersRepository.create(
      {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        companyId: data.companyId,
        ownerId,
        status: data.status ?? 'LEAD',
      },
      organizationId,
    );

    return toCustomerResponse(customer);
  },

  async updateCustomer(
    organizationId: string,
    id: string,
    data: UpdateCustomerDTO,
  ): Promise<CustomerResponseDTO> {
    if (data.companyId !== undefined) {
      if (data.companyId !== null) {
        const company = await companiesRepository.findById(data.companyId, organizationId);
        if (!company) {
          throw new AppError(404, 'COMPANY_NOT_FOUND', 'La empresa especificada no existe o no pertenece a esta organización');
        }
      }
    }

    if (data.ownerId) {
      const owner = await usersRepository.findById(data.ownerId, organizationId);
      if (!owner) {
        throw new AppError(404, 'USER_NOT_FOUND', 'El usuario responsable no existe o no pertenece a esta organización');
      }
      if (owner.role.name !== 'SALES' && owner.role.name !== 'ADMIN') {
        throw new AppError(400, 'INVALID_OWNER_ROLE', 'El responsable debe tener rol SALES o ADMIN');
      }
    }

    const { count } = await customersRepository.update(id, organizationId, data);
    if (count === 0) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');
    }

    const customer = await customersRepository.findById(id, organizationId);
    return toCustomerResponse(customer!);
  },

  async deleteCustomer(organizationId: string, id: string): Promise<void> {
    const { count } = await customersRepository.softDelete(id, organizationId);
    if (count === 0) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');
    }
  },

  async exportCustomers(
    organizationId: string,
    filters: { search?: string; status?: string; ownerId?: string; companyId?: string },
    _format: 'csv',
  ): Promise<string> {
    const customers = await customersRepository.findAllForExport(organizationId, filters);

    const header = 'fullName,email,phone,company,status,owner,createdAt';
    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const rows = customers.map((c) => [
      escape(c.fullName),
      escape(c.email ?? ''),
      escape(c.phone ?? ''),
      escape(c.company?.name ?? ''),
      c.status,
      escape(c.owner.fullName),
      c.createdAt.toISOString(),
    ].join(','));

    return [header, ...rows].join('\n');
  },
};
