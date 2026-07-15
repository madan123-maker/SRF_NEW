import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { createInvitationSchema, acceptInvitationSchema } from '../validators/invitation.validator';
import { uuidParamSchema } from '../../../shared/validators/common.validator';
import { paginationSchema } from '../../../shared/dto/pagination.dto';
import { requireAuthentication, requirePermission } from '../../authentication';

const router = Router();
const controller = new InvitationController();

// Public route for accepting invitations
router.post('/accept', validateRequest(acceptInvitationSchema), controller.acceptInvitation);

router.use(requireAuthentication);

router.get('/', validateRequest(paginationSchema), requirePermission('READ_INVITATION'), controller.search);
router.post('/', validateRequest(createInvitationSchema), requirePermission('CREATE_INVITATION'), controller.inviteUser);
router.post('/:id/cancel', validateRequest(uuidParamSchema), requirePermission('DELETE_INVITATION'), controller.cancelInvitation);

export default router;
