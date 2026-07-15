import { Request, Response, NextFunction } from 'express';
import { QuestionService } from '../services/question.service';
import { sendSuccess } from '../../../shared/utils/response.util';

const questionService = new QuestionService();

export class QuestionController {
  
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await questionService.create(req.body, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Question created successfully', data, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await questionService.update(id, req.body, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Question updated successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await questionService.softDelete(id, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Question deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }

  static async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await questionService.restore(id, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Question restored successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await questionService.getById(id, req.user!.organizationId || '');
      return sendSuccess(res, 'Question retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async getByActionPoint(req: Request, res: Response, next: NextFunction) {
    try {
      const { actionPointId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const { status } = req.query;
      const filters = status ? { status: String(status) } : {};

      const data = await questionService.findByActionPointId(actionPointId, req.user!.organizationId || '', page, limit, filters);
      return sendSuccess(res, 'Questions retrieved successfully', data);
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

      const data = await questionService.search(req.user!.organizationId || '', page, limit, filters);
      return sendSuccess(res, 'Questions retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
}
