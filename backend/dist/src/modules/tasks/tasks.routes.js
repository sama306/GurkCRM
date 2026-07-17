"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksRoutes = void 0;
const express_1 = require("express");
const tasks_controller_1 = require("./tasks.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const tasks_schema_1 = require("./tasks.schema");
const router = (0, express_1.Router)();
exports.tasksRoutes = router;
router.get('/', auth_middleware_1.requireAuth, tasks_controller_1.tasksController.list);
router.get('/:id', auth_middleware_1.requireAuth, tasks_controller_1.tasksController.getById);
router.post('/', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(tasks_schema_1.createTaskSchema), tasks_controller_1.tasksController.create);
router.patch('/:id/status', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(tasks_schema_1.updateTaskStatusSchema), tasks_controller_1.tasksController.updateStatus);
router.patch('/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(tasks_schema_1.updateTaskSchema), tasks_controller_1.tasksController.update);
router.delete('/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), tasks_controller_1.tasksController.remove);
//# sourceMappingURL=tasks.routes.js.map