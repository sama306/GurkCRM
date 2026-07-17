"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companiesService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const companies_repository_1 = require("./companies.repository");
function toCompanyResponse(company) {
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
exports.companiesService = {
    async listCompanies(organizationId, filters) {
        const [companies, total] = await companies_repository_1.companiesRepository.findAll(organizationId, {
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
    async getCompanyById(organizationId, id) {
        const company = await companies_repository_1.companiesRepository.findById(id, organizationId);
        if (!company) {
            throw new AppError_1.AppError(404, 'COMPANY_NOT_FOUND', 'Empresa no encontrada');
        }
        return toCompanyResponse(company);
    },
    async createCompany(organizationId, data) {
        const company = await companies_repository_1.companiesRepository.create(data, organizationId);
        return toCompanyResponse(company);
    },
    async updateCompany(organizationId, id, data) {
        const { count } = await companies_repository_1.companiesRepository.update(id, organizationId, data);
        if (count === 0) {
            throw new AppError_1.AppError(404, 'COMPANY_NOT_FOUND', 'Empresa no encontrada');
        }
        const company = await companies_repository_1.companiesRepository.findById(id, organizationId);
        return toCompanyResponse(company);
    },
    async deleteCompany(organizationId, id) {
        const { count } = await companies_repository_1.companiesRepository.softDelete(id, organizationId);
        if (count === 0) {
            throw new AppError_1.AppError(404, 'COMPANY_NOT_FOUND', 'Empresa no encontrada');
        }
    },
};
//# sourceMappingURL=companies.service.js.map