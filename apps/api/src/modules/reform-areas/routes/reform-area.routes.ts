import { Router } from 'express';
import { ReformAreaController } from '../controllers/reform-area.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { requireAuthentication } from '../../authentication/middleware/auth.middleware';
import { requirePermission } from '../../authentication/middleware/rbac.middleware';
import { createReformAreaSchema, updateReformAreaSchema } from '../validators/reform-area.validator';

const router = Router();

// Routes mounted at /api/v1/reform-areas
router.post(
  '/',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'), // Or appropriate permission
  validateRequest(createReformAreaSchema),
  ReformAreaController.create
);

router.get(
  '/',
  requireAuthentication,
  ReformAreaController.search
);

router.get(
  '/:id',
  requireAuthentication,
  ReformAreaController.getById
);

router.patch(
  '/:id',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  validateRequest(updateReformAreaSchema),
  ReformAreaController.update
);

router.delete(
  '/:id',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  ReformAreaController.softDelete
);

router.post(
  '/:id/restore',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  ReformAreaController.restore
);

export default router;
