import type { Request, Response } from 'express';
import { invitationsService } from './invitations.service';
import type { CreateInvitationInput } from './invitations.dto';

export const invitationsController = {
  async verify(req: Request, res: Response) {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'El parámetro token es requerido',
          details: [],
        },
      });
      return;
    }

    const result = await invitationsService.verifyInvitationToken(token);

    if (!result.valid) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INVITATION',
          message: result.reason,
          details: [],
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  },

  async create(req: Request, res: Response) {
    const actorId = req.user!.id;
    const actorRole = req.user!.role;
    const organizationId = req.user!.organizationId;
    const input = req.body as CreateInvitationInput;

    const result = await invitationsService.createInvitation(
      actorId,
      actorRole,
      organizationId,
      input,
    );

    res.status(201).json({
      success: true,
      data: result.invitation,
    });
  },

  async list(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const status = req.query.status as string | undefined;

    const invitations = await invitationsService.listInvitations(organizationId, status);

    res.status(200).json({
      success: true,
      data: invitations,
    });
  },

  async revoke(req: Request, res: Response) {
    const actorId = req.user!.id;
    const actorRole = req.user!.role;
    const organizationId = req.user!.organizationId;
    const invitationId = req.params.id as string;

    await invitationsService.revokeInvitation(actorId, actorRole, organizationId, invitationId);

    res.status(200).json({
      success: true,
      data: { message: 'Invitación revocada correctamente.' },
    });
  },
};
