import type { Request, Response } from 'express';
import { usersService } from './users.service';

export const usersController = {
  async list(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;

    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const search = req.query.search as string | undefined;
    const isActive = req.query.isActive !== undefined
      ? req.query.isActive === 'true'
      : undefined;
    const roleName = req.query.roleName as string | undefined;

    const result = await usersService.listUsers(organizationId, {
      page, limit, search, isActive, roleName,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  },

  async listRoles(_req: Request, res: Response) {
    const roles = await usersService.listRoles();
    res.status(200).json({
      success: true,
      data: roles,
    });
  },

  async lookup(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const users = await usersService.lookupUsers(organizationId);
    res.status(200).json({
      success: true,
      data: users,
    });
  },

  async getById(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;

    const user = await usersService.getUserById(id, organizationId);

    res.status(200).json({
      success: true,
      data: user,
    });
  },

  async update(req: Request, res: Response) {
    const actorId = req.user!.id;
    const actorRole = req.user!.role;
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;
    const { roleId, isActive } = req.body as { roleId?: string; isActive?: boolean };

    if (roleId !== undefined) {
      await usersService.changeUserRole(actorId, actorRole, id, organizationId, roleId);
    }

    if (isActive !== undefined) {
      await usersService.toggleUserActive(actorId, actorRole, id, organizationId, isActive);
    }

    const updated = await usersService.getUserById(id, organizationId);

    res.status(200).json({
      success: true,
      data: updated,
    });
  },

  async updateMe(req: Request, res: Response) {
    const userId = req.user!.id;
    const { fullName, avatarUrl } = req.body as { fullName?: string; avatarUrl?: string | null };

    const user = await usersService.updateOwnProfile(userId, { fullName, avatarUrl });

    res.status(200).json({
      success: true,
      data: user,
    });
  },

  async changeMyPassword(req: Request, res: Response) {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    await usersService.changeOwnPassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      data: {
        message: 'Contraseña actualizada correctamente.',
      },
    });
  },
};
