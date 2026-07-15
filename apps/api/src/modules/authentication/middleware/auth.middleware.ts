import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { sendError } from '../../../shared/utils/response.util';
import { AuthContext } from '../dto/auth.dto';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: AuthContext;
    }
  }
}

export const requireAuthentication = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const tokenService = new TokenService();
    const decoded = tokenService.verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};
