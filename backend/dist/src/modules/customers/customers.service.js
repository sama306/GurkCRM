"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const companies_repository_1 = require("../companies/companies.repository");
const users_repository_1 = require("../users/users.repository");
const customers_repository_1 = require("./customers.repository");
function toCustomerResponse(customer) {
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
exports.customersService = {
    async listCustomers(organizationId, filters) {
        const [customers, total] = await customers_repository_1.customersRepository.findAll(organizationId, {
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
    async getCustomerById(organizationId, id) {
        const customer = await customers_repository_1.customersRepository.findById(id, organizationId);
        if (!customer) {
            throw new AppError_1.AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');
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
    async createCustomer(organizationId, data) {
        const ownerId = data.ownerId;
        if (!ownerId) {
            throw new AppError_1.AppError(400, 'OWNER_REQUIRED', 'El responsable del cliente es requerido');
        }
        const owner = await users_repository_1.usersRepository.findById(ownerId, organizationId);
        if (!owner) {
            throw new AppError_1.AppError(404, 'USER_NOT_FOUND', 'El usuario responsable no existe o no pertenece a esta organización');
        }
        if (owner.role.name !== 'SALES' && owner.role.name !== 'ADMIN') {
            throw new AppError_1.AppError(400, 'INVALID_OWNER_ROLE', 'El responsable debe tener rol SALES o ADMIN');
        }
        if (data.companyId) {
            const company = await companies_repository_1.companiesRepository.findById(data.companyId, organizationId);
            if (!company) {
                throw new AppError_1.AppError(404, 'COMPANY_NOT_FOUND', 'La empresa especificada no existe o no pertenece a esta organización');
            }
        }
        const customer = await customers_repository_1.customersRepository.create({
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            notes: data.notes,
            companyId: data.companyId,
            ownerId,
            status: data.status ?? 'LEAD',
        }, organizationId);
        return toCustomerResponse(customer);
    },
    async updateCustomer(organizationId, id, data) {
        if (data.companyId !== undefined) {
            if (data.companyId !== null) {
                const company = await companies_repository_1.companiesRepository.findById(data.companyId, organizationId);
                if (!company) {
                    throw new AppError_1.AppError(404, 'COMPANY_NOT_FOUND', 'La empresa especificada no existe o no pertenece a esta organización');
                }
            }
        }
        if (data.ownerId) {
            const owner = await users_repository_1.usersRepository.findById(data.ownerId, organizationId);
            if (!owner) {
                throw new AppError_1.AppError(404, 'USER_NOT_FOUND', 'El usuario responsable no existe o no pertenece a esta organización');
            }
            if (owner.role.name !== 'SALES' && owner.role.name !== 'ADMIN') {
                throw new AppError_1.AppError(400, 'INVALID_OWNER_ROLE', 'El responsable debe tener rol SALES o ADMIN');
            }
        }
        const { count } = await customers_repository_1.customersRepository.update(id, organizationId, data);
        if (count === 0) {
            throw new AppError_1.AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');
        }
        const customer = await customers_repository_1.customersRepository.findById(id, organizationId);
        return toCustomerResponse(customer);
    },
    async deleteCustomer(organizationId, id) {
        const { count } = await customers_repository_1.customersRepository.softDelete(id, organizationId);
        if (count === 0) {
            throw new AppError_1.AppError(404, 'CUSTOMER_NOT_FOUND', 'Cliente no encontrado');
        }
    },
    async exportCustomers(organizationId, filters, _format) {
        const customers = await customers_repository_1.customersRepository.findAllForExport(organizationId, filters);
        const header = 'fullName,email,phone,company,status,owner,createdAt';
        const escape = (val) => `"${val.replace(/"/g, '""')}"`;
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
//# sourceMappingURL=customers.service.js.map