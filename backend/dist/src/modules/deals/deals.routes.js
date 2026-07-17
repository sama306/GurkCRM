"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealsRoutes = void 0;
const express_1 = require("express");
const deals_controller_1 = require("./deals.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const deals_schema_1 = require("./deals.schema");
const router = (0, express_1.Router)();
exports.dealsRoutes = router;
router.get('/board', auth_middleware_1.requireAuth, deals_controller_1.dealsController.getBoard);
router.get('/', auth_middleware_1.requireAuth, deals_controller_1.dealsController.list);
router.get('/:id', auth_middleware_1.requireAuth, deals_controller_1.dealsController.getById);
router.post('/', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(deals_schema_1.createDealSchema), deals_controller_1.dealsController.create);
router.patch('/:id/stage', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(deals_schema_1.changeStageSchema), deals_controller_1.dealsController.changeStage);
router.patch('/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(deals_schema_1.updateDealSchema), deals_controller_1.dealsController.update);
router.delete('/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['ADMIN', 'OWNER']), deals_controller_1.dealsController.remove);
//# sourceMappingURL=deals.routes.js.map