import { z } from 'zod';
import { commonValidators } from '../../../shared/validators/common.validator';

export const createApplicationSchema = z.object({
  body: z.object({
    editionId: commonValidators.uuid,
  })
});

export const updateAnswersSchema = z.object({
  body: z.object({
    answers: z.array(z.object({
      questionId: commonValidators.uuid,
      formFieldId: commonValidators.uuid,
      valueText: z.string().nullable().optional(),
      valueNumeric: z.number().nullable().optional(),
      valueBoolean: z.boolean().nullable().optional(),
      valueDate: z.string().datetime().nullable().optional(),
      valueJson: z.any().nullable().optional() // JSON or complex struct
    }))
  })
});

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    sort: z.string().optional(),
    search: z.string().optional(),
    filter: z.string().optional()
  })
});
