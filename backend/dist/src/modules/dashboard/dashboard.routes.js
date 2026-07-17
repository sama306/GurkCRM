"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
exports.dashboardRoutes = router;
router.get('/summary', auth_middleware_1.requireAuth, dashboard_controller_1.dashboardController.getSummary);
router.get('/recent-activity', auth_middleware_1.requireAuth, dashboard_controller_1.dashboardController.getRecentActivity);
//# sourceMappingURL=dashboard.routes.js.map