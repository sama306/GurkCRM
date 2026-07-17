import { Router } from 'express';
import { settingsController } from './settings.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { updateOrganizationSettingsSchema } from './settings.schema';

const router = Router();

router.get('/organization', requireAuth, settingsController.getOrganization);
router.patch(
  '/organization',
  requireAuth,
  requireRole(['ADMIN', 'OWNER']),
  validate(updateOrganizationSettingsSchema),
  settingsController.updateOrganization,
);

export { router as settingsRoutes };
