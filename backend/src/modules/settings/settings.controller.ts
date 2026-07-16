import type { Request, Response } from 'express';
import { settingsService } from './settings.service';

export const settingsController = {
  async getOrganization(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const settings = await settingsService.getOrganizationSettings(organizationId);
    res.status(200).json({
      success: true,
      data: settings,
    });
  },

  async updateOrganization(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const data = req.body;
    const settings = await settingsService.updateOrganizationSettings(organizationId, data);
    res.status(200).json({
      success: true,
      data: settings,
    });
  },
};
