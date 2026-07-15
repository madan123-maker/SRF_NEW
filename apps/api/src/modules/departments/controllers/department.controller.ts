import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service';
import { sendSuccess, sendCreated, sendUpdated, sendDeleted, sendPaginated } from '../../../shared/utils/response.util';
import { getPaginatedMeta } from '../../../shared/prisma/prisma.helper';

export class DepartmentController {
  private service = new DepartmentService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dept = await this.service.create(req.body);
      return sendCreated(res, 'Department created successfully', { department: dept });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dept = await this.service.update(req.params.id, req.body);
      return sendUpdated(res, 'Department updated successfully', { department: dept });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dept = await this.service.getById(req.params.id);
      return sendSuccess(res, 'Department retrieved successfully', { department: dept });
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const query = (req.query.search as string) || '';
      const orgId = req.params.organizationId; // Depends on route design. Let's assume passed in query or body.

      const { data, total } = await this.service.search(orgId, query, page, limit);
      const meta = getPaginatedMeta(total, page, limit);

      return sendPaginated(res, 'Departments retrieved successfully', { departments: data, meta });
    } catch (error) {
      next(error);
    }
  };

  softDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.softDelete(req.params.id);
      return sendDeleted(res, 'Department deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  restore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dept = await this.service.restore(req.params.id);
      return sendSuccess(res, 'Department restored successfully', { department: dept });
    } catch (error) {
      next(error);
    }
  };
}
