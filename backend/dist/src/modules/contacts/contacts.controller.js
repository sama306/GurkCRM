"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactsController = void 0;
const contacts_service_1 = require("./contacts.service");
exports.contactsController = {
    async listByCompany(req, res) {
        const organizationId = req.user.organizationId;
        const companyId = req.params.companyId;
        const contacts = await contacts_service_1.contactsService.listContactsByCompany(organizationId, companyId);
        res.status(200).json({
            success: true,
            data: contacts,
        });
    },
    async create(req, res) {
        const organizationId = req.user.organizationId;
        const companyId = req.params.companyId;
        const contact = await contacts_service_1.contactsService.createContact(organizationId, companyId, req.body);
        res.status(201).json({
            success: true,
            data: contact,
        });
    },
    async update(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        const contact = await contacts_service_1.contactsService.updateContact(organizationId, id, req.body);
        res.status(200).json({
            success: true,
            data: contact,
        });
    },
    async remove(req, res) {
        const organizationId = req.user.organizationId;
        const id = req.params.id;
        await contacts_service_1.contactsService.deleteContact(organizationId, id);
        res.status(204).json({
            success: true,
            data: null,
        });
    },
};
//# sourceMappingURL=contacts.controller.js.map