import { Router } from 'express';
import { z } from 'zod';
import { EditionController } from '../controllers/edition.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { createEditionSchema, updateEditionSchema } from '../validators/edition.validator';
import { uuidParamSchema } from '../../../shared/validators/common.validator';
import { paginationSchema } from '../../../shared/dto/pagination.dto';
import { requireAuthentication, requirePermission } from '../../authentication';

const router = Router();
const controller = new EditionController();

const statusSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'CLOSED', 'ARCHIVED', 'CANCELLED'])
  })
});

const lockSchema = z.object({
  body: z.object({
    isLocked: z.boolean()
  })
});

const cloneSchema = z.object({
  body: z.object({
    bumpType: z.enum(['MAJOR', 'MINOR', 'DUPLICATE']).optional().default('DUPLICATE')
  })
});

router.use(requireAuthentication);

router.get('/', validateRequest(paginationSchema), requirePermission('READ_EDITION'), controller.search);
router.get('/:id', validateRequest(uuidParamSchema), requirePermission('READ_EDITION'), controller.getById);

router.post('/', validateRequest(createEditionSchema), requirePermission('CREATE_EDITION'), controller.create);
router.patch('/:id', validateRequest(uuidParamSchema), validateRequest(updateEditionSchema), requirePermission('UPDATE_EDITION'), controller.update);

router.post('/:id/status', validateRequest(uuidParamSchema), validateRequest(statusSchema), requirePermission('UPDATE_EDITION'), controller.changeStatus);
router.post('/:id/lock', validateRequest(uuidParamSchema), validateRequest(lockSchema), requirePermission('UPDATE_EDITION'), controller.toggleLock);
router.post('/:id/clone', validateRequest(uuidParamSchema), validateRequest(cloneSchema), requirePermission('CREATE_EDITION'), controller.clone);

router.delete('/:id', validateRequest(uuidParamSchema), requirePermission('DELETE_EDITION'), controller.softDelete);
router.post('/:id/restore', validateRequest(uuidParamSchema), requirePermission('RESTORE_EDITION'), controller.restore);

export default router;
