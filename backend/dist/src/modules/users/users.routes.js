"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = void 0;
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const users_schema_1 = require("./users.schema");
const router = (0, express_1.Router)();
exports.usersRoutes = router;
router.get('/', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['ADMIN', 'OWNER']), users_controller_1.usersController.list);
router.patch('/me', auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(users_schema_1.updateOwnProfileSchema), users_controller_1.usersController.updateMe);
router.patch('/me/password', auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(users_schema_1.changePasswordSchema), users_controller_1.usersController.changeMyPassword);
router.get('/roles', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['ADMIN', 'OWNER']), users_controller_1.usersController.listRoles);
router.get('/lookup', auth_middleware_1.requireAuth, users_controller_1.usersController.lookup);
router.get('/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['ADMIN', 'OWNER']), users_controller_1.usersController.getById);
router.patch('/:id', auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(['ADMIN', 'OWNER']), (0, validate_middleware_1.validate)(users_schema_1.updateUserSchema), users_controller_1.usersController.update);
//# sourceMappingURL=users.routes.js.map