export interface InvitationResponseDTO {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  roleName: string;
  invitedById: string;
  invitedByName: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
}

export interface CreateInvitationInput {
  email: string;
  roleId: string;
}

export interface ListInvitationsFilters {
  status?: string;
}
