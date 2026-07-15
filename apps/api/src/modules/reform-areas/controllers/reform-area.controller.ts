import { Request, Response, NextFunction } from 'express';
import { ReformAreaService } from '../services/reform-area.service';
import { sendSuccess } from '../../../shared/utils/response.util';

const reformAreaService = new ReformAreaService();

export class ReformAreaController {
  
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reformAreaService.create(req.body, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Reform Area created successfully', data, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await reformAreaService.update(id, req.body, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Reform Area updated successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await reformAreaService.softDelete(id, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Reform Area deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }

  static async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await reformAreaService.restore(id, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Reform Area restored successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await reformAreaService.getById(id, req.user!.organizationId || '');
      return sendSuccess(res, 'Reform Area retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async getByEdition(req: Request, res: Response, next: NextFunction) {
    try {
      const { editionId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const { status } = req.query;
      const filters = status ? { status: String(status) } : {};

      const data = await reformAreaService.findByEditionId(editionId, req.user!.organizationId || '', page, limit, filters);
      return sendSuccess(res, 'Reform Areas retrieved successfully', data);
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

      const data = await reformAreaService.search(req.user!.organizationId || '', page, limit, filters);
      return sendSuccess(res, 'Reform Areas retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
}
