import { z } from 'zod';

export const createQuestionSchema = z.object({
  actionPointId: z.string().uuid('Invalid Action Point ID'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(500),
  code: z.string().min(2, 'Code must be at least 2 characters').max(100),
  slug: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  helpText: z.string().max(2000).optional(),
  instruction: z.string().max(2000).optional(),
  displayOrder: z.number().int().min(0).optional(),
  isRequired: z.boolean().default(true),
  isRepeatable: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  metadata: z.record(z.any()).optional(),
});

export const updateQuestionSchema = z.object({
  name: z.string().min(2).max(500).optional(),
  code: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  helpText: z.string().max(2000).optional(),
  instruction: z.string().max(2000).optional(),
  displayOrder: z.number().int().min(0).optional(),
  isRequired: z.boolean().optional(),
  isRepeatable: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateQuestionDTO = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionDTO = z.infer<typeof updateQuestionSchema>;
