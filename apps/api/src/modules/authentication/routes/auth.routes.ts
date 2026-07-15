import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../../../shared/middleware/validate.middleware';
import { requireAuthentication } from '../middleware/auth.middleware';
import { 
  registerSchema, 
  loginSchema, 
  changePasswordSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from '../validators/auth.validator';

const router = Router();
const controller = new AuthController();

// Public Routes
router.post('/register', validateRequest(registerSchema), controller.register);
router.post('/login', validateRequest(loginSchema), controller.login);
router.post('/refresh', controller.refresh); // Body or Cookie validation
router.post('/forgot-password', validateRequest(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), controller.resetPassword);
router.get('/verify-email', controller.verifyEmail); // Normally uses a token query param

// Protected Routes
router.use(requireAuthentication);
router.post('/logout', controller.logout);
router.post('/logout-all', controller.logoutAll);
router.post('/change-password', validateRequest(changePasswordSchema), controller.changePassword);
router.get('/me', controller.me);

export default router;
