"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companiesController = void 0;
const companies_service_1 = require("./companies.service");
exports.companiesController = {
    async list(req, res) {
        const organizationId = req.user.organizationId;
        const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const search = req.query.search;
        const industry = req.query.industry;
        const status = req.query.status;
        const size = req.query.size;
        const sortBy = req.query.sortBy;
        const order = req.query.order;
        const result = await companies_service_1.companiesService.listCompanies(organizationId, {
            page, limit, search, industry, status, size, sortBy, order,
        });
        res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
        });
    },
    async getById(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        const company = await companies_service_1.companiesService.getCompanyById(organizationId, id);
        res.status(200).json({
            success: true,
            data: company,
        });
    },
    async create(req, res) {
        const organizationId = req.user.organizationId;
        const company = await companies_service_1.companiesService.createCompany(organizationId, req.body);
        res.status(201).json({
            success: true,
            data: company,
        });
    },
    async update(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        const company = await companies_service_1.companiesService.updateCompany(organizationId, id, req.body);
        res.status(200).json({
            success: true,
            data: company,
        });
    },
    async remove(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        await companies_service_1.companiesService.deleteCompany(organizationId, id);
        res.status(204).json({
            success: true,
            data: null,
        });
    },
};
//# sourceMappingURL=companies.controller.js.map