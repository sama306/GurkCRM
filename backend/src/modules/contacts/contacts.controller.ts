import type { Request, Response } from 'express';
import { contactsService } from './contacts.service';

export const contactsController = {
  async listByCompany(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const companyId = req.params.companyId as string;

    const contacts = await contactsService.listContactsByCompany(organizationId, companyId);

    res.status(200).json({
      success: true,
      data: contacts,
    });
  },

  async create(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const companyId = req.params.companyId as string;

    const contact = await contactsService.createContact(organizationId, companyId, req.body);

    res.status(201).json({
      success: true,
      data: contact,
    });
  },

  async update(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;

    const contact = await contactsService.updateContact(organizationId, id, req.body);

    res.status(200).json({
      success: true,
      data: contact,
    });
  },

  async remove(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;

    await contactsService.deleteContact(organizationId, id);

    res.status(204).json({
      success: true,
      data: null,
    });
  },
};
