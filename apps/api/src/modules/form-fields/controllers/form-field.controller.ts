import { Request, Response, NextFunction } from 'express';
import { FormFieldService } from '../services/form-field.service';
import { sendSuccess } from '../../../shared/utils/response.util';

const formFieldService = new FormFieldService();

export class FormFieldController {
  
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await formFieldService.create(req.body, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Form Field created successfully', data, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await formFieldService.update(id, req.body, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Form Field updated successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await formFieldService.softDelete(id, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Form Field deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }

  static async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await formFieldService.restore(id, req.user!.organizationId || '', req.user!.userId);
      return sendSuccess(res, 'Form Field restored successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await formFieldService.getById(id, req.user!.organizationId || '');
      return sendSuccess(res, 'Form Field retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async getByQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const { status, fieldType } = req.query;
      const filters: Record<string, unknown> = {};
      if (status) filters.status = String(status);
      if (fieldType) filters.fieldType = String(fieldType);

      const data = await formFieldService.findByQuestionId(questionId, req.user!.organizationId || '', page, limit, filters);
      return sendSuccess(res, 'Form Fields retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const { status, fieldType } = req.query;
      const filters: Record<string, unknown> = {};
      if (status) filters.status = String(status);
      if (fieldType) filters.fieldType = String(fieldType);

      const data = await formFieldService.search(req.user!.organizationId || '', page, limit, filters);
      return sendSuccess(res, 'Form Fields retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
}
