import { z } from 'zod';
import { commonValidators } from '../../../shared/validators/common.validator';

export const createEditionSchema = z.object({
  body: z.object({
    organizationId: commonValidators.uuid,
    departmentId: commonValidators.uuid.optional().nullable(),
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional().nullable(),
    financialYear: z.string().min(4),
    openingDate: z.string().datetime().optional().nullable(),
    closingDate: z.string().datetime().optional().nullable(),
    visibility: z.enum(['PRIVATE', 'INTERNAL', 'PUBLIC']).optional(),
    metadata: z.record(z.any()).optional().nullable(),
  })
});

export const updateEditionSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional().nullable(),
    financialYear: z.string().min(4).optional(),
    openingDate: z.string().datetime().optional().nullable(),
    closingDate: z.string().datetime().optional().nullable(),
    visibility: z.enum(['PRIVATE', 'INTERNAL', 'PUBLIC']).optional(),
    metadata: z.record(z.any()).optional().nullable(),
  })
});

export type CreateEditionDTO = z.infer<typeof createEditionSchema>['body'];
export type UpdateEditionDTO = z.infer<typeof updateEditionSchema>['body'];
