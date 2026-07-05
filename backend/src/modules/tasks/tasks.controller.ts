import type { Request, Response } from 'express';
import { tasksService } from './tasks.service';

export const tasksController = {
  async list(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;

    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const assigneeId = req.query.assigneeId as string | undefined;
    const dueDateFrom = req.query.dueDateFrom as string | undefined;
    const dueDateTo = req.query.dueDateTo as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const order = req.query.order as 'asc' | 'desc' | undefined;

    const result = await tasksService.listTasks(organizationId, {
      page, limit, search, status, priority, assigneeId, dueDateFrom, dueDateTo, sortBy, order,
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
    const task = await tasksService.getTaskById(organizationId, id);
    res.status(200).json({ success: true, data: task });
  },

  async create(req: Request, res: Response) {
    const organizationId = req.user!.organizationId;
    const task = await tasksService.createTask(organizationId, req.body);
    res.status(201).json({ success: true, data: task });
  },

  async update(req: Request, res: Response) {
    const { id: actorId, organizationId, role: actorRole } = req.user!;
    const taskId = req.params.id as string;
    const task = await tasksService.updateTask(actorId, actorRole, organizationId, taskId, req.body);
    res.status(200).json({ success: true, data: task });
  },

  async updateStatus(req: Request, res: Response) {
    const { id: actorId, organizationId, role: actorRole } = req.user!;
    const taskId = req.params.id as string;
    const { status } = req.body;
    const task = await tasksService.updateTaskStatus(actorId, actorRole, organizationId, taskId, status);
    res.status(200).json({ success: true, data: task });
  },

  async remove(req: Request, res: Response) {
    const { id: actorId, organizationId, role: actorRole } = req.user!;
    const taskId = req.params.id as string;
    await tasksService.deleteTask(actorId, actorRole, organizationId, taskId);
    res.status(204).json({ success: true, data: null });
  },
};
