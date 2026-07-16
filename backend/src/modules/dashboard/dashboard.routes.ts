import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/summary', requireAuth, dashboardController.getSummary);
router.get('/recent-activity', requireAuth, dashboardController.getRecentActivity);

export { router as dashboardRoutes };
