import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { requireAuthentication } from '../../authentication/middleware/auth.middleware';
import { requirePermission } from '../../authentication/middleware/rbac.middleware';
import { createApplicationSchema, updateAnswersSchema, paginationQuerySchema } from '../validators/application.validator';

const router = Router();
const controller = new ApplicationController();

// All application routes require authentication
router.use(requireAuthentication);

router.get(
  '/',
  validateRequest(paginationQuerySchema),
  controller.getApplications
);

router.post(
  '/',
  requirePermission('SUBMIT_APPLICATION'),
  validateRequest(createApplicationSchema),
  controller.createDraft
);

router.get(
  '/:id',
  controller.getApplicationDetails
);

router.patch(
  '/:id',
  requirePermission('SUBMIT_APPLICATION'),
  validateRequest(updateAnswersSchema),
  controller.updateAnswers
);

router.post(
  '/:id/submit',
  requirePermission('SUBMIT_APPLICATION'),
  controller.submitApplication
);

router.get(
  '/:id/progress',
  controller.getProgress
);

export default router;
