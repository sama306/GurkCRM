"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const AppError_1 = require("../../shared/errors/AppError");
const auth_repository_1 = require("./auth.repository");
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
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, {
        expiresIn: env_1.env.JWT_ACCESS_EXPIRES_IN,
    });
}
function signRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
    });
}
async function findMatchingToken(tokens, rawToken) {
    for (const t of tokens) {
        const valid = await bcryptjs_1.default.compare(rawToken, t.tokenHash);
        if (valid)
            return t;
    }
    return null;
}
function getRefreshExpiry(rememberMe) {
    // Default: 7 days (from env). If rememberMe: 30 days
    const base = rememberMe ? 30 : parseInt(env_1.env.JWT_REFRESH_EXPIRES_IN, 10) || 7;
    // JWT_REFRESH_EXPIRES_IN is like "7d" — parse the number
    const numericMatch = env_1.env.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)/);
    const defaultDays = numericMatch ? parseInt(numericMatch[1], 10) : 7;
    const days = rememberMe ? 30 : defaultDays;
    const ms = days * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + ms);
}
exports.authService = {
    async register(input) {
        const existing = await auth_repository_1.authRepository.findUserByEmail(input.email);
        if (existing) {
            throw new AppError_1.AppError(409, 'EMAIL_EXISTS', 'Ya existe un usuario con ese email');
        }
        const saltRounds = env_1.env.BCRYPT_SALT_ROUNDS;
        const passwordHash = await bcryptjs_1.default.hash(input.password, saltRounds);
        const { user } = await auth_repository_1.authRepository.createOrganizationWithOwner({
            organizationName: input.organizationName,
            fullName: input.fullName,
            email: input.email,
            passwordHash,
        });
        const accessToken = signAccessToken({
            id: user.id,
            organizationId: user.organizationId,
            role: user.role.name,
        });
        const refreshToken = signRefreshToken({ id: user.id });
        const expiresAt = getRefreshExpiry(false);
        const refreshTokenHash = await bcryptjs_1.default.hash(refreshToken, saltRounds);
        await auth_repository_1.authRepository.createRefreshToken({
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt,
        });
        return {
            user: toUserResponse(user),
            accessToken,
            refreshToken,
            refreshExpiresAt: expiresAt,
        };
    },
    async login(input) {
        const user = await auth_repository_1.authRepository.findUserByEmail(input.email);
        if (!user) {
            throw new AppError_1.AppError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
        }
        if (!user.isActive) {
            throw new AppError_1.AppError(401, 'USER_INACTIVE', 'La cuenta está desactivada');
        }
        const valid = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!valid) {
            throw new AppError_1.AppError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
        }
        await auth_repository_1.authRepository.updateLastLogin(user.id);
        const accessToken = signAccessToken({
            id: user.id,
            organizationId: user.organizationId,
            role: user.role.name,
        });
        const refreshToken = signRefreshToken({ id: user.id });
        const expiresAt = getRefreshExpiry(input.rememberMe ?? false);
        const refreshTokenHash = await bcryptjs_1.default.hash(refreshToken, env_1.env.BCRYPT_SALT_ROUNDS);
        await auth_repository_1.authRepository.createRefreshToken({
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt,
        });
        return {
            user: toUserResponse(user),
            accessToken,
            refreshToken,
            refreshExpiresAt: expiresAt,
        };
    },
    async refresh(refreshTokenCookie) {
        if (!refreshTokenCookie) {
            throw new AppError_1.AppError(401, 'NO_REFRESH_TOKEN', 'No se encontró el refresh token');
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshTokenCookie, env_1.env.JWT_REFRESH_SECRET);
        }
        catch {
            throw new AppError_1.AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token inválido o expirado');
        }
        const activeTokens = await auth_repository_1.authRepository.findActiveRefreshTokensByUserId(decoded.id);
        const storedToken = await findMatchingToken(activeTokens, refreshTokenCookie);
        if (!storedToken) {
            throw new AppError_1.AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token inválido o revocado');
        }
        // Revoke ALL active tokens for this user (rotation + clean up same-second duplicates)
        await auth_repository_1.authRepository.revokeAllUserRefreshTokens(decoded.id);
        const user = await auth_repository_1.authRepository.findUserById(decoded.id);
        if (!user || !user.isActive) {
            throw new AppError_1.AppError(401, 'USER_INACTIVE', 'Usuario no encontrado o inactivo');
        }
        const accessToken = signAccessToken({
            id: user.id,
            organizationId: user.organizationId,
            role: user.role.name,
        });
        const newRefreshToken = signRefreshToken({ id: user.id });
        const expiresAt = getRefreshExpiry(false);
        const refreshTokenHash = await bcryptjs_1.default.hash(newRefreshToken, env_1.env.BCRYPT_SALT_ROUNDS);
        await auth_repository_1.authRepository.createRefreshToken({
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt,
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
            refreshExpiresAt: expiresAt,
        };
    },
    async logout(refreshTokenCookie) {
        if (!refreshTokenCookie)
            return;
        const decoded = jsonwebtoken_1.default.decode(refreshTokenCookie);
        if (!decoded?.id)
            return;
        const activeTokens = await auth_repository_1.authRepository.findActiveRefreshTokensByUserId(decoded.id);
        const storedToken = await findMatchingToken(activeTokens, refreshTokenCookie);
        if (storedToken) {
            await auth_repository_1.authRepository.revokeAllUserRefreshTokens(decoded.id);
        }
    },
    async forgotPassword(email) {
        const user = await auth_repository_1.authRepository.findUserByEmail(email);
        if (!user) {
            return;
        }
        const resetToken = jsonwebtoken_1.default.sign({ id: user.id, purpose: 'reset' }, env_1.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
        const resetLink = `${env_1.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        // TODO: integrar proveedor real de email (Resend) en Fase 2
        console.log(`[FORGOT-PASSWORD] Token de reseteo para ${email}:`);
        console.log(`[FORGOT-PASSWORD] Link: ${resetLink}`);
    },
    async resetPassword(input) {
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(input.token, env_1.env.JWT_ACCESS_SECRET);
        }
        catch {
            throw new AppError_1.AppError(400, 'INVALID_RESET_TOKEN', 'Token de reseteo inválido o expirado');
        }
        if (decoded.purpose !== 'reset') {
            throw new AppError_1.AppError(400, 'INVALID_RESET_TOKEN', 'Token de reseteo inválido');
        }
        const saltRounds = env_1.env.BCRYPT_SALT_ROUNDS;
        const passwordHash = await bcryptjs_1.default.hash(input.newPassword, saltRounds);
        await auth_repository_1.authRepository.updatePassword(decoded.id, passwordHash);
        // Revoke all active refresh tokens to force re-login on all devices
        await auth_repository_1.authRepository.revokeAllUserRefreshTokens(decoded.id);
    },
    async getMe(userId) {
        const user = await auth_repository_1.authRepository.findUserById(userId);
        if (!user) {
            throw new AppError_1.AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
        }
        return toUserResponse(user);
    },
};
//# sourceMappingURL=auth.service.js.map