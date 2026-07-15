import { Router } from 'express';
import { usersController } from './users.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  updateUserSchema,
  updateOwnProfileSchema,
  changePasswordSchema,
} from './users.schema';

const router = Router();

router.get('/', requireAuth, requireRole(['VIEWER', 'SALES', 'ADMIN', 'OWNER']), usersController.list);

router.patch('/me', requireAuth, validate(updateOwnProfileSchema), usersController.updateMe);
router.patch('/me/password', requireAuth, validate(changePasswordSchema), usersController.changeMyPassword);

router.get('/:id', requireAuth, requireRole(['ADMIN', 'OWNER']), usersController.getById);
router.patch('/:id', requireAuth, requireRole(['ADMIN', 'OWNER']), validate(updateUserSchema), usersController.update);

export { router as usersRoutes };
