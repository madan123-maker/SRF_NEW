import { z } from 'zod';

export const createActionPointSchema = z.object({
  reformAreaId: z.string().uuid('Invalid Reform Area ID'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  code: z.string().min(2, 'Code must be at least 2 characters').max(50),
  slug: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  objective: z.string().max(2000).optional(),
  guidance: z.string().max(2000).optional(),
  helpText: z.string().max(1000).optional(),
  displayOrder: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  metadata: z.record(z.any()).optional(),
});

export const updateActionPointSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  code: z.string().min(2).max(50).optional(),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  objective: z.string().max(2000).optional(),
  guidance: z.string().max(2000).optional(),
  helpText: z.string().max(1000).optional(),
  displayOrder: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateActionPointDTO = z.infer<typeof createActionPointSchema>;
export type UpdateActionPointDTO = z.infer<typeof updateActionPointSchema>;
