import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { usersRepository } from './users.repository';
import type { UserResponseDTO, UpdateOwnProfileInput, ListUsersFilters, PaginatedResult } from './users.dto';

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
}): UserResponseDTO {
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

export const usersService = {
  async listUsers(
    organizationId: string,
    filters?: ListUsersFilters,
  ): Promise<PaginatedResult<UserResponseDTO>> {
    const [users, total] = await usersRepository.findByOrganization(organizationId, {
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

  async getUserById(id: string, organizationId: string): Promise<UserResponseDTO> {
    const user = await usersRepository.findById(id, organizationId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }
    return toUserResponse(user);
  },

  async changeUserRole(
    actorId: string,
    actorRole: string,
    targetId: string,
    organizationId: string,
    newRoleId: string,
  ): Promise<UserResponseDTO> {
    if (actorRole !== 'ADMIN' && actorRole !== 'OWNER') {
      throw new AppError(403, 'FORBIDDEN', 'No tienes permisos para gestionar usuarios');
    }

    if (actorId === targetId) {
      throw new AppError(400, 'SELF_ROLE_CHANGE', 'No puedes cambiarte el rol a ti mismo');
    }

    const target = await usersRepository.findById(targetId, organizationId);
    if (!target) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    if (target.role.name === 'OWNER') {
      const ownerCount = await usersRepository.countOwnerUsers(organizationId);
      if (ownerCount <= 1) {
        throw new AppError(
          400,
          'LAST_OWNER',
          'No puedes cambiar el rol del único OWNER de la organización. Debe haber al menos un OWNER.',
        );
      }
    }

    const { count } = await usersRepository.updateRole(targetId, organizationId, newRoleId);
    if (count === 0) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    const updated = await usersRepository.findById(targetId, organizationId);
    return toUserResponse(updated!);
  },

  async toggleUserActive(
    actorId: string,
    actorRole: string,
    targetId: string,
    organizationId: string,
    isActive: boolean,
  ): Promise<UserResponseDTO> {
    if (actorRole !== 'ADMIN' && actorRole !== 'OWNER') {
      throw new AppError(403, 'FORBIDDEN', 'No tienes permisos para gestionar usuarios');
    }

    if (actorId === targetId) {
      throw new AppError(400, 'SELF_DEACTIVATE', 'No puedes desactivarte a ti mismo');
    }

    const target = await usersRepository.findById(targetId, organizationId);
    if (!target) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    if (!isActive && target.role.name === 'OWNER') {
      const ownerCount = await usersRepository.countOwnerUsers(organizationId);
      if (ownerCount <= 1) {
        throw new AppError(
          400,
          'LAST_OWNER',
          'No puedes desactivar al único OWNER de la organización. Debe haber al menos un OWNER activo.',
        );
      }
    }

    const { count } = await usersRepository.updateActiveStatus(targetId, organizationId, isActive);
    if (count === 0) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    const updated = await usersRepository.findById(targetId, organizationId);
    return toUserResponse(updated!);
  },

  async updateOwnProfile(
    userId: string,
    data: UpdateOwnProfileInput,
  ): Promise<UserResponseDTO> {
    const user = await usersRepository.updateOwnProfile(userId, data);
    return toUserResponse(user);
  },

  async changeOwnPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await usersRepository.findByIdUnscoped(userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError(400, 'WRONG_PASSWORD', 'La contraseña actual no es correcta');
    }

    const saltRounds = env.BCRYPT_SALT_ROUNDS;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await usersRepository.updateOwnPassword(userId, newPasswordHash);
  },
};
