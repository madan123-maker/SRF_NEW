import { Request, Response, NextFunction } from 'express';
import { ActionPointService } from '../services/action-point.service';
import { sendSuccess } from '../../../shared/utils/response.util';

const actionPointService = new ActionPointService();

export class ActionPointController {
  
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await actionPointService.create(req.body, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Action Point created successfully', data, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await actionPointService.update(id, req.body, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Action Point updated successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await actionPointService.softDelete(id, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Action Point deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }

  static async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await actionPointService.restore(id, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Action Point restored successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await actionPointService.getById(id, req.user!.organizationId || '');
      return sendSuccess(res, 'Action Point retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async getByReformArea(req: Request, res: Response, next: NextFunction) {
    try {
      const { reformAreaId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const { status } = req.query;
      const filters = status ? { status: String(status) } : {};

      const data = await actionPointService.findByReformAreaId(reformAreaId, req.user!.organizationId || '', page, limit, filters);
      return sendSuccess(res, 'Action Points retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const { status } = req.query;
      const filters = status ? { status: String(status) } : {};

      const data = await actionPointService.search(req.user!.organizationId || '', page, limit, filters);
      return sendSuccess(res, 'Action Points retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
}
