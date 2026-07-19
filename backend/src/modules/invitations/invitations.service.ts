import crypto from 'crypto';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { invitationsRepository } from './invitations.repository';
import { usersRepository } from '../users/users.repository';
import type { InvitationResponseDTO, CreateInvitationInput } from './invitations.dto';

function toInvitationResponse(invitation: {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  role: { name: string };
  invitedById: string;
  invitedBy: { fullName: string };
  status: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
}): InvitationResponseDTO {
  return {
    id: invitation.id,
    organizationId: invitation.organizationId,
    email: invitation.email,
    roleId: invitation.roleId,
    roleName: invitation.role.name,
    invitedById: invitation.invitedById,
    invitedByName: invitation.invitedBy.fullName,
    status: invitation.status,
    expiresAt: invitation.expiresAt.toISOString(),
    createdAt: invitation.createdAt.toISOString(),
    updatedAt: invitation.updatedAt.toISOString(),
    acceptedAt: invitation.acceptedAt?.toISOString() ?? null,
    revokedAt: invitation.revokedAt?.toISOString() ?? null,
  };
}

const INVITATION_EXPIRY_DAYS = 7;

export const invitationsService = {
  async createInvitation(
    actorId: string,
    actorRole: string,
    organizationId: string,
    input: CreateInvitationInput,
  ): Promise<{ invitation: InvitationResponseDTO; token: string }> {
    if (actorRole !== 'ADMIN' && actorRole !== 'OWNER') {
      throw new AppError(403, 'FORBIDDEN', 'No tienes permisos para invitar usuarios');
    }

    const targetRole = await usersRepository.findRoleById(input.roleId);
    if (!targetRole) {
      throw new AppError(400, 'INVALID_ROLE', 'El rol especificado no existe');
    }

    // Jerarquía: mismo criterio que changeUserRole
    if (actorRole === 'ADMIN' && targetRole.name === 'OWNER') {
      throw new AppError(403, 'HIERARCHY_ERROR', 'Un Admin no puede invitar con rol Owner.');
    }

    if (actorRole === 'ADMIN' && targetRole.name === 'ADMIN') {
      throw new AppError(403, 'HIERARCHY_ERROR', 'Un Admin no puede invitar con rol Admin.');
    }

    // Validar que el email no pertenezca ya a un User de esta organización
    const existingUser = await usersRepository.findByOrganization(organizationId, {
      search: input.email,
    });
    const users = existingUser[0];
    if (users.some((u: { email: string }) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new AppError(400, 'USER_ALREADY_EXISTS', 'Ese email ya pertenece a un usuario de la organización.');
    }

    // Validar que no haya una invitación PENDING duplicada
    const existingPending = await invitationsRepository.findPendingByEmailAndOrganization(
      input.email,
      organizationId,
    );
    if (existingPending) {
      throw new AppError(400, 'DUPLICATE_INVITATION', 'Ya existe una invitación pendiente para ese email.');
    }

    // Generar token aleatorio y hashearlo
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitation = await invitationsRepository.create({
      organizationId,
      email: input.email,
      roleId: input.roleId,
      invitedById: actorId,
      tokenHash,
      expiresAt,
    });

    // Loggear el link con token en consola (mismo patrón que forgot-password)
    const inviteLink = `${env.CLIENT_URL}/accept-invitation?token=${rawToken}`;
    console.log('========================================');
    console.log('INVITACIÓN CREADA');
    console.log(`  Email: ${input.email}`);
    console.log(`  Organización: ${organizationId}`);
    console.log(`  Link: ${inviteLink}`);
    console.log(`  Expira: ${expiresAt.toISOString()}`);
    console.log('========================================');

    return { invitation: toInvitationResponse(invitation), token: rawToken };
  },

  async listInvitations(
    organizationId: string,
    status?: string,
  ): Promise<InvitationResponseDTO[]> {
    const invitations = await invitationsRepository.findByOrganization(organizationId, status);
    return invitations
      .filter((inv) => {
        // Si está PENDING pero vencida, marcarla como EXPIRED
        if (inv.status === 'PENDING' && inv.expiresAt < new Date()) {
          invitationsRepository.updateStatus(inv.id, 'EXPIRED').catch(() => {});
          return false;
        }
        return true;
      })
      .map(toInvitationResponse);
  },

  async revokeInvitation(
    actorId: string,
    actorRole: string,
    organizationId: string,
    invitationId: string,
  ): Promise<void> {
    if (actorRole !== 'ADMIN' && actorRole !== 'OWNER') {
      throw new AppError(403, 'FORBIDDEN', 'No tienes permisos para revocar invitaciones');
    }

    const invitation = await invitationsRepository.findById(invitationId, organizationId);
    if (!invitation) {
      throw new AppError(404, 'INVITATION_NOT_FOUND', 'Invitación no encontrada');
    }

    if (invitation.status !== 'PENDING') {
      throw new AppError(400, 'INVITATION_NOT_PENDING', 'Solo se pueden revocar invitaciones pendientes');
    }

    // Jerarquía: ADMIN no puede revocar invitaciones que él mismo no haya creado
    // (aplica el mismo criterio: ADMIN solo maneja lo que puede manejar, que son SALES/VIEWER)
    // Como ya validamos que solo ADMIN/OWNER pueden llegar aquí, verificamos
    // si el actor es ADMIN y la invitación es para rol ADMIN/OWNER
    if (actorRole === 'ADMIN') {
      const invRole = invitation.role;
      if (invRole.name === 'OWNER' || invRole.name === 'ADMIN') {
        throw new AppError(403, 'HIERARCHY_ERROR', 'Un Admin no puede revocar invitaciones para roles superiores.');
      }
    }

    const { count } = await invitationsRepository.revoke(invitationId, organizationId);
    if (count === 0) {
      throw new AppError(404, 'INVITATION_NOT_FOUND', 'Invitación no encontrada');
    }
  },
};
