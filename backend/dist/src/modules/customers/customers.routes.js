"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersRoutes = void 0;
const express_1 = require("express");
const customers_controller_1 = require("./customers.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const customers_schema_1 = require("./customers.schema");
const router = (0, express_1.Router)();
exports.customersRoutes = router;
router.get('/export', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), customers_controller_1.customersController.export);
router.get('/', auth_middleware_1.requireAuth, customers_controller_1.customersController.list);
router.get('/:id', auth_middleware_1.requireAuth, customers_controller_1.customersController.getById);
router.post('/', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(customers_schema_1.createCustomerSchema), customers_controller_1.customersController.create);
router.patch('/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(customers_schema_1.updateCustomerSchema), customers_controller_1.customersController.update);
router.delete('/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['ADMIN', 'OWNER']), customers_controller_1.customersController.remove);
//# sourceMappingURL=customers.routes.js.map