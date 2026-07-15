import { z } from 'zod';

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(2, 'Code must be at least 2 characters'),
    type: z.enum(['STATE', 'UT', 'DPIIT']).optional().default('STATE'),
    logoUrl: z.string().url().optional(),
    metadata: z.record(z.any()).optional(),
  })
});

export const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    code: z.string().min(2).optional(),
    type: z.enum(['STATE', 'UT', 'DPIIT']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    logoUrl: z.string().url().optional(),
    metadata: z.record(z.any()).optional(),
  })
});

export type CreateOrganizationDTO = z.infer<typeof createOrganizationSchema>['body'];
export type UpdateOrganizationDTO = z.infer<typeof updateOrganizationSchema>['body'];
