import { z } from 'zod';
import { commonValidators } from '../../../shared/validators/common.validator';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional().nullable(),
    permissionIds: z.array(commonValidators.uuid).optional().default([]),
  })
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    permissionIds: z.array(commonValidators.uuid).optional(),
  })
});

export type CreateRoleDTO = z.infer<typeof createRoleSchema>['body'];
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>['body'];
