"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRoutes = void 0;
const express_1 = require("express");
const settings_controller_1 = require("./settings.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const settings_schema_1 = require("./settings.schema");
const router = (0, express_1.Router)();
exports.settingsRoutes = router;
router.get('/organization', auth_middleware_1.requireAuth, settings_controller_1.settingsController.getOrganization);
router.patch('/organization', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(settings_schema_1.updateOrganizationSettingsSchema), settings_controller_1.settingsController.updateOrganization);
//# sourceMappingURL=settings.routes.js.map