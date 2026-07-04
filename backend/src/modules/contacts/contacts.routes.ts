import { Router } from 'express';
import { contactsController } from './contacts.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createContactSchema, updateContactSchema } from './contacts.schema';

const router = Router();

router.get('/companies/:companyId/contacts', requireAuth, contactsController.listByCompany);
router.post('/companies/:companyId/contacts', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(createContactSchema), contactsController.create);
router.patch('/contacts/:id', requireAuth, requireRole(['SALES', 'ADMIN', 'OWNER']), validate(updateContactSchema), contactsController.update);
router.delete('/contacts/:id', requireAuth, requireRole(['ADMIN', 'OWNER']), contactsController.remove);

export { router as contactsRoutes };
