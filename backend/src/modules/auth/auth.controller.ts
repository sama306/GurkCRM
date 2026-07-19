import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { env } from '../../config/env';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, AcceptInvitationInput } from './auth.schema';

const REFRESH_TOKEN_NAME = 'refreshToken';

function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(REFRESH_TOKEN_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/api/v1/auth',
    expires: expiresAt,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_TOKEN_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/api/v1/auth',
  });
}

export const authController = {
  async register(req: Request, res: Response) {
    const input = req.body as RegisterInput;

    const result = await authService.register(input);

    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },

  async acceptInvitation(req: Request, res: Response) {
    const input = req.body as AcceptInvitationInput;

    const result = await authService.acceptInvitation(input);

    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },

  async login(req: Request, res: Response) {
    const input = req.body as LoginInput;

    const result = await authService.login(input);

    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },

  async refresh(req: Request, res: Response) {
    const refreshTokenCookie = req.cookies?.[REFRESH_TOKEN_NAME];

    const result = await authService.refresh(refreshTokenCookie);

    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  },

  async logout(req: Request, res: Response) {
    const refreshTokenCookie = req.cookies?.[REFRESH_TOKEN_NAME];

    await authService.logout(refreshTokenCookie);

    clearRefreshCookie(res);

    res.status(200).json({
      success: true,
      data: null,
    });
  },

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body as ForgotPasswordInput;

    await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      data: {
        message: 'Si el email está registrado, recibirás un link de reseteo.',
      },
    });
  },

  async resetPassword(req: Request, res: Response) {
    const input = req.body as ResetPasswordInput;

    await authService.resetPassword(input);

    res.status(200).json({
      success: true,
      data: {
        message: 'Contraseña actualizada correctamente. Por favor, inicia sesión de nuevo.',
      },
    });
  },

  async me(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  },
};
