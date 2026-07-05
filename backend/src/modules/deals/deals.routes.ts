import { Router } from 'express';
import { dealsController } from './deals.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createDealSchema, updateDealSchema, changeStageSchema } from './deals.schema';

const router = Router();

router.get('/board', requireAuth, dealsController.getBoard);
router.get('/', requireAuth, dealsController.list);
router.get('/:id', requireAuth, dealsController.getById);
router.post('/', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(createDealSchema), dealsController.create);
router.patch('/:id/stage', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(changeStageSchema), dealsController.changeStage);
router.patch('/:id', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(updateDealSchema), dealsController.update);
router.delete('/:id', requireAuth, requireRole(['ADMIN', 'OWNER']), dealsController.remove);

export { router as dealsRoutes };
