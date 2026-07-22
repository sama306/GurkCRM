import { apiClient } from "./api-client";
import type { Invitation, CreateInvitationInput, VerifiedInvitation, AcceptInvitationInput } from "@/types/invitation";
import type { AuthResponse } from "@/types/auth";

export const invitationsService = {
  createInvitation(data: CreateInvitationInput) {
    return apiClient.post<Invitation>("/invitations", data).then((res) => res.data);
  },

  listInvitations(status?: string) {
    const params = status ? { status } : {};
    return apiClient
      .get<Invitation[]>("/invitations", { params })
      .then((res) => res.data);
  },

  revokeInvitation(id: string) {
    return apiClient.delete(`/invitations/${id}`);
  },

  verifyInvitationToken(token: string): Promise<VerifiedInvitation | { valid: false; reason: string }> {
    return apiClient
      .get<VerifiedInvitation | { valid: false; reason: string }>("/invitations/verify", {
        params: { token },
      })
      .then((res) => res.data);
  },

  acceptInvitation(data: AcceptInvitationInput) {
    return apiClient.post<AuthResponse>("/auth/accept-invitation", data).then((res) => res.data);
  },
};
