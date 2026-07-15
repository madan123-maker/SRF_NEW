import { Router } from 'express';
import { FormFieldController } from '../controllers/form-field.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { requireAuthentication } from '../../authentication/middleware/auth.middleware';
import { requirePermission } from '../../authentication/middleware/rbac.middleware';
import { createFormFieldSchema, updateFormFieldSchema } from '../validators/form-field.validator';

const router = Router();

// Routes mounted at /api/v1/form-fields
router.post(
  '/',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  validateRequest(createFormFieldSchema),
  FormFieldController.create
);

router.get(
  '/',
  requireAuthentication,
  FormFieldController.search
);

router.get(
  '/:id',
  requireAuthentication,
  FormFieldController.getById
);

router.patch(
  '/:id',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  validateRequest(updateFormFieldSchema),
  FormFieldController.update
);

router.delete(
  '/:id',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  FormFieldController.softDelete
);

router.post(
  '/:id/restore',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  FormFieldController.restore
);

export default router;
