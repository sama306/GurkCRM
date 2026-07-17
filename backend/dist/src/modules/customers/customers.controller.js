"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersController = void 0;
const customers_service_1 = require("./customers.service");
exports.customersController = {
    async list(req, res) {
        const organizationId = req.user.organizationId;
        const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const search = req.query.search;
        const status = req.query.status;
        const ownerId = req.query.ownerId;
        const companyId = req.query.companyId;
        const sortBy = req.query.sortBy;
        const order = req.query.order;
        const result = await customers_service_1.customersService.listCustomers(organizationId, {
            page, limit, search, status, ownerId, companyId, sortBy, order,
        });
        res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
        });
    },
    async export(req, res) {
        const organizationId = req.user.organizationId;
        const search = req.query.search;
        const status = req.query.status;
        const ownerId = req.query.ownerId;
        const companyId = req.query.companyId;
        const csv = await customers_service_1.customersService.exportCustomers(organizationId, {
            search, status, ownerId, companyId,
        }, 'csv');
        const date = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="customers_${date}.csv"`);
        res.status(200).send(csv);
    },
    async getById(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        const customer = await customers_service_1.customersService.getCustomerById(organizationId, id);
        res.status(200).json({
            success: true,
            data: customer,
        });
    },
    async create(req, res) {
        const organizationId = req.user.organizationId;
        const data = { ...req.body };
        if (!data.ownerId) {
            data.ownerId = req.user.id;
        }
        const customer = await customers_service_1.customersService.createCustomer(organizationId, data);
        res.status(201).json({
            success: true,
            data: customer,
        });
    },
    async update(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        const customer = await customers_service_1.customersService.updateCustomer(organizationId, id, req.body);
        res.status(200).json({
            success: true,
            data: customer,
        });
    },
    async remove(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        await customers_service_1.customersService.deleteCustomer(organizationId, id);
        res.status(204).json({
            success: true,
            data: null,
        });
    },
};
//# sourceMappingURL=customers.controller.js.map