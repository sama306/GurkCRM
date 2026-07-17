"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const users_service_1 = require("./users.service");
exports.usersController = {
    async list(req, res) {
        const organizationId = req.user.organizationId;
        const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const search = req.query.search;
        const isActive = req.query.isActive !== undefined
            ? req.query.isActive === 'true'
            : undefined;
        const roleName = req.query.roleName;
        const result = await users_service_1.usersService.listUsers(organizationId, {
            page, limit, search, isActive, roleName,
        });
        res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
        });
    },
    async listRoles(_req, res) {
        const roles = await users_service_1.usersService.listRoles();
        res.status(200).json({
            success: true,
            data: roles,
        });
    },
    async lookup(req, res) {
        const organizationId = req.user.organizationId;
        const users = await users_service_1.usersService.lookupUsers(organizationId);
        res.status(200).json({
            success: true,
            data: users,
        });
    },
    async getById(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        const user = await users_service_1.usersService.getUserById(id, organizationId);
        res.status(200).json({
            success: true,
            data: user,
        });
    },
    async update(req, res) {
        const actorId = req.user.id;
        const actorRole = req.user.role;
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        const { roleId, isActive } = req.body;
        if (roleId !== undefined) {
            await users_service_1.usersService.changeUserRole(actorId, actorRole, id, organizationId, roleId);
        }
        if (isActive !== undefined) {
            await users_service_1.usersService.toggleUserActive(actorId, actorRole, id, organizationId, isActive);
        }
        const updated = await users_service_1.usersService.getUserById(id, organizationId);
        res.status(200).json({
            success: true,
            data: updated,
        });
    },
    async updateMe(req, res) {
        const userId = req.user.id;
        const { fullName, avatarUrl } = req.body;
        const user = await users_service_1.usersService.updateOwnProfile(userId, { fullName, avatarUrl });
        res.status(200).json({
            success: true,
            data: user,
        });
    },
    async changeMyPassword(req, res) {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        await users_service_1.usersService.changeOwnPassword(userId, currentPassword, newPassword);
        res.status(200).json({
            success: true,
            data: {
                message: 'Contraseña actualizada correctamente.',
            },
        });
    },
};
//# sourceMappingURL=users.controller.js.map