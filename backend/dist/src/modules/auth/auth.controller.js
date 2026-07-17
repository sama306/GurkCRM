"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
const env_1 = require("../../config/env");
const REFRESH_TOKEN_NAME = 'refreshToken';
function setRefreshCookie(res, token, expiresAt) {
    res.cookie(REFRESH_TOKEN_NAME, token, {
        httpOnly: true,
        secure: env_1.env.COOKIE_SECURE,
        sameSite: 'strict',
        domain: env_1.env.COOKIE_DOMAIN,
        path: '/api/v1/auth',
        expires: expiresAt,
    });
}
function clearRefreshCookie(res) {
    res.clearCookie(REFRESH_TOKEN_NAME, {
        httpOnly: true,
        secure: env_1.env.COOKIE_SECURE,
        sameSite: 'strict',
        domain: env_1.env.COOKIE_DOMAIN,
        path: '/api/v1/auth',
    });
}
exports.authController = {
    async register(req, res) {
        const input = req.body;
        const result = await auth_service_1.authService.register(input);
        setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
        res.status(201).json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    },
    async login(req, res) {
        const input = req.body;
        const result = await auth_service_1.authService.login(input);
        setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
        res.status(200).json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    },
    async refresh(req, res) {
        const refreshTokenCookie = req.cookies?.[REFRESH_TOKEN_NAME];
        const result = await auth_service_1.authService.refresh(refreshTokenCookie);
        setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
        res.status(200).json({
            success: true,
            data: {
                accessToken: result.accessToken,
            },
        });
    },
    async logout(req, res) {
        const refreshTokenCookie = req.cookies?.[REFRESH_TOKEN_NAME];
        await auth_service_1.authService.logout(refreshTokenCookie);
        clearRefreshCookie(res);
        res.status(200).json({
            success: true,
            data: null,
        });
    },
    async forgotPassword(req, res) {
        const { email } = req.body;
        await auth_service_1.authService.forgotPassword(email);
        res.status(200).json({
            success: true,
            data: {
                message: 'Si el email está registrado, recibirás un link de reseteo.',
            },
        });
    },
    async resetPassword(req, res) {
        const input = req.body;
        await auth_service_1.authService.resetPassword(input);
        res.status(200).json({
            success: true,
            data: {
                message: 'Contraseña actualizada correctamente. Por favor, inicia sesión de nuevo.',
            },
        });
    },
    async me(req, res) {
        const user = await auth_service_1.authService.getMe(req.user.id);
        res.status(200).json({
            success: true,
            data: user,
        });
    },
};
//# sourceMappingURL=auth.controller.js.map