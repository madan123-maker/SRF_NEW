import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { uuidParamSchema } from '../../../shared/validators/common.validator';
import { paginationSchema } from '../../../shared/dto/pagination.dto';
import { requireAuthentication, requirePermission } from '../../authentication';

const router = Router();
const controller = new UserController();

router.use(requireAuthentication);

router.get('/', validateRequest(paginationSchema), requirePermission('READ_USER'), controller.search);
router.get('/:id', validateRequest(uuidParamSchema), requirePermission('READ_USER'), controller.getById);

router.post('/', validateRequest(createUserSchema), requirePermission('CREATE_USER'), controller.create);
router.patch('/:id', validateRequest(uuidParamSchema), validateRequest(updateUserSchema), requirePermission('UPDATE_USER'), controller.update);

router.delete('/:id', validateRequest(uuidParamSchema), requirePermission('DELETE_USER'), controller.softDelete);
router.post('/:id/restore', validateRequest(uuidParamSchema), requirePermission('RESTORE_USER'), controller.restore);

export default router;
