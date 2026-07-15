import { PrismaClient, Prisma } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { FormFieldRepository } from '../repositories/form-field.repository';
import { QuestionRepository } from '../../questions/repositories/question.repository';
import { ActionPointRepository } from '../../action-points/repositories/action-point.repository';
import { ReformAreaRepository } from '../../reform-areas/repositories/reform-area.repository';
import { EditionRepository } from '../../editions/repositories/edition.repository';
import { AuditService } from '../../../shared/services/audit.service';
import { CreateFormFieldDTO, UpdateFormFieldDTO } from '../validators/form-field.validator';
import { ConflictError, NotFoundError, AuthorizationError } from '../../../shared/errors/AppError';

const prisma = new PrismaClient();

export class FormFieldService extends BaseService {
  private formFieldRepository = new FormFieldRepository();
  private questionRepository = new QuestionRepository();
  private actionPointRepository = new ActionPointRepository();
  private reformAreaRepository = new ReformAreaRepository();
  private editionRepository = new EditionRepository();

  constructor() {
    super(prisma);
  }

  private async validateHierarchyAndState(questionId: string, userOrganizationId: string, allowReadOnly: boolean = false) {
    const question = await this.questionRepository.findById(questionId);
    if (!question) throw new NotFoundError('Question not found');

    const actionPoint = await this.actionPointRepository.findById(question.actionPointId);
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
      if (edition.isLocked) throw new ConflictError('Cannot modify Form Fields in a locked Edition');
      
      const readOnlyStates = ['PUBLISHED', 'CLOSED', 'ARCHIVED'];
      if (readOnlyStates.includes(edition.status)) {
        throw new ConflictError(`Cannot modify Form Fields in an Edition with status ${edition.status}`);
      }
    }
    
    return { question, actionPoint, reformArea, edition };
  }

  async create(data: CreateFormFieldDTO, userOrganizationId: string, userId: string) {
    await this.validateHierarchyAndState(data.questionId, userOrganizationId);

    // Duplicate fieldKey validation
    const existingFieldKey = await this.formFieldRepository.existsByFieldKey(data.questionId, data.fieldKey);
    if (existingFieldKey) throw new ConflictError('Form Field with this fieldKey already exists in this Question');

    // Sequential displayOrder
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await this.formFieldRepository.getMaxDisplayOrder(data.questionId);
      displayOrder = maxOrder + 1;
    }

    const payload: Prisma.FormFieldUncheckedCreateInput = {
      ...data,
      displayOrder,
      validationRules: data.validationRules ?? Prisma.JsonNull,
      options: data.options ?? Prisma.JsonNull,
      metadata: data.metadata ?? Prisma.JsonNull,
      createdBy: userId,
      updatedBy: userId
    };

    const formField = await this.formFieldRepository.create(payload);

    await AuditService.log({
      userId,
      action: 'CREATE',
      entityType: 'FORM_FIELD',
      entityId: formField.id,
      diffJson: { newState: formField }
    });

    return formField;
  }

  async update(id: string, data: UpdateFormFieldDTO, userOrganizationId: string, userId: string) {
    const formField = await this.formFieldRepository.findById(id);
    if (!formField) throw new NotFoundError('Form Field not found');

    await this.validateHierarchyAndState(formField.questionId, userOrganizationId);

    // Duplicate validation
    if (data.fieldKey && data.fieldKey !== formField.fieldKey) {
      const existingFieldKey = await this.formFieldRepository.existsByFieldKey(formField.questionId, data.fieldKey);
      if (existingFieldKey) throw new ConflictError('Form Field with this fieldKey already exists in this Question');
    }

    const payload: Prisma.FormFieldUpdateInput = {
      ...data,
      validationRules: data.validationRules !== undefined ? data.validationRules : undefined,
      options: data.options !== undefined ? data.options : undefined,
      metadata: data.metadata !== undefined ? data.metadata : undefined,
      updatedBy: userId
    };

    const updated = await this.formFieldRepository.update(id, payload);

    await AuditService.log({
      userId,
      action: 'UPDATE',
      entityType: 'FORM_FIELD',
      entityId: id,
      diffJson: { oldState: formField, newState: updated }
    });

    return updated;
  }

  async softDelete(id: string, userOrganizationId: string, userId: string) {
    const formField = await this.formFieldRepository.findById(id);
    if (!formField) throw new NotFoundError('Form Field not found');

    await this.validateHierarchyAndState(formField.questionId, userOrganizationId);

    const deleted = await this.formFieldRepository.update(id, {
      deletedAt: new Date(),
      deletedBy: userId
    });

    await AuditService.log({
      userId,
      action: 'DELETE',
      entityType: 'FORM_FIELD',
      entityId: id,
      diffJson: { oldState: formField, newState: deleted }
    });

    return deleted;
  }

  async restore(id: string, userOrganizationId: string, userId: string) {
    const formField = await prisma.formField.findUnique({ where: { id } });
    if (!formField) throw new NotFoundError('Form Field not found');
    if (!formField.deletedAt) throw new ConflictError('Form Field is not deleted');

    await this.validateHierarchyAndState(formField.questionId, userOrganizationId);

    const restored = await this.formFieldRepository.update(id, {
      deletedAt: null,
      deletedBy: null,
      updatedBy: userId
    });

    await AuditService.log({
      userId,
      action: 'RESTORE',
      entityType: 'FORM_FIELD',
      entityId: id,
      diffJson: { oldState: formField, newState: restored }
    });

    return restored;
  }

  async getById(id: string, userOrganizationId: string) {
    const formField = await this.formFieldRepository.findById(id);
    if (!formField) throw new NotFoundError('Form Field not found');
    
    // Readonly validation of access
    await this.validateHierarchyAndState(formField.questionId, userOrganizationId, true);
    return formField;
  }

  async findByQuestionId(questionId: string, userOrganizationId: string, page: number = 1, limit: number = 50, filters: Prisma.FormFieldWhereInput = {}) {
    await this.validateHierarchyAndState(questionId, userOrganizationId, true);
    
    const skip = (page - 1) * limit;
    const [data, total] = await this.formFieldRepository.findByQuestionId(questionId, skip, limit, filters);
    
    return { data, total };
  }

  async search(userOrganizationId: string, page: number = 1, limit: number = 50, filters: Prisma.FormFieldWhereInput = {}) {
    const skip = (page - 1) * limit;
    // Tenant isolation: FormField -> Question -> Action Point -> Reform Area -> Edition -> organizationId
    const where: Prisma.FormFieldWhereInput = {
      deletedAt: null,
      ...filters,
      question: {
        actionPoint: {
          reformArea: {
            edition: {
              organizationId: userOrganizationId
            }
          }
        }
      }
    };
    
    const [data, total] = await Promise.all([
      prisma.formField.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.formField.count({ where })
    ]);
    
    return { data, total };
  }
}
