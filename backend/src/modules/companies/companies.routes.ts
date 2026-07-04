import { Router } from 'express';
import { companiesController } from './companies.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createCompanySchema, updateCompanySchema } from './companies.schema';

const router = Router();

router.get('/', requireAuth, companiesController.list);
router.get('/:id', requireAuth, companiesController.getById);
router.post('/', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(createCompanySchema), companiesController.create);
router.patch('/:id', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(updateCompanySchema), companiesController.update);
router.delete('/:id', requireAuth, requireRole(['ADMIN', 'OWNER']), companiesController.remove);

export { router as companiesRoutes };
