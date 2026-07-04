import { AppError } from '../../shared/errors/AppError';
import { companiesRepository } from '../companies/companies.repository';
import { contactsRepository } from './contacts.repository';
import type { ContactResponseDTO, CreateContactDTO, UpdateContactDTO } from './contacts.dto';

function toContactResponse(contact: {
  id: string;
  companyId: string;
  fullName: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  socialLinks: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ContactResponseDTO {
  return {
    id: contact.id,
    companyId: contact.companyId,
    fullName: contact.fullName,
    position: contact.position,
    email: contact.email,
    phone: contact.phone,
    socialLinks: contact.socialLinks ? JSON.parse(contact.socialLinks) : null,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}

export const contactsService = {
  async listContactsByCompany(organizationId: string, companyId: string): Promise<ContactResponseDTO[]> {
    const company = await companiesRepository.findById(companyId, organizationId);
    if (!company) {
      throw new AppError(404, 'COMPANY_NOT_FOUND', 'Empresa no encontrada');
    }
    const contacts = await contactsRepository.findByCompany(companyId, organizationId);
    return contacts.map(toContactResponse);
  },

  async getContactById(organizationId: string, id: string): Promise<ContactResponseDTO> {
    const contact = await contactsRepository.findById(id, organizationId);
    if (!contact) {
      throw new AppError(404, 'CONTACT_NOT_FOUND', 'Contacto no encontrado');
    }
    return toContactResponse(contact);
  },

  async createContact(organizationId: string, companyId: string, data: CreateContactDTO): Promise<ContactResponseDTO> {
    const company = await companiesRepository.findById(companyId, organizationId);
    if (!company) {
      throw new AppError(404, 'COMPANY_NOT_FOUND', 'Empresa no encontrada');
    }

    // El límite de 4 contactos por empresa era una sugerencia para el seed de datos ficticios
    // (~15 contacts / ~10 companies), no una regla de negocio real del sistema.
    // Si en el futuro se requiere como regla de negocio, se puede agregar un check aquí.

    const contact = await contactsRepository.create(companyId, {
      fullName: data.fullName,
      position: data.position,
      email: data.email,
      phone: data.phone,
      socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : undefined,
    });
    return toContactResponse(contact);
  },

  async updateContact(organizationId: string, id: string, data: UpdateContactDTO): Promise<ContactResponseDTO> {
    const contact = await contactsRepository.findById(id, organizationId);
    if (!contact) {
      throw new AppError(404, 'CONTACT_NOT_FOUND', 'Contacto no encontrado');
    }
    const updated = await contactsRepository.update(id, {
      fullName: data.fullName,
      position: data.position,
      email: data.email,
      phone: data.phone,
      socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : undefined,
    });
    return toContactResponse(updated);
  },

  async deleteContact(organizationId: string, id: string): Promise<void> {
    const contact = await contactsRepository.findById(id, organizationId);
    if (!contact) {
      throw new AppError(404, 'CONTACT_NOT_FOUND', 'Contacto no encontrado');
    }
    await contactsRepository.delete(id);
  },
};
