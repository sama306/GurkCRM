"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactsService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
const companies_repository_1 = require("../companies/companies.repository");
const contacts_repository_1 = require("./contacts.repository");
function toContactResponse(contact) {
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
exports.contactsService = {
    async listContactsByCompany(organizationId, companyId) {
        const company = await companies_repository_1.companiesRepository.findById(companyId, organizationId);
        if (!company) {
            throw new AppError_1.AppError(404, 'COMPANY_NOT_FOUND', 'Empresa no encontrada');
        }
        const contacts = await contacts_repository_1.contactsRepository.findByCompany(companyId, organizationId);
        return contacts.map(toContactResponse);
    },
    async getContactById(organizationId, id) {
        const contact = await contacts_repository_1.contactsRepository.findById(id, organizationId);
        if (!contact) {
            throw new AppError_1.AppError(404, 'CONTACT_NOT_FOUND', 'Contacto no encontrado');
        }
        return toContactResponse(contact);
    },
    async createContact(organizationId, companyId, data) {
        const company = await companies_repository_1.companiesRepository.findById(companyId, organizationId);
        if (!company) {
            throw new AppError_1.AppError(404, 'COMPANY_NOT_FOUND', 'Empresa no encontrada');
        }
        // El límite de 4 contactos por empresa era una sugerencia para el seed de datos ficticios
        // (~15 contacts / ~10 companies), no una regla de negocio real del sistema.
        // Si en el futuro se requiere como regla de negocio, se puede agregar un check aquí.
        const contact = await contacts_repository_1.contactsRepository.create(companyId, {
            fullName: data.fullName,
            position: data.position,
            email: data.email,
            phone: data.phone,
            socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : undefined,
        });
        return toContactResponse(contact);
    },
    async updateContact(organizationId, id, data) {
        const contact = await contacts_repository_1.contactsRepository.findById(id, organizationId);
        if (!contact) {
            throw new AppError_1.AppError(404, 'CONTACT_NOT_FOUND', 'Contacto no encontrado');
        }
        const updated = await contacts_repository_1.contactsRepository.update(id, {
            fullName: data.fullName,
            position: data.position,
            email: data.email,
            phone: data.phone,
            socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : undefined,
        });
        return toContactResponse(updated);
    },
    async deleteContact(organizationId, id) {
        const contact = await contacts_repository_1.contactsRepository.findById(id, organizationId);
        if (!contact) {
            throw new AppError_1.AppError(404, 'CONTACT_NOT_FOUND', 'Contacto no encontrado');
        }
        await contacts_repository_1.contactsRepository.delete(id);
    },
};
//# sourceMappingURL=contacts.service.js.map