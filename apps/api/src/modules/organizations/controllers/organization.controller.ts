import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '../services/organization.service';
import { sendSuccess, sendCreated, sendUpdated, sendDeleted, sendPaginated } from '../../../shared/utils/response.util';
import { getPaginatedMeta } from '../../../shared/prisma/prisma.helper';

export class OrganizationController {
  private service = new OrganizationService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = await this.service.create(req.body);
      return sendCreated(res, 'Organization created successfully', { organization: org });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = await this.service.update(req.params.id, req.body);
      return sendUpdated(res, 'Organization updated successfully', { organization: org });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = await this.service.getById(req.params.id);
      return sendSuccess(res, 'Organization retrieved successfully', { organization: org });
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

      return sendPaginated(res, 'Organizations retrieved successfully', { organizations: data, meta });
    } catch (error) {
      next(error);
    }
  };

  softDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.softDelete(req.params.id);
      return sendDeleted(res, 'Organization deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  restore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = await this.service.restore(req.params.id);
      return sendSuccess(res, 'Organization restored successfully', { organization: org });
    } catch (error) {
      next(error);
    }
  };
}
