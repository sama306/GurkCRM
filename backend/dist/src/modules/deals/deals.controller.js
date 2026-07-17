"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealsController = void 0;
const deals_service_1 = require("./deals.service");
exports.dealsController = {
    async list(req, res) {
        const organizationId = req.user.organizationId;
        const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const search = req.query.search;
        const stage = req.query.stage;
        const ownerId = req.query.ownerId;
        const customerId = req.query.customerId;
        const sortBy = req.query.sortBy;
        const order = req.query.order;
        const result = await deals_service_1.dealsService.listDeals(organizationId, {
            page, limit, search, stage, ownerId, customerId, sortBy, order,
        });
        res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
        });
    },
    async getBoard(req, res) {
        const organizationId = req.user.organizationId;
        const board = await deals_service_1.dealsService.getBoardDeals(organizationId);
        res.status(200).json({ success: true, data: board });
    },
    async getById(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        const deal = await deals_service_1.dealsService.getDealById(organizationId, id);
        res.status(200).json({ success: true, data: deal });
    },
    async create(req, res) {
        const organizationId = req.user.organizationId;
        const data = { ...req.body };
        if (!data.ownerId) {
            data.ownerId = req.user.id;
        }
        const deal = await deals_service_1.dealsService.createDeal(organizationId, data, req.user.id);
        res.status(201).json({ success: true, data: deal });
    },
    async update(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        const deal = await deals_service_1.dealsService.updateDeal(organizationId, id, req.body);
        res.status(200).json({ success: true, data: deal });
    },
    async changeStage(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        const { stage, position, lostReason } = req.body;
        const deal = await deals_service_1.dealsService.changeDealStage(organizationId, id, stage, position, lostReason);
        res.status(200).json({ success: true, data: deal });
    },
    async remove(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        await deals_service_1.dealsService.deleteDeal(organizationId, id);
        res.status(204).json({ success: true, data: null });
    },
};
//# sourceMappingURL=deals.controller.js.map