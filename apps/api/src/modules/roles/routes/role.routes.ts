import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { createRoleSchema, updateRoleSchema } from '../validators/role.validator';
import { uuidParamSchema } from '../../../shared/validators/common.validator';
import { paginationSchema } from '../../../shared/dto/pagination.dto';
import { requireAuthentication, requirePermission } from '../../authentication';

const router = Router();
const controller = new RoleController();

router.use(requireAuthentication);

router.get('/', validateRequest(paginationSchema), requirePermission('READ_ROLE'), controller.search);
router.get('/:id', validateRequest(uuidParamSchema), requirePermission('READ_ROLE'), controller.getById);

router.post('/', validateRequest(createRoleSchema), requirePermission('CREATE_ROLE'), controller.create);
router.patch('/:id', validateRequest(uuidParamSchema), validateRequest(updateRoleSchema), requirePermission('UPDATE_ROLE'), controller.update);

router.delete('/:id', validateRequest(uuidParamSchema), requirePermission('DELETE_ROLE'), controller.delete);

export default router;
