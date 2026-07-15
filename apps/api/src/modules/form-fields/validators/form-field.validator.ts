import { z } from 'zod';
import { FieldType } from '@prisma/client';

const fieldTypeSchema = z.nativeEnum(FieldType, {
  errorMap: () => ({ message: 'Invalid field type' })
});

export const createFormFieldSchema = z.object({
  questionId: z.string().uuid('Invalid Question ID'),
  label: z.string().min(1, 'Label is required').max(255),
  fieldKey: z.string().min(1, 'Field Key is required').max(100),
  fieldType: fieldTypeSchema,
  placeholder: z.string().max(255).optional(),
  helpText: z.string().max(1000).optional(),
  description: z.string().max(2000).optional(),
  defaultValue: z.string().max(1000).optional(),
  validationRules: z.record(z.any()).optional(),
  options: z.record(z.any()).optional(),
  displayOrder: z.number().int().min(0).optional(),
  width: z.string().max(50).optional(),
  section: z.string().max(100).optional(),
  isRequired: z.boolean().default(true),
  isReadOnly: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  isSearchable: z.boolean().default(false),
  isFilterable: z.boolean().default(false),
  isExportable: z.boolean().default(true),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  metadata: z.record(z.any()).optional(),
});

export const updateFormFieldSchema = z.object({
  label: z.string().min(1).max(255).optional(),
  fieldKey: z.string().min(1).max(100).optional(),
  fieldType: fieldTypeSchema.optional(),
  placeholder: z.string().max(255).optional(),
  helpText: z.string().max(1000).optional(),
  description: z.string().max(2000).optional(),
  defaultValue: z.string().max(1000).optional(),
  validationRules: z.record(z.any()).optional(),
  options: z.record(z.any()).optional(),
  displayOrder: z.number().int().min(0).optional(),
  width: z.string().max(50).optional(),
  section: z.string().max(100).optional(),
  isRequired: z.boolean().optional(),
  isReadOnly: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  isSearchable: z.boolean().optional(),
  isFilterable: z.boolean().optional(),
  isExportable: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateFormFieldDTO = z.infer<typeof createFormFieldSchema>;
export type UpdateFormFieldDTO = z.infer<typeof updateFormFieldSchema>;
