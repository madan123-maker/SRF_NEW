import { PrismaClient, Prisma } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { ActionPointRepository } from '../repositories/action-point.repository';
import { ReformAreaRepository } from '../../reform-areas/repositories/reform-area.repository';
import { EditionRepository } from '../../editions/repositories/edition.repository';
import { AuditService } from '../../../shared/services/audit.service';
import { CreateActionPointDTO, UpdateActionPointDTO } from '../validators/action-point.validator';
import { ConflictError, NotFoundError, AuthorizationError } from '../../../shared/errors/AppError';

const prisma = new PrismaClient();

export class ActionPointService extends BaseService {
  private actionPointRepository = new ActionPointRepository();
  private reformAreaRepository = new ReformAreaRepository();
  private editionRepository = new EditionRepository();

  constructor() {
    super(prisma);
  }

  private async validateReformAreaAndEditionState(reformAreaId: string, userOrganizationId: string, allowReadOnly: boolean = false) {
    const reformArea = await this.reformAreaRepository.findById(reformAreaId);
    if (!reformArea) throw new NotFoundError('Reform Area not found');
    
    const edition = await this.editionRepository.findById(reformArea.editionId);
    if (!edition) throw new NotFoundError('Edition not found');

    // Tenant validation
    if (edition.organizationId !== userOrganizationId) {
      throw new AuthorizationError('You do not have access to this Reform Area');
    }

    if (!allowReadOnly) {
      // Edition state validation
      if (edition.isLocked) throw new ConflictError('Cannot modify Action Points in a locked Edition');
      
      const readOnlyStates = ['PUBLISHED', 'CLOSED', 'ARCHIVED'];
      if (readOnlyStates.includes(edition.status)) {
        throw new ConflictError(`Cannot modify Action Points in an Edition with status ${edition.status}`);
      }
    }
    
    return { reformArea, edition };
  }

  async create(data: CreateActionPointDTO, userOrganizationId: string, userId: string) {
    await this.validateReformAreaAndEditionState(data.reformAreaId, userOrganizationId);

    // Duplicate validation
    const [existingName, existingCode, existingSlug] = await Promise.all([
      this.actionPointRepository.existsByName(data.reformAreaId, data.name),
      this.actionPointRepository.existsByCode(data.reformAreaId, data.code),
      this.actionPointRepository.existsBySlug(data.slug)
    ]);

    if (existingName) throw new ConflictError('Action Point with this name already exists in this Reform Area');
    if (existingCode) throw new ConflictError('Action Point with this code already exists in this Reform Area');
    if (existingSlug) throw new ConflictError('Action Point with this slug already exists');

    // Sequential displayOrder
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await this.actionPointRepository.getMaxDisplayOrder(data.reformAreaId);
      displayOrder = maxOrder + 1;
    }

    const payload: Prisma.ActionPointUncheckedCreateInput = {
      reformAreaId: data.reformAreaId,
      name: data.name,
      code: data.code,
      slug: data.slug,
      description: data.description,
      objective: data.objective,
      guidance: data.guidance,
      helpText: data.helpText,
      displayOrder,
      status: data.status ?? 'ACTIVE',
      metadata: data.metadata ?? Prisma.JsonNull,
      createdBy: userId,
      updatedBy: userId
    };

    const actionPoint = await this.actionPointRepository.create(payload);

    await AuditService.log({
      userId,
      action: 'CREATE',
      entityType: 'ACTION_POINT',
      entityId: actionPoint.id,
      diffJson: { newState: actionPoint }
    });

