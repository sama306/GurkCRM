"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_schema_1 = require("./auth.schema");
const router = (0, express_1.Router)();
exports.authRoutes = router;
router.post('/register', (0, validate_middleware_1.validate)(auth_schema_1.registerSchema), auth_controller_1.authController.register);
router.post('/login', (0, validate_middleware_1.validate)(auth_schema_1.loginSchema), auth_controller_1.authController.login);
router.post('/refresh', auth_controller_1.authController.refresh);
router.post('/logout', auth_controller_1.authController.logout);
router.post('/forgot-password', (0, validate_middleware_1.validate)(auth_schema_1.forgotPasswordSchema), auth_controller_1.authController.forgotPassword);
router.post('/reset-password', (0, validate_middleware_1.validate)(auth_schema_1.resetPasswordSchema), auth_controller_1.authController.resetPassword);
router.get('/me', auth_middleware_1.requireAuth, auth_controller_1.authController.me);
//# sourceMappingURL=auth.routes.js.map