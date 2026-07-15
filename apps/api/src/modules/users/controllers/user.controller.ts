/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess, sendCreated, sendUpdated, sendDeleted, sendPaginated } from '../../../shared/utils/response.util';
import { getPaginatedMeta } from '../../../shared/prisma/prisma.helper';

export class UserController {
  private service = new UserService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.create(req.body);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...safeUser } = user;
      return sendCreated(res, 'User created successfully', { user: safeUser });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.update(req.params.id, req.body);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...safeUser } = user;
      return sendUpdated(res, 'User updated successfully', { user: safeUser });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.getById(req.params.id);
      return sendSuccess(res, 'User retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const query = (req.query.search as string) || '';
      
      const filters: any = {};
      if (req.query.organizationId) filters.organizationId = req.query.organizationId;
      if (req.query.departmentId) filters.departmentId = req.query.departmentId;
      if (req.query.roleId) filters.roleId = req.query.roleId;

      const { data, total } = await this.service.search(query, page, limit, filters);
      const meta = getPaginatedMeta(total, page, limit);

      return sendPaginated(res, 'Users retrieved successfully', { users: data, meta });
    } catch (error) {
      next(error);
    }
  };

  softDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.softDelete(req.params.id);
      return sendDeleted(res, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  restore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.restore(req.params.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...safeUser } = user;
      return sendSuccess(res, 'User restored successfully', { user: safeUser });
    } catch (error) {
      next(error);
    }
  };
}
