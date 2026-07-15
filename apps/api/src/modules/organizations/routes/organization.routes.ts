import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { createOrganizationSchema, updateOrganizationSchema } from '../validators/organization.validator';
import { uuidParamSchema } from '../../../shared/validators/common.validator';
import { paginationSchema } from '../../../shared/dto/pagination.dto';
import { requireAuthentication, requirePermission } from '../../authentication';

const router = Router();
const controller = new OrganizationController();

router.use(requireAuthentication);

router.get('/', validateRequest(paginationSchema), requirePermission('READ_ORGANIZATION'), controller.search);
router.get('/:id', validateRequest(uuidParamSchema), requirePermission('READ_ORGANIZATION'), controller.getById);

router.post('/', validateRequest(createOrganizationSchema), requirePermission('CREATE_ORGANIZATION'), controller.create);
router.patch('/:id', validateRequest(uuidParamSchema), validateRequest(updateOrganizationSchema), requirePermission('UPDATE_ORGANIZATION'), controller.update);

router.delete('/:id', validateRequest(uuidParamSchema), requirePermission('DELETE_ORGANIZATION'), controller.softDelete);
router.post('/:id/restore', validateRequest(uuidParamSchema), requirePermission('RESTORE_ORGANIZATION'), controller.restore);

export default router;
