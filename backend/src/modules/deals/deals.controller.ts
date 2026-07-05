import type { Request, Response } from 'express';
import { dealsService } from './deals.service';

export const dealsController = {
  async list(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;

    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const search = req.query.search as string | undefined;
    const stage = req.query.stage as string | undefined;
    const ownerId = req.query.ownerId as string | undefined;
    const customerId = req.query.customerId as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const order = req.query.order as 'asc' | 'desc' | undefined;

    const result = await dealsService.listDeals(organizationId, {
      page, limit, search, stage, ownerId, customerId, sortBy, order,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  },

  async getBoard(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const board = await dealsService.getBoardDeals(organizationId);
    res.status(200).json({ success: true, data: board });
  },

  async getById(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;
    const deal = await dealsService.getDealById(organizationId, id);
    res.status(200).json({ success: true, data: deal });
  },

  async create(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const data = { ...req.body };
    if (!data.ownerId) {
      data.ownerId = req.user!.id;
    }
    const deal = await dealsService.createDeal(organizationId, data, req.user!.id);
    res.status(201).json({ success: true, data: deal });
  },

  async update(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;
    const deal = await dealsService.updateDeal(organizationId, id, req.body);
    res.status(200).json({ success: true, data: deal });
  },

  async changeStage(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;
    const { stage, position, lostReason } = req.body;
    const deal = await dealsService.changeDealStage(organizationId, id, stage, position, lostReason);
    res.status(200).json({ success: true, data: deal });
  },

  async remove(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;
    await dealsService.deleteDeal(organizationId, id);
    res.status(204).json({ success: true, data: null });
  },
};
