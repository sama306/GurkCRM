import { apiClient } from "./api-client";
import type { Contact, CreateContactInput, UpdateContactInput } from "@/types/contact";

export const contactsService = {
  getContactsByCompany(companyId: string) {
    return apiClient
      .get<Contact[]>(`/companies/${companyId}/contacts`)
      .then((res) => res.data);
  },

  createContact(companyId: string, data: CreateContactInput) {
    return apiClient
      .post<Contact>(`/companies/${companyId}/contacts`, data)
      .then((res) => res.data);
  },

  updateContact(id: string, data: UpdateContactInput) {
    return apiClient
      .patch<Contact>(`/contacts/${id}`, data)
      .then((res) => res.data);
  },

  deleteContact(id: string) {
    return apiClient.delete(`/contacts/${id}`).then((res) => res.data);
  },
};
