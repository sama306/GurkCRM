export interface UserResponseDTO {
  id: string;
  organizationId: string;
  roleId: string;
  roleName: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokensDTO {
  accessToken: string;
}

export interface RegisterResponseDTO {
  user: UserResponseDTO;
  accessToken: string;
}

export interface LoginResponseDTO {
  user: UserResponseDTO;
  accessToken: string;
}

export interface RefreshResponseDTO {
  accessToken: string;
}

export interface MeResponseDTO extends UserResponseDTO {}

export interface AcceptInvitationResponseDTO {
  user: UserResponseDTO;
  accessToken: string;
}
