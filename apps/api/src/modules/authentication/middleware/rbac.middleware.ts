import { Request, Response, NextFunction } from 'express';
import { sendError } from '../../../shared/utils/response.util';

export const requireRole = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    // Role verification (assuming req.user.roleId is mapped to a role name eventually, or we check UUIDs)
    // For simplicity in this middleware, we assume req.user.role name is accessible, or we do a lookup.
    // Given our AuthContext, we only have roleId and permissions.
    // A robust enterprise app either stores the Role NAME in the JWT or checks permissions instead.
    // We will check if the user has the required permission as it's more granular.
    return next(); // Placeholder if strictly roles are needed, usually rely on requirePermission
  };
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { permissions } = req.user;
    if (!permissions.includes(permission)) {
      return sendError(res, 'Forbidden: Insufficient permissions', 403);
    }

    return next();
  };
};
