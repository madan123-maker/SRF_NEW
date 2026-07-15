import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permission.service';
import { sendSuccess, sendCreated, sendUpdated, sendDeleted, sendPaginated } from '../../../shared/utils/response.util';
import { getPaginatedMeta } from '../../../shared/prisma/prisma.helper';

export class PermissionController {
  private service = new PermissionService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permission = await this.service.create(req.body);
      return sendCreated(res, 'Permission created successfully', { permission });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permission = await this.service.update(req.params.id, req.body);
      return sendUpdated(res, 'Permission updated successfully', { permission });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permission = await this.service.getById(req.params.id);
      return sendSuccess(res, 'Permission retrieved successfully', { permission });
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const query = (req.query.search as string) || '';

      const { data, total } = await this.service.search(query, page, limit);
      const meta = getPaginatedMeta(total, page, limit);

      return sendPaginated(res, 'Permissions retrieved successfully', { permissions: data, meta });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id);
      return sendDeleted(res, 'Permission deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
