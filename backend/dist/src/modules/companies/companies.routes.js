"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companiesRoutes = void 0;
const express_1 = require("express");
const companies_controller_1 = require("./companies.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const companies_schema_1 = require("./companies.schema");
const router = (0, express_1.Router)();
exports.companiesRoutes = router;
router.get('/', auth_middleware_1.requireAuth, companies_controller_1.companiesController.list);
router.get('/:id', auth_middleware_1.requireAuth, companies_controller_1.companiesController.getById);
router.post('/', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(companies_schema_1.createCompanySchema), companies_controller_1.companiesController.create);
router.patch('/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(companies_schema_1.updateCompanySchema), companies_controller_1.companiesController.update);
router.delete('/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['ADMIN', 'OWNER']), companies_controller_1.companiesController.remove);
//# sourceMappingURL=companies.routes.js.map