    return actionPoint;
  }

  async update(id: string, data: UpdateActionPointDTO, userOrganizationId: string, userId: string) {
    const actionPoint = await this.actionPointRepository.findById(id);
    if (!actionPoint) throw new NotFoundError('Action Point not found');

    await this.validateReformAreaAndEditionState(actionPoint.reformAreaId, userOrganizationId);

    // Duplicate validation
    if (data.name && data.name !== actionPoint.name) {
      const existingName = await this.actionPointRepository.existsByName(actionPoint.reformAreaId, data.name);
      if (existingName) throw new ConflictError('Action Point with this name already exists in this Reform Area');
    }

    if (data.code && data.code !== actionPoint.code) {
      const existingCode = await this.actionPointRepository.existsByCode(actionPoint.reformAreaId, data.code);
      if (existingCode) throw new ConflictError('Action Point with this code already exists in this Reform Area');
    }
    
    if (data.slug && data.slug !== actionPoint.slug) {
      const existingSlug = await this.actionPointRepository.existsBySlug(data.slug);
      if (existingSlug) throw new ConflictError('Action Point with this slug already exists');
    }

    const payload: Prisma.ActionPointUpdateInput = {
      ...data,
      metadata: data.metadata !== undefined ? data.metadata : undefined,
      updatedBy: userId
    };

    const updated = await this.actionPointRepository.update(id, payload);

    await AuditService.log({
      userId,
      action: 'UPDATE',
      entityType: 'ACTION_POINT',
      entityId: id,
      diffJson: { oldState: actionPoint, newState: updated }
    });

    return updated;
  }

  async softDelete(id: string, userOrganizationId: string, userId: string) {
    const actionPoint = await this.actionPointRepository.findById(id);
    if (!actionPoint) throw new NotFoundError('Action Point not found');

    await this.validateReformAreaAndEditionState(actionPoint.reformAreaId, userOrganizationId);

    const deleted = await this.actionPointRepository.update(id, {
      deletedAt: new Date(),
      deletedBy: userId
    });

    await AuditService.log({
      userId,
      action: 'DELETE',
      entityType: 'ACTION_POINT',
      entityId: id,
      diffJson: { oldState: actionPoint, newState: deleted }
    });

    return deleted;
  }

  async restore(id: string, userOrganizationId: string, userId: string) {
    const actionPoint = await prisma.actionPoint.findUnique({ where: { id } });
    if (!actionPoint) throw new NotFoundError('Action Point not found');
    if (!actionPoint.deletedAt) throw new ConflictError('Action Point is not deleted');

    await this.validateReformAreaAndEditionState(actionPoint.reformAreaId, userOrganizationId);

    const restored = await this.actionPointRepository.update(id, {
      deletedAt: null,
      deletedBy: null,
      updatedBy: userId
    });

    await AuditService.log({
      userId,
      action: 'RESTORE',
      entityType: 'ACTION_POINT',
      entityId: id,
      diffJson: { oldState: actionPoint, newState: restored }
    });

    return restored;
  }

  async getById(id: string, userOrganizationId: string) {
    const actionPoint = await this.actionPointRepository.findById(id);
    if (!actionPoint) throw new NotFoundError('Action Point not found');
    
    // Readonly validation of access
    await this.validateReformAreaAndEditionState(actionPoint.reformAreaId, userOrganizationId, true);
    return actionPoint;
  }

  async findByReformAreaId(reformAreaId: string, userOrganizationId: string, page: number = 1, limit: number = 50, filters: Prisma.ActionPointWhereInput = {}) {
    await this.validateReformAreaAndEditionState(reformAreaId, userOrganizationId, true);
    
    const skip = (page - 1) * limit;
    const [data, total] = await this.actionPointRepository.findByReformAreaId(reformAreaId, skip, limit, filters);
    
    return { data, total };
  }

  async search(userOrganizationId: string, page: number = 1, limit: number = 50, filters: Prisma.ActionPointWhereInput = {}) {
    const skip = (page - 1) * limit;
    // Tenant isolation: Action Point -> Reform Area -> Edition -> organizationId
    const where: Prisma.ActionPointWhereInput = {
      deletedAt: null,
      ...filters,
      reformArea: {
        edition: {
          organizationId: userOrganizationId
        }
      }
    };
    
    const [data, total] = await Promise.all([
      prisma.actionPoint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.actionPoint.count({ where })
    ]);
    
    return { data, total };
  }
}
