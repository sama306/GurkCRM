import { Router } from 'express';
import { customersController } from './customers.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createCustomerSchema, updateCustomerSchema } from './customers.schema';

const router = Router();

router.get('/export', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), customersController.export);
router.get('/', requireAuth, customersController.list);
router.get('/:id', requireAuth, customersController.getById);
router.post('/', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(createCustomerSchema), customersController.create);
router.patch('/:id', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(updateCustomerSchema), customersController.update);
router.delete('/:id', requireAuth, requireRole(['ADMIN', 'OWNER']), customersController.remove);

export { router as customersRoutes };
