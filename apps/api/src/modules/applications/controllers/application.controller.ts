import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../services/application.service';

export class ApplicationController {
  private service: ApplicationService;

  constructor() {
    this.service = new ApplicationService();
  }

  getApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user!.organizationId as string;
      // Assume query parsing middleware extracts this properly, or we extract manually
      const { page, limit, sort, search, filter } = req.query as Record<string, string | undefined>;
      const result = await this.service.getApplications(organizationId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sort,
        search,
        filter
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  createDraft = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { editionId } = req.body;
      const organizationId = req.user!.organizationId as string;
      const userId = req.user!.userId;
      const application = await this.service.createDraft(editionId, organizationId, userId);
      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  };

  getApplicationDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const organizationId = req.user!.organizationId as string;
      const application = await this.service.getApplicationDetails(id, organizationId);
      res.status(200).json(application);
    } catch (error) {
      next(error);
    }
  };

  updateAnswers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const organizationId = req.user!.organizationId as string;
      const userId = req.user!.userId;
      const { answers } = req.body;
      await this.service.updateAnswers(id, organizationId, userId, { answers });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  submitApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const organizationId = req.user!.organizationId as string;
      const userId = req.user!.userId;
      const application = await this.service.submitApplication(id, organizationId, userId);
      res.status(200).json(application);
    } catch (error) {
      next(error);
    }
  };

  getProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const organizationId = req.user!.organizationId as string;
      const progress = await this.service.getProgress(id, organizationId);
      res.status(200).json(progress);
    } catch (error) {
      next(error);
    }
  };
}
