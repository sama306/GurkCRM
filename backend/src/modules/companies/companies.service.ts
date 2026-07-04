import { AppError } from '../../shared/errors/AppError';
import { companiesRepository } from './companies.repository';
import type {
  CompanyResponseDTO,
  CreateCompanyDTO,
  UpdateCompanyDTO,
  ListCompaniesFilters,
  PaginatedResult,
} from './companies.dto';

function toCompanyResponse(company: {
  id: string;
  organizationId: string;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  size: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): CompanyResponseDTO {
  return {
    id: company.id,
    organizationId: company.organizationId,
    name: company.name,
    industry: company.industry,
    website: company.website,
    address: company.address,
    size: company.size,
    status: company.status,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}

export const companiesService = {
  async listCompanies(
    organizationId: string,
    filters?: ListCompaniesFilters,
  ): Promise<PaginatedResult<CompanyResponseDTO>> {
    const [companies, total] = await companiesRepository.findAll(organizationId, {
      page: filters?.page,
      limit: filters?.limit,
      search: filters?.search,
      industry: filters?.industry,
      status: filters?.status,
      size: filters?.size,
      sortBy: filters?.sortBy,
      order: filters?.order,
    });

    const page = Math.max(filters?.page ?? 1, 1);
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);

    return {
      data: companies.map(toCompanyResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getCompanyById(
    organizationId: string,
    id: string,
  ): Promise<CompanyResponseDTO> {
    const company = await companiesRepository.findById(id, organizationId);
    if (!company) {
      throw new AppError(404, 'COMPANY_NOT_FOUND', 'Empresa no encontrada');
    }
    return toCompanyResponse(company);
  },

  async createCompany(
    organizationId: string,
    data: CreateCompanyDTO,
  ): Promise<CompanyResponseDTO> {
    const company = await companiesRepository.create(data, organizationId);
    return toCompanyResponse(company);
  },

  async updateCompany(
    organizationId: string,
    id: string,
    data: UpdateCompanyDTO,
  ): Promise<CompanyResponseDTO> {
    const { count } = await companiesRepository.update(id, organizationId, data);
    if (count === 0) {
      throw new AppError(404, 'COMPANY_NOT_FOUND', 'Empresa no encontrada');
    }
    const company = await companiesRepository.findById(id, organizationId);
    return toCompanyResponse(company!);
  },

  async deleteCompany(
    organizationId: string,
    id: string,
  ): Promise<void> {
    const { count } = await companiesRepository.softDelete(id, organizationId);
    if (count === 0) {
      throw new AppError(404, 'COMPANY_NOT_FOUND', 'Empresa no encontrada');
    }
  },
};
