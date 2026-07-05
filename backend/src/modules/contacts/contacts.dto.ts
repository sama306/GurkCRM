export interface ContactResponseDTO {
  id: string;
  companyId: string;
  fullName: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  socialLinks: { platform: string; url: string }[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDTO {
  fullName: string;
  position?: string;
  email?: string;
  phone?: string;
  socialLinks?: { platform: string; url: string }[];
}

export interface UpdateContactDTO {
  fullName?: string;
  position?: string;
  email?: string;
  phone?: string;
  socialLinks?: { platform: string; url: string }[];
}
