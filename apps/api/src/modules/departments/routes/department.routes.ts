import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { updateDepartmentSchema, createDepartmentSchema } from '../validators/department.validator';
import { uuidParamSchema } from '../../../shared/validators/common.validator';
import { paginationSchema } from '../../../shared/dto/pagination.dto';
import { requireAuthentication, requirePermission } from '../../authentication';

const router = Router();
const controller = new DepartmentController();

router.use(requireAuthentication);

// Note: In an enterprise app, search might be scoped by OrganizationId passed in query
router.get('/organization/:organizationId', validateRequest(paginationSchema), requirePermission('READ_DEPARTMENT'), controller.search);
router.get('/:id', validateRequest(uuidParamSchema), requirePermission('READ_DEPARTMENT'), controller.getById);

router.post('/', validateRequest(createDepartmentSchema), requirePermission('CREATE_DEPARTMENT'), controller.create);
router.patch('/:id', validateRequest(uuidParamSchema), validateRequest(updateDepartmentSchema), requirePermission('UPDATE_DEPARTMENT'), controller.update);

router.delete('/:id', validateRequest(uuidParamSchema), requirePermission('DELETE_DEPARTMENT'), controller.softDelete);
router.post('/:id/restore', validateRequest(uuidParamSchema), requirePermission('RESTORE_DEPARTMENT'), controller.restore);

export default router;
