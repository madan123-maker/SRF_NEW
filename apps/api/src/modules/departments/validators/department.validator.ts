import { z } from 'zod';
import { commonValidators } from '../../../shared/validators/common.validator';

export const createDepartmentSchema = z.object({
  body: z.object({
    organizationId: commonValidators.uuid,
    parentId: commonValidators.uuid.optional().nullable(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(2, 'Code must be at least 2 characters'),
    description: z.string().optional().nullable(),
  })
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    parentId: commonValidators.uuid.optional().nullable(),
    name: z.string().min(2).optional(),
    code: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
});

export type CreateDepartmentDTO = z.infer<typeof createDepartmentSchema>['body'];
export type UpdateDepartmentDTO = z.infer<typeof updateDepartmentSchema>['body'];
