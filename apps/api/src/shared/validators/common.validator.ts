import { z } from 'zod';

export const commonValidators = {
  uuid: z.string().uuid('Invalid UUID format'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long').regex(/[a-z]/, 'Password must contain a lowercase letter').regex(/[A-Z]/, 'Password must contain an uppercase letter').regex(/[0-9]/, 'Password must contain a number'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  }).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
    message: "End date cannot be earlier than start date",
    path: ["endDate"]
  })
};

export const uuidParamSchema = z.object({
  params: z.object({
    id: commonValidators.uuid
  })
});
