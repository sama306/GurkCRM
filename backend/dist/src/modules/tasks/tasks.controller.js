"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksController = void 0;
const tasks_service_1 = require("./tasks.service");
exports.tasksController = {
    async list(req, res) {
        const organizationId = req.user.organizationId;
        const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const search = req.query.search;
        const status = req.query.status;
        const priority = req.query.priority;
        const assigneeId = req.query.assigneeId;
        const dueDateFrom = req.query.dueDateFrom;
        const dueDateTo = req.query.dueDateTo;
        const sortBy = req.query.sortBy;
        const order = req.query.order;
        const result = await tasks_service_1.tasksService.listTasks(organizationId, {
            page, limit, search, status, priority, assigneeId, dueDateFrom, dueDateTo, sortBy, order,
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
        const task = await tasks_service_1.tasksService.getTaskById(organizationId, id);
        res.status(200).json({ success: true, data: task });
    },
    async create(req, res) {
        const organizationId = req.user.organizationId;
        const task = await tasks_service_1.tasksService.createTask(organizationId, req.body);
        res.status(201).json({ success: true, data: task });
    },
    async update(req, res) {
        const { id: actorId, organizationId, role: actorRole } = req.user;
        const taskId = req.params.id;
        const task = await tasks_service_1.tasksService.updateTask(actorId, actorRole, organizationId, taskId, req.body);
        res.status(200).json({ success: true, data: task });
    },
    async updateStatus(req, res) {
        const { id: actorId, organizationId, role: actorRole } = req.user;
        const taskId = req.params.id;
        const { status } = req.body;
        const task = await tasks_service_1.tasksService.updateTaskStatus(actorId, actorRole, organizationId, taskId, status);
        res.status(200).json({ success: true, data: task });
    },
    async remove(req, res) {
        const { id: actorId, organizationId, role: actorRole } = req.user;
        const taskId = req.params.id;
        await tasks_service_1.tasksService.deleteTask(actorId, actorRole, organizationId, taskId);
        res.status(204).json({ success: true, data: null });
    },
};
//# sourceMappingURL=tasks.controller.js.map