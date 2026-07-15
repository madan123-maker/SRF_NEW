import { z } from 'zod';
import { commonValidators } from '../../../shared/validators/common.validator';

export const createInvitationSchema = z.object({
  body: z.object({
    email: commonValidators.email,
    roleId: commonValidators.uuid,
    organizationId: commonValidators.uuid.optional().nullable(),
    departmentId: commonValidators.uuid.optional().nullable(),
  })
});

export const acceptInvitationSchema = z.object({
  body: z.object({
    token: z.string(),
    username: z.string().min(3),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: commonValidators.password,
    mobile: commonValidators.phone.optional().nullable(),
  })
});

export type CreateInvitationDTO = z.infer<typeof createInvitationSchema>['body'];
export type AcceptInvitationDTO = z.infer<typeof acceptInvitationSchema>['body'];
