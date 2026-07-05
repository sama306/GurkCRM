import type { Request, Response } from 'express';
import { customersService } from './customers.service';

export const customersController = {
  async list(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;

    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const ownerId = req.query.ownerId as string | undefined;
    const companyId = req.query.companyId as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const order = req.query.order as 'asc' | 'desc' | undefined;

    const result = await customersService.listCustomers(organizationId, {
      page, limit, search, status, ownerId, companyId, sortBy, order,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  },

  async export(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;

    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const ownerId = req.query.ownerId as string | undefined;
    const companyId = req.query.companyId as string | undefined;

    const csv = await customersService.exportCustomers(organizationId, {
      search, status, ownerId, companyId,
    }, 'csv');

    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="customers_${date}.csv"`);
    res.status(200).send(csv);
  },

  async getById(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;

    const customer = await customersService.getCustomerById(organizationId, id);

    res.status(200).json({
      success: true,
      data: customer,
    });
  },

  async create(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const data = { ...req.body };

    if (!data.ownerId) {
      data.ownerId = req.user!.id;
    }

    const customer = await customersService.createCustomer(organizationId, data);

    res.status(201).json({
      success: true,
      data: customer,
    });
  },

  async update(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;

    const customer = await customersService.updateCustomer(organizationId, id, req.body);

    res.status(200).json({
      success: true,
      data: customer,
    });
  },

  async remove(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const id = req.params.id as string;

    await customersService.deleteCustomer(organizationId, id);

    res.status(204).json({
      success: true,
      data: null,
    });
  },
};
