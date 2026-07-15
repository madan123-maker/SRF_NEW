import { AppStatus, EditionStatus, PrismaClient } from '@prisma/client';
import { ApplicationRepository } from '../repositories/application.repository';
import { AppError } from '../../../shared/errors/AppError';
import { PaginationDto, UpdateAnswersDto } from '../dto/application.dto';

const prisma = new PrismaClient();

export class ApplicationService {
  private repository: ApplicationRepository;

  constructor() {
    this.repository = new ApplicationRepository();
  }

  async getApplications(organizationId: string, options: PaginationDto) {
    return this.repository.findPaginatedByOrg(organizationId, options);
  }

  async getApplicationDetails(applicationId: string, organizationId: string) {
    const application = await this.repository.findByIdAndOrg(applicationId, organizationId);
    if (!application) {
      throw new AppError('Application not found', 404);
    }
    return application;
  }

  async createDraft(editionId: string, organizationId: string, userId: string) {
    const edition = await prisma.edition.findUnique({ where: { id: editionId } });
    if (!edition) {
      throw new AppError('Edition not found', 404);
    }
    if (edition.status !== EditionStatus.PUBLISHED) {
      throw new AppError('Edition is not open for applications', 400);
    }

    const existing = await this.repository.findByEditionAndOrg(editionId, organizationId);
    if (existing) {
      throw new AppError('Organization already has an application for this edition', 400);
    }

    const application = await this.repository.createDraft(editionId, organizationId, userId);

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_DRAFT',
        entityType: 'Application',
        entityId: application.id,
      }
    });

    return application;
  }

  async updateAnswers(applicationId: string, organizationId: string, userId: string, dto: UpdateAnswersDto) {
    const application = await this.repository.findByIdAndOrg(applicationId, organizationId);
    if (!application) throw new AppError('Application not found', 404);

    if (application.status !== AppStatus.DRAFT) {
      throw new AppError('Only draft applications can be modified', 400);
    }

    if (application.edition.status !== EditionStatus.PUBLISHED) {
      throw new AppError('Cannot modify application, edition is not published', 400);
    }

    const updated = await this.repository.updateAnswers(applicationId, dto);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_ANSWERS',
        entityType: 'Application',
        entityId: applicationId,
        diffJson: JSON.stringify({ fieldsUpdated: dto.answers.map(a => a.formFieldId) })
      }
    });

    return updated;
  }

  async submitApplication(applicationId: string, organizationId: string, userId: string) {
    const application = await this.repository.findByIdAndOrg(applicationId, organizationId);
    if (!application) throw new AppError('Application not found', 404);

    if (application.status !== AppStatus.DRAFT) {
      throw new AppError('Application is already submitted or in review', 400);
    }

    // Additional validation could be checked here (e.g., all required fields answered)
    // For now, assume frontend validation is passed and we accept submission.
    
    const submitted = await this.repository.submitApplication(applicationId);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SUBMIT_APPLICATION',
        entityType: 'Application',
        entityId: applicationId,
      }
    });

    return submitted;
  }

  async getProgress(applicationId: string, organizationId: string) {
    const application = await this.repository.findByIdAndOrg(applicationId, organizationId);
    if (!application) throw new AppError('Application not found', 404);

    // Simplistic progress tracking: we count total required form fields in the edition
    // against the total answers submitted. For phase 5A, we return total answered.
    const totalAnswered = application.answers.length;

    return {
      applicationId,
      status: application.status,
      totalAnswered,
      completionPercentage: null // Can be fully calculated if we pull all Edition schemas
    };
  }
}
