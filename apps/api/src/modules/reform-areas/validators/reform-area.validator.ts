import { z } from 'zod';

export const createReformAreaSchema = z.object({
  editionId: z.string().uuid('Invalid Edition ID'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Code must be at least 2 characters').max(50),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, 'Invalid hex color code').optional(),
  icon: z.string().max(100).optional(),
  displayOrder: z.number().int().min(0).optional(),
  maxScore: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  metadata: z.record(z.any()).optional(),
});

export const updateReformAreaSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i).optional(),
  icon: z.string().max(100).optional(),
  displayOrder: z.number().int().min(0).optional(),
  maxScore: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateReformAreaDTO = z.infer<typeof createReformAreaSchema>;
export type UpdateReformAreaDTO = z.infer<typeof updateReformAreaSchema>;
