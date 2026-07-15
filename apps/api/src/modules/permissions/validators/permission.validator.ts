import { z } from 'zod';

export const createPermissionSchema = z.object({
  body: z.object({
    action: z.string().min(2, 'Action must be at least 2 characters'),
    description: z.string().optional().nullable(),
  })
});

export const updatePermissionSchema = z.object({
  body: z.object({
    action: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
  })
});

export type CreatePermissionDTO = z.infer<typeof createPermissionSchema>['body'];
export type UpdatePermissionDTO = z.infer<typeof updatePermissionSchema>['body'];
