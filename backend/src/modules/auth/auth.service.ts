import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { authRepository } from './auth.repository';
import type { RegisterInput, LoginInput, ResetPasswordInput } from './auth.schema';

function toUserResponse(user: {
  id: string;
  organizationId: string;
  roleId: string;
  role: { name: string };
  fullName: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
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

function signAccessToken(payload: { id: string; organizationId: string; role: string }) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

function signRefreshToken(payload: { id: string }) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

async function findMatchingToken(
  tokens: { id: string; tokenHash: string }[],
  rawToken: string,
): Promise<{ id: string; tokenHash: string } | null> {
  for (const t of tokens) {
    const valid = await bcrypt.compare(rawToken, t.tokenHash);
    if (valid) return t;
  }
  return null;
}

function getRefreshExpiry(rememberMe: boolean): Date {
  // Default: 7 days (from env). If rememberMe: 30 days
  const base = rememberMe ? 30 : parseInt(env.JWT_REFRESH_EXPIRES_IN, 10) || 7;
  // JWT_REFRESH_EXPIRES_IN is like "7d" — parse the number
  const numericMatch = env.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)/);
  const defaultDays = numericMatch ? parseInt(numericMatch[1], 10) : 7;
  const days = rememberMe ? 30 : defaultDays;
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Ya existe un usuario con ese email');
    }

    const saltRounds = env.BCRYPT_SALT_ROUNDS;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const { user } = await authRepository.createOrganizationWithOwner({
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
    const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds);
    await authRepository.createRefreshToken({
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

  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
    }

    if (!user.isActive) {
      throw new AppError(401, 'USER_INACTIVE', 'La cuenta está desactivada');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
    }

    await authRepository.updateLastLogin(user.id);

    const accessToken = signAccessToken({
      id: user.id,
      organizationId: user.organizationId,
      role: user.role.name,
    });

    const refreshToken = signRefreshToken({ id: user.id });
    const expiresAt = getRefreshExpiry(input.rememberMe ?? false);
    const refreshTokenHash = await bcrypt.hash(refreshToken, env.BCRYPT_SALT_ROUNDS);
    await authRepository.createRefreshToken({
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

  async refresh(refreshTokenCookie: string | undefined) {
    if (!refreshTokenCookie) {
      throw new AppError(401, 'NO_REFRESH_TOKEN', 'No se encontró el refresh token');
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(refreshTokenCookie, env.JWT_REFRESH_SECRET) as { id: string };
    } catch {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token inválido o expirado');
    }

    const activeTokens = await authRepository.findActiveRefreshTokensByUserId(decoded.id);
    const storedToken = await findMatchingToken(activeTokens, refreshTokenCookie);
    if (!storedToken) {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token inválido o revocado');
    }

    // Revoke ALL active tokens for this user (rotation + clean up same-second duplicates)
    await authRepository.revokeAllUserRefreshTokens(decoded.id);

    const user = await authRepository.findUserById(decoded.id);
    if (!user || !user.isActive) {
      throw new AppError(401, 'USER_INACTIVE', 'Usuario no encontrado o inactivo');
    }

    const accessToken = signAccessToken({
      id: user.id,
      organizationId: user.organizationId,
      role: user.role.name,
    });

    const newRefreshToken = signRefreshToken({ id: user.id });
    const expiresAt = getRefreshExpiry(false);
    const refreshTokenHash = await bcrypt.hash(newRefreshToken, env.BCRYPT_SALT_ROUNDS);
    await authRepository.createRefreshToken({
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

  async logout(refreshTokenCookie: string | undefined) {
    if (!refreshTokenCookie) return;

    const decoded = jwt.decode(refreshTokenCookie) as { id: string } | null;
    if (!decoded?.id) return;

    const activeTokens = await authRepository.findActiveRefreshTokensByUserId(decoded.id);
    const storedToken = await findMatchingToken(activeTokens, refreshTokenCookie);
    if (storedToken) {
      await authRepository.revokeAllUserRefreshTokens(decoded.id);
    }
  },

  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      return;
    }

    const resetToken = jwt.sign(
      { id: user.id, purpose: 'reset' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' },
    );

    const resetLink = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // TODO: integrar proveedor real de email (Resend) en Fase 2
    console.log(`[FORGOT-PASSWORD] Token de reseteo para ${email}:`);
    console.log(`[FORGOT-PASSWORD] Link: ${resetLink}`);
  },

  async resetPassword(input: ResetPasswordInput) {
    let decoded: { id: string; purpose?: string };
    try {
      decoded = jwt.verify(input.token, env.JWT_ACCESS_SECRET) as { id: string; purpose?: string };
    } catch {
      throw new AppError(400, 'INVALID_RESET_TOKEN', 'Token de reseteo inválido o expirado');
    }

    if (decoded.purpose !== 'reset') {
      throw new AppError(400, 'INVALID_RESET_TOKEN', 'Token de reseteo inválido');
    }

    const saltRounds = env.BCRYPT_SALT_ROUNDS;
    const passwordHash = await bcrypt.hash(input.newPassword, saltRounds);

    await authRepository.updatePassword(decoded.id, passwordHash);

    // Revoke all active refresh tokens to force re-login on all devices
    await authRepository.revokeAllUserRefreshTokens(decoded.id);
  },

  async getMe(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }
    return toUserResponse(user);
  },
};
