"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const auth_routes_1 = require("./modules/auth/auth.routes");
const users_routes_1 = require("./modules/users/users.routes");
const companies_routes_1 = require("./modules/companies/companies.routes");
const contacts_routes_1 = require("./modules/contacts/contacts.routes");
const customers_routes_1 = require("./modules/customers/customers.routes");
const deals_routes_1 = require("./modules/deals/deals.routes");
const tasks_routes_1 = require("./modules/tasks/tasks.routes");
const dashboard_routes_1 = require("./modules/dashboard/dashboard.routes");
const settings_routes_1 = require("./modules/settings/settings.routes");
const error_middleware_1 = require("./middlewares/error.middleware");
const prisma_1 = require("./config/prisma");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prisma_1.prisma; } });
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/v1/auth', auth_routes_1.authRoutes);
app.use('/api/v1/users', users_routes_1.usersRoutes);
app.use('/api/v1/companies', companies_routes_1.companiesRoutes);
app.use('/api/v1', contacts_routes_1.contactsRoutes);
app.use('/api/v1/customers', customers_routes_1.customersRoutes);
app.use('/api/v1/deals', deals_routes_1.dealsRoutes);
app.use('/api/v1/tasks', tasks_routes_1.tasksRoutes);
app.use('/api/v1/dashboard', dashboard_routes_1.dashboardRoutes);
app.use('/api/v1/settings', settings_routes_1.settingsRoutes);
app.get('/api/v1/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
});
app.use(error_middleware_1.errorHandler);
//# sourceMappingURL=app.js.map