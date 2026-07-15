import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { requireAuthentication } from '../../authentication/middleware/auth.middleware';
import { requirePermission } from '../../authentication/middleware/rbac.middleware';
import { createQuestionSchema, updateQuestionSchema } from '../validators/question.validator';

const router = Router();

// Routes mounted at /api/v1/questions
router.post(
  '/',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  validateRequest(createQuestionSchema),
  QuestionController.create
);

router.get(
  '/',
  requireAuthentication,
  QuestionController.search
);

router.get(
  '/:id',
  requireAuthentication,
  QuestionController.getById
);

router.patch(
  '/:id',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  validateRequest(updateQuestionSchema),
  QuestionController.update
);

router.delete(
  '/:id',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  QuestionController.softDelete
);

router.post(
  '/:id/restore',
  requireAuthentication,
  requirePermission('MANAGE_SCHEMA'),
  QuestionController.restore
);

export default router;
