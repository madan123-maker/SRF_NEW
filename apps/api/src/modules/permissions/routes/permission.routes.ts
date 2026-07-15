import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { createPermissionSchema, updatePermissionSchema } from '../validators/permission.validator';
import { uuidParamSchema } from '../../../shared/validators/common.validator';
import { paginationSchema } from '../../../shared/dto/pagination.dto';
import { requireAuthentication, requirePermission } from '../../authentication';

const router = Router();
const controller = new PermissionController();

router.use(requireAuthentication);

router.get('/', validateRequest(paginationSchema), requirePermission('READ_PERMISSION'), controller.search);
router.get('/:id', validateRequest(uuidParamSchema), requirePermission('READ_PERMISSION'), controller.getById);

router.post('/', validateRequest(createPermissionSchema), requirePermission('CREATE_PERMISSION'), controller.create);
router.patch('/:id', validateRequest(uuidParamSchema), validateRequest(updatePermissionSchema), requirePermission('UPDATE_PERMISSION'), controller.update);

router.delete('/:id', validateRequest(uuidParamSchema), requirePermission('DELETE_PERMISSION'), controller.delete);

export default router;
