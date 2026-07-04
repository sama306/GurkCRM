import type { Request, Response } from 'express';
import { companiesService } from './companies.service';

export const companiesController = {
  async list(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;

    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const search = req.query.search as string | undefined;
    const industry = req.query.industry as string | undefined;
    const status = req.query.status as string | undefined;
    const size = req.query.size as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const order = req.query.order as 'asc' | 'desc' | undefined;

    const result = await companiesService.listCompanies(organizationId, {
      page, limit, search, industry, status, size, sortBy, order,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  },

  async getById(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;

    const company = await companiesService.getCompanyById(organizationId, id);

    res.status(200).json({
      success: true,
      data: company,
    });
  },

  async create(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;

    const company = await companiesService.createCompany(organizationId, req.body);

    res.status(201).json({
      success: true,
      data: company,
    });
  },

  async update(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;

    const company = await companiesService.updateCompany(organizationId, id, req.body);

    res.status(200).json({
      success: true,
      data: company,
    });
  },

  async remove(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;

    await companiesService.deleteCompany(organizationId, id);

    res.status(204).json({
      success: true,
      data: null,
    });
  },
};
