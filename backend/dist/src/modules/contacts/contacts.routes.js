"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactsRoutes = void 0;
const express_1 = require("express");
const contacts_controller_1 = require("./contacts.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const contacts_schema_1 = require("./contacts.schema");
const router = (0, express_1.Router)();
exports.contactsRoutes = router;
router.get('/companies/:companyId/contacts', auth_middleware_1.requireAuth, contacts_controller_1.contactsController.listByCompany);
router.post('/companies/:companyId/contacts', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(contacts_schema_1.createContactSchema), contacts_controller_1.contactsController.create);
router.patch('/contacts/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['SALES', 'ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(contacts_schema_1.updateContactSchema), contacts_controller_1.contactsController.update);
router.delete('/contacts/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['ADMIN', 'OWNER']), contacts_controller_1.contactsController.remove);
//# sourceMappingURL=contacts.routes.js.map