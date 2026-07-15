import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../../../shared/utils/response.util';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.register(req.body, req.headers['user-agent'], req.ip);
      return sendSuccess(res, 'User registered successfully', { user }, 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.authService.login(req.body, req.headers['user-agent'], req.ip);
      
      // Set secure HttpOnly cookie for refresh token
      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return sendSuccess(res, 'Login successful', { accessToken: data.accessToken, user: data.user });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) throw new Error('Refresh token missing');
      
      const { accessToken } = await this.authService.refresh(refreshToken);
      return sendSuccess(res, 'Token refreshed', { accessToken });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }
      res.clearCookie('refreshToken');
      return sendSuccess(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };

  logoutAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.logoutAll(req.user!.userId);
      res.clearCookie('refreshToken');
      return sendSuccess(res, 'Logged out from all devices');
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.forgotPassword(req.body.email);
      return sendSuccess(res, 'If an account exists, a reset link has been sent');
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.resetPassword(req.body);
      return sendSuccess(res, 'Password has been reset successfully');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.changePassword(req.user!.userId, req.body);
      return sendSuccess(res, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, 'Current user context', { user: req.user });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Stub for email verification
      return sendSuccess(res, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  };
}
