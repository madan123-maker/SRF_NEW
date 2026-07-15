import { Router } from 'express';
import { ActionPointController } from '../controllers/action-point.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { requireAuthentication } from '../../authentication/middleware/auth.middleware';
import { requirePermission } from '../../authentication/middleware/rbac.middleware';
import { createActionPointSchema, updateActionPointSchema } from '../validators/action-point.validator';

const router = Router();

// Routes mounted at /api/v1/action-points
router.post(
  '/',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'), // Or appropriate permission
  validateRequest(createActionPointSchema),
  ActionPointController.create
);

router.get(
  '/',
  requireAuthentication,
  ActionPointController.search
);

router.get(
  '/:id',
  requireAuthentication,
  ActionPointController.getById
);

router.patch(
  '/:id',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  validateRequest(updateActionPointSchema),
  ActionPointController.update
);

router.delete(
  '/:id',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  ActionPointController.softDelete
);

router.post(
  '/:id/restore',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  ActionPointController.restore
);

export default router;
