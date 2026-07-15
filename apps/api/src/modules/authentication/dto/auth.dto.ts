import { z } from 'zod';
import { 
  registerSchema, 
  loginSchema, 
  changePasswordSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from '../validators/auth.validator';

export type RegisterDTO = z.infer<typeof registerSchema>['body'];
export type LoginDTO = z.infer<typeof loginSchema>['body'];
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>['body'];
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>['body'];

export interface AuthContext {
  userId: string;
  roleId: string;
  organizationId?: string | null;
  departmentId?: string | null;
  permissions: string[];
  sessionId: string;
}
