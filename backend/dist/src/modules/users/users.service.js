"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const AppError_1 = require("../../shared/errors/AppError");
const users_repository_1 = require("./users.repository");
function toUserResponse(user) {
    return {
        id: user.id,
        organizationId: user.organizationId,
        roleId: user.roleId,
        roleName: user.role.name,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}
exports.usersService = {
    async listUsers(organizationId, filters) {
        const [users, total] = await users_repository_1.usersRepository.findByOrganization(organizationId, {
            page: filters?.page,
            limit: filters?.limit,
            search: filters?.search,
            isActive: filters?.isActive,
            roleName: filters?.roleName,
        });
        const page = Math.max(filters?.page ?? 1, 1);
        const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
        return {
            data: users.map(toUserResponse),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },
    async listRoles() {
        const roles = await users_repository_1.usersRepository.findAllRoles();
        return roles.map((r) => ({ id: r.id, name: r.name }));
    },
    async lookupUsers(organizationId) {
        const users = await users_repository_1.usersRepository.findActiveByOrganization(organizationId);
        return users.map((u) => ({ id: u.id, fullName: u.fullName }));
    },
    async getUserById(id, organizationId) {
        const user = await users_repository_1.usersRepository.findById(id, organizationId);
        if (!user) {
            throw new AppError_1.AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
        }
        return toUserResponse(user);
    },
    async changeUserRole(actorId, actorRole, targetId, organizationId, newRoleId) {
        if (actorRole !== 'ADMIN' && actorRole !== 'OWNER') {
            throw new AppError_1.AppError(403, 'FORBIDDEN', 'No tienes permisos para gestionar usuarios');
        }
        if (actorId === targetId) {
            throw new AppError_1.AppError(400, 'SELF_ROLE_CHANGE', 'No puedes cambiarte el rol a ti mismo');
        }
        const target = await users_repository_1.usersRepository.findById(targetId, organizationId);
        if (!target) {
            throw new AppError_1.AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
        }
        // Jerarquía de roles: ADMIN solo puede modificar SALES y VIEWER
        const newRole = await users_repository_1.usersRepository.findRoleById(newRoleId);
        if (!newRole) {
            throw new AppError_1.AppError(400, 'INVALID_ROLE', 'El rol especificado no existe');
        }
        if (actorRole === 'ADMIN' && newRole.name === 'OWNER') {
            throw new AppError_1.AppError(403, 'HIERARCHY_ERROR', 'Un Admin no puede asignar el rol Owner.');
        }
        if (actorRole === 'ADMIN' && (target.role.name === 'ADMIN' || target.role.name === 'OWNER')) {
            throw new AppError_1.AppError(403, 'HIERARCHY_ERROR', 'Solo un Owner puede modificar el rol de un Admin o de un Owner.');
        }
        if (target.role.name === 'OWNER') {
            const ownerCount = await users_repository_1.usersRepository.countOwnerUsers(organizationId);
            if (ownerCount <= 1) {
                throw new AppError_1.AppError(400, 'LAST_OWNER', 'No puedes cambiar el rol del único OWNER de la organización. Debe haber al menos un OWNER.');
            }
        }
        const { count } = await users_repository_1.usersRepository.updateRole(targetId, organizationId, newRoleId);
        if (count === 0) {
            throw new AppError_1.AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
        }
        const updated = await users_repository_1.usersRepository.findById(targetId, organizationId);
        return toUserResponse(updated);
    },
    async toggleUserActive(actorId, actorRole, targetId, organizationId, isActive) {
        if (actorRole !== 'ADMIN' && actorRole !== 'OWNER') {
            throw new AppError_1.AppError(403, 'FORBIDDEN', 'No tienes permisos para gestionar usuarios');
        }
        if (actorId === targetId) {
            throw new AppError_1.AppError(400, 'SELF_DEACTIVATE', 'No puedes desactivarte a ti mismo');
        }
        const target = await users_repository_1.usersRepository.findById(targetId, organizationId);
        if (!target) {
            throw new AppError_1.AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
        }
        // Jerarquía de roles: ADMIN solo puede activar/desactivar SALES y VIEWER
        if (actorRole === 'ADMIN' && (target.role.name === 'ADMIN' || target.role.name === 'OWNER')) {
            throw new AppError_1.AppError(403, 'HIERARCHY_ERROR', 'Solo un Owner puede activar o desactivar un Admin o un Owner.');
        }
        if (!isActive && target.role.name === 'OWNER') {
            const ownerCount = await users_repository_1.usersRepository.countOwnerUsers(organizationId);
            if (ownerCount <= 1) {
                throw new AppError_1.AppError(400, 'LAST_OWNER', 'No puedes desactivar al único OWNER de la organización. Debe haber al menos un OWNER activo.');
            }
        }
        const { count } = await users_repository_1.usersRepository.updateActiveStatus(targetId, organizationId, isActive);
        if (count === 0) {
            throw new AppError_1.AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
        }
        const updated = await users_repository_1.usersRepository.findById(targetId, organizationId);
        return toUserResponse(updated);
    },
    async updateOwnProfile(userId, data) {
        const user = await users_repository_1.usersRepository.updateOwnProfile(userId, data);
        return toUserResponse(user);
    },
    async changeOwnPassword(userId, currentPassword, newPassword) {
        const user = await users_repository_1.usersRepository.findByIdUnscoped(userId);
        if (!user) {
            throw new AppError_1.AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
        }
        const valid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!valid) {
            throw new AppError_1.AppError(400, 'WRONG_PASSWORD', 'La contraseña actual no es correcta');
        }
        const saltRounds = env_1.env.BCRYPT_SALT_ROUNDS;
        const newPasswordHash = await bcryptjs_1.default.hash(newPassword, saltRounds);
        await users_repository_1.usersRepository.updateOwnPassword(userId, newPasswordHash);
    },
};
//# sourceMappingURL=users.service.js.map