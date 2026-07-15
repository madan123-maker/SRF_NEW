import { Request, Response, NextFunction } from 'express';
import { EditionService } from '../services/edition.service';
import { sendSuccess, sendCreated, sendUpdated, sendDeleted, sendPaginated } from '../../../shared/utils/response.util';
import { getPaginatedMeta } from '../../../shared/prisma/prisma.helper';
import { EditionStatus } from '@prisma/client';
import { AuthorizationError } from '../../../shared/errors/AppError';

export class EditionController {
  private service = new EditionService();

  private getUserOrgId(req: Request): string {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      throw new AuthorizationError('User does not belong to an organization');
    }
    return orgId;
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const edition = await this.service.create(req.body, req.user!.userId, this.getUserOrgId(req));
      return sendCreated(res, 'Edition created successfully', { edition });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const edition = await this.service.update(req.params.id, req.body, req.user!.userId, this.getUserOrgId(req));
      return sendUpdated(res, 'Edition updated successfully', { edition });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const edition = await this.service.getById(req.params.id, this.getUserOrgId(req));
      return sendSuccess(res, 'Edition retrieved successfully', { edition });
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const query = (req.query.search as string) || '';
      const status = req.query.status as EditionStatus;
      
      const { data, total } = await this.service.search(this.getUserOrgId(req), query, page, limit, status);
      const meta = getPaginatedMeta(total, page, limit);

      return sendPaginated(res, 'Editions retrieved successfully', { editions: data, meta });
    } catch (error) {
      next(error);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const edition = await this.service.changeStatus(req.params.id, status, req.user!.userId, this.getUserOrgId(req));
      return sendUpdated(res, `Edition status changed to ${status}`, { edition });
    } catch (error) {
      next(error);
    }
  };

  clone = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bumpType } = req.body;
      const edition = await this.service.clone(req.params.id, req.user!.userId, this.getUserOrgId(req), bumpType);
      return sendCreated(res, 'Edition cloned successfully', { edition });
    } catch (error) {
      next(error);
    }
  };

  toggleLock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isLocked } = req.body;
      const edition = await this.service.toggleLock(req.params.id, isLocked, req.user!.userId, this.getUserOrgId(req));
      return sendUpdated(res, `Edition ${isLocked ? 'locked' : 'unlocked'} successfully`, { edition });
    } catch (error) {
      next(error);
    }
  };

  softDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.softDelete(req.params.id, req.user!.userId, this.getUserOrgId(req));
      return sendDeleted(res, 'Edition deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  restore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const edition = await this.service.restore(req.params.id, req.user!.userId, this.getUserOrgId(req));
      return sendSuccess(res, 'Edition restored successfully', { edition });
    } catch (error) {
      next(error);
    }
  };
}
