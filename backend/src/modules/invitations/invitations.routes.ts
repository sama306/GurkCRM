import { Router } from 'express';
import { invitationsController } from './invitations.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createInvitationSchema } from './invitations.schema';

const router = Router();

router.post('/', requireAuth, requireRole(['ADMIN', 'OWNER']), validate(createInvitationSchema), invitationsController.create);
router.get('/', requireAuth, requireRole(['ADMIN', 'OWNER']), invitationsController.list);
router.delete('/:id', requireAuth, requireRole(['ADMIN', 'OWNER']), invitationsController.revoke);

export { router as invitationsRoutes };
