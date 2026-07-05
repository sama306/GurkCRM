import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from './tasks.schema';

const router = Router();

router.get('/', requireAuth, tasksController.list);
router.get('/:id', requireAuth, tasksController.getById);
router.post('/', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(createTaskSchema), tasksController.create);
router.patch('/:id/status', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(updateTaskStatusSchema), tasksController.updateStatus);
router.patch('/:id', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(updateTaskSchema), tasksController.update);
router.delete('/:id', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), tasksController.remove);

export { router as tasksRoutes };
