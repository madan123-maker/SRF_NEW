import { z } from 'zod';
import { commonValidators } from '../../../shared/validators/common.validator';

export const createUserSchema = z.object({
  body: z.object({
    email: commonValidators.email,
    username: z.string().min(3),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: commonValidators.password,
    mobile: commonValidators.phone.optional().nullable(),
    roleId: commonValidators.uuid,
    organizationId: commonValidators.uuid.optional().nullable(),
    departmentId: commonValidators.uuid.optional().nullable(),
  })
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    mobile: commonValidators.phone.optional().nullable(),
    active: z.boolean().optional(),
    roleId: commonValidators.uuid.optional(),
    organizationId: commonValidators.uuid.optional().nullable(),
    departmentId: commonValidators.uuid.optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    preferences: z.record(z.any()).optional().nullable(),
  })
});

export type CreateUserDTO = z.infer<typeof createUserSchema>['body'];
export type UpdateUserDTO = z.infer<typeof updateUserSchema>['body'];
