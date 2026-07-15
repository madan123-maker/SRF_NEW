import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';
import { sendSuccess, sendCreated, sendUpdated, sendDeleted, sendPaginated } from '../../../shared/utils/response.util';
import { getPaginatedMeta } from '../../../shared/prisma/prisma.helper';

export class RoleController {
  private service = new RoleService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await this.service.create(req.body);
      return sendCreated(res, 'Role created successfully', { role });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await this.service.update(req.params.id, req.body);
      return sendUpdated(res, 'Role updated successfully', { role });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await this.service.getById(req.params.id);
      return sendSuccess(res, 'Role retrieved successfully', { role });
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

      return sendPaginated(res, 'Roles retrieved successfully', { roles: data, meta });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id);
      return sendDeleted(res, 'Role deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
