import { PrismaClient, Prisma } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { QuestionRepository } from '../repositories/question.repository';
import { ActionPointRepository } from '../../action-points/repositories/action-point.repository';
import { ReformAreaRepository } from '../../reform-areas/repositories/reform-area.repository';
import { EditionRepository } from '../../editions/repositories/edition.repository';
import { AuditService } from '../../../shared/services/audit.service';
import { CreateQuestionDTO, UpdateQuestionDTO } from '../validators/question.validator';
import { ConflictError, NotFoundError, AuthorizationError } from '../../../shared/errors/AppError';

const prisma = new PrismaClient();

export class QuestionService extends BaseService {
  private questionRepository = new QuestionRepository();
  private actionPointRepository = new ActionPointRepository();
  private reformAreaRepository = new ReformAreaRepository();
  private editionRepository = new EditionRepository();

  constructor() {
    super(prisma);
  }

  private async validateHierarchyAndState(actionPointId: string, userOrganizationId: string, allowReadOnly: boolean = false) {
    const actionPoint = await this.actionPointRepository.findById(actionPointId);
    if (!actionPoint) throw new NotFoundError('Action Point not found');

    const reformArea = await this.reformAreaRepository.findById(actionPoint.reformAreaId);
    if (!reformArea) throw new NotFoundError('Reform Area not found');
    
    const edition = await this.editionRepository.findById(reformArea.editionId);
    if (!edition) throw new NotFoundError('Edition not found');

    // Tenant validation
    if (edition.organizationId !== userOrganizationId) {
      throw new AuthorizationError('You do not have access to this hierarchy');
    }

    if (!allowReadOnly) {
      // Edition state validation
      if (edition.isLocked) throw new ConflictError('Cannot modify Questions in a locked Edition');
      
      const readOnlyStates = ['PUBLISHED', 'CLOSED', 'ARCHIVED'];
      if (readOnlyStates.includes(edition.status)) {
        throw new ConflictError(`Cannot modify Questions in an Edition with status ${edition.status}`);
      }
    }
    
    return { actionPoint, reformArea, edition };
  }

  async create(data: CreateQuestionDTO, userOrganizationId: string, userId: string) {
    await this.validateHierarchyAndState(data.actionPointId, userOrganizationId);

    // Duplicate validation
    const [existingName, existingCode, existingSlug] = await Promise.all([
      this.questionRepository.existsByName(data.actionPointId, data.name),
      this.questionRepository.existsByCode(data.actionPointId, data.code),
      this.questionRepository.existsBySlug(data.slug)
    ]);

    if (existingName) throw new ConflictError('Question with this name already exists in this Action Point');
    if (existingCode) throw new ConflictError('Question with this code already exists in this Action Point');
    if (existingSlug) throw new ConflictError('Question with this slug already exists');

    // Sequential displayOrder
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await this.questionRepository.getMaxDisplayOrder(data.actionPointId);
      displayOrder = maxOrder + 1;
    }

    const payload: Prisma.QuestionUncheckedCreateInput = {
      actionPointId: data.actionPointId,
      name: data.name,
      code: data.code,
      slug: data.slug,
      description: data.description,
      helpText: data.helpText,
      instruction: data.instruction,
      displayOrder,
      isRequired: data.isRequired ?? true,
      isRepeatable: data.isRepeatable ?? false,
      status: data.status ?? 'ACTIVE',
      metadata: data.metadata ?? Prisma.JsonNull,
      createdBy: userId,
      updatedBy: userId
    };

    const question = await this.questionRepository.create(payload);

    await AuditService.log({
      userId,
      action: 'CREATE',
      entityType: 'QUESTION',
      entityId: question.id,
      diffJson: { newState: question }
    });

    return question;
  }

  async update(id: string, data: UpdateQuestionDTO, userOrganizationId: string, userId: string) {
    const question = await this.questionRepository.findById(id);
    if (!question) throw new NotFoundError('Question not found');

    await this.validateHierarchyAndState(question.actionPointId, userOrganizationId);

    // Duplicate validation
    if (data.name && data.name !== question.name) {
      const existingName = await this.questionRepository.existsByName(question.actionPointId, data.name);
      if (existingName) throw new ConflictError('Question with this name already exists in this Action Point');
    }

    if (data.code && data.code !== question.code) {
      const existingCode = await this.questionRepository.existsByCode(question.actionPointId, data.code);
      if (existingCode) throw new ConflictError('Question with this code already exists in this Action Point');
    }
    
    if (data.slug && data.slug !== question.slug) {
      const existingSlug = await this.questionRepository.existsBySlug(data.slug);
      if (existingSlug) throw new ConflictError('Question with this slug already exists');
    }

    const payload: Prisma.QuestionUpdateInput = {
      ...data,
      metadata: data.metadata !== undefined ? data.metadata : undefined,
      updatedBy: userId
    };

    const updated = await this.questionRepository.update(id, payload);

    await AuditService.log({
      userId,
      action: 'UPDATE',
      entityType: 'QUESTION',
      entityId: id,
      diffJson: { oldState: question, newState: updated }
    });

    return updated;
  }

  async softDelete(id: string, userOrganizationId: string, userId: string) {
    const question = await this.questionRepository.findById(id);
    if (!question) throw new NotFoundError('Question not found');

    await this.validateHierarchyAndState(question.actionPointId, userOrganizationId);

    const deleted = await this.questionRepository.update(id, {
      deletedAt: new Date(),
      deletedBy: userId
    });

    await AuditService.log({
      userId,
      action: 'DELETE',
      entityType: 'QUESTION',
      entityId: id,
      diffJson: { oldState: question, newState: deleted }
    });

    return deleted;
  }

  async restore(id: string, userOrganizationId: string, userId: string) {
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) throw new NotFoundError('Question not found');
    if (!question.deletedAt) throw new ConflictError('Question is not deleted');

    await this.validateHierarchyAndState(question.actionPointId, userOrganizationId);

    const restored = await this.questionRepository.update(id, {
      deletedAt: null,
      deletedBy: null,
      updatedBy: userId
    });

    await AuditService.log({
      userId,
      action: 'RESTORE',
      entityType: 'QUESTION',
      entityId: id,
      diffJson: { oldState: question, newState: restored }
    });

    return restored;
  }

  async getById(id: string, userOrganizationId: string) {
    const question = await this.questionRepository.findById(id);
    if (!question) throw new NotFoundError('Question not found');
    
    // Readonly validation of access
    await this.validateHierarchyAndState(question.actionPointId, userOrganizationId, true);
    return question;
  }

  async findByActionPointId(actionPointId: string, userOrganizationId: string, page: number = 1, limit: number = 50, filters: Prisma.QuestionWhereInput = {}) {
    await this.validateHierarchyAndState(actionPointId, userOrganizationId, true);
    
    const skip = (page - 1) * limit;
    const [data, total] = await this.questionRepository.findByActionPointId(actionPointId, skip, limit, filters);
    
    return { data, total };
  }

  async search(userOrganizationId: string, page: number = 1, limit: number = 50, filters: Prisma.QuestionWhereInput = {}) {
    const skip = (page - 1) * limit;
    // Tenant isolation: Question -> Action Point -> Reform Area -> Edition -> organizationId
    const where: Prisma.QuestionWhereInput = {
      deletedAt: null,
      ...filters,
      actionPoint: {
        reformArea: {
          edition: {
            organizationId: userOrganizationId
          }
        }
      }
    };
    
    const [data, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.question.count({ where })
    ]);
    
    return { data, total };
  }
}
