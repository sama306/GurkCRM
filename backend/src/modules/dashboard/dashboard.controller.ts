import type { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  async getSummary(req: Request, res: Response) {
    const { organizationId, id: userId } = req.user!;
    const summary = await dashboardService.getSummary(organizationId, userId);
    res.status(200).json({ success: true, data: summary });
  },

  async getRecentActivity(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const activity = await dashboardService.getRecentActivity(
      organizationId,
      limit,
    );
    res.status(200).json({ success: true, data: activity });
  },
};
