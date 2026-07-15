import { PrismaClient, Prisma } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { ReformAreaRepository } from '../repositories/reform-area.repository';
import { EditionRepository } from '../../editions/repositories/edition.repository';
import { AuditService } from '../../../shared/services/audit.service';
import { CreateReformAreaDTO, UpdateReformAreaDTO } from '../validators/reform-area.validator';
import { ConflictError, NotFoundError, AuthorizationError } from '../../../shared/errors/AppError';

const prisma = new PrismaClient();

export class ReformAreaService extends BaseService {
  private reformAreaRepository = new ReformAreaRepository();
  private editionRepository = new EditionRepository();

  constructor() {
    super(prisma);
  }

  private async validateEditionAccessAndState(editionId: string, organizationId: string, allowReadOnly: boolean = false) {
    const edition = await this.editionRepository.findById(editionId);
    if (!edition) throw new NotFoundError('Edition not found');
    
    // Tenant validation
    if (edition.organizationId !== organizationId) {
      throw new AuthorizationError('You do not have access to this Edition');
    }

    if (!allowReadOnly) {
      // Edition lock validation
      if (edition.isLocked) throw new ConflictError('Cannot modify Reform Areas in a locked Edition');
      
      const readOnlyStates = ['PUBLISHED', 'CLOSED', 'ARCHIVED'];
      if (readOnlyStates.includes(edition.status)) {
        throw new ConflictError(`Cannot modify Reform Areas in an Edition with status ${edition.status}`);
      }
    }
    
    return edition;
  }

  async create(data: CreateReformAreaDTO, userOrganizationId: string, userId: string) {
    await this.validateEditionAccessAndState(data.editionId, userOrganizationId);

    // Duplicate validation
    const [existingName, existingCode] = await Promise.all([
      this.reformAreaRepository.findByName(data.editionId, data.name),
      this.reformAreaRepository.findByCode(data.editionId, data.code)
    ]);

    if (existingName) throw new ConflictError('Reform Area with this name already exists in this edition');
    if (existingCode) throw new ConflictError('Reform Area with this code already exists in this edition');

    // Sequential displayOrder
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await this.reformAreaRepository.getMaxDisplayOrder(data.editionId);
      displayOrder = maxOrder + 1;
    }

    const payload: Prisma.ReformAreaUncheckedCreateInput = {
      editionId: data.editionId,
      name: data.name,
      code: data.code,
      description: data.description,
      color: data.color,
      icon: data.icon,
      displayOrder,
      maxScore: data.maxScore ?? 0,
      status: data.status ?? 'ACTIVE',
      metadata: data.metadata ?? Prisma.JsonNull,
      createdBy: userId,
      updatedBy: userId
    };

    const reformArea = await this.reformAreaRepository.create(payload);

    await AuditService.log({
      userId,
      action: 'CREATE',
      entityType: 'REFORM_AREA',
      entityId: reformArea.id,
      diffJson: JSON.stringify({ newState: reformArea })
    });

    return reformArea;
  }

  async update(id: string, data: UpdateReformAreaDTO, userOrganizationId: string, userId: string) {
    const reformArea = await this.reformAreaRepository.findById(id);
    if (!reformArea) throw new NotFoundError('Reform Area not found');

    await this.validateEditionAccessAndState(reformArea.editionId, userOrganizationId);

    // Duplicate validation
    if (data.name && data.name !== reformArea.name) {
      const existingName = await this.reformAreaRepository.findByName(reformArea.editionId, data.name);
      if (existingName) throw new ConflictError('Reform Area with this name already exists in this edition');
    }

    if (data.code && data.code !== reformArea.code) {
      const existingCode = await this.reformAreaRepository.findByCode(reformArea.editionId, data.code);
      if (existingCode) throw new ConflictError('Reform Area with this code already exists in this edition');
    }

    const payload: Prisma.ReformAreaUpdateInput = {
      ...data,
      metadata: data.metadata !== undefined ? data.metadata : undefined,
      updatedBy: userId
    };

    const updated = await this.reformAreaRepository.update(id, payload);

    await AuditService.log({
      userId,
      action: 'UPDATE',
      entityType: 'REFORM_AREA',
      entityId: id,
      diffJson: JSON.stringify({ oldState: reformArea, newState: updated })
    });

    return updated;
  }

  async softDelete(id: string, userOrganizationId: string, userId: string) {
    const reformArea = await this.reformAreaRepository.findById(id);
    if (!reformArea) throw new NotFoundError('Reform Area not found');

    await this.validateEditionAccessAndState(reformArea.editionId, userOrganizationId);

    const deleted = await this.reformAreaRepository.update(id, {
      deletedAt: new Date(),
      deletedBy: userId
    });

    await AuditService.log({
      userId,
      action: 'DELETE',
      entityType: 'REFORM_AREA',
      entityId: id,
      diffJson: JSON.stringify({ oldState: reformArea, newState: deleted })
    });

    return deleted;
  }

  async restore(id: string, userOrganizationId: string, userId: string) {
    const reformArea = await prisma.reformArea.findUnique({ where: { id } });
    if (!reformArea) throw new NotFoundError('Reform Area not found');
    if (!reformArea.deletedAt) throw new ConflictError('Reform Area is not deleted');

    await this.validateEditionAccessAndState(reformArea.editionId, userOrganizationId);

    const restored = await this.reformAreaRepository.update(id, {
      deletedAt: null,
      deletedBy: null,
      updatedBy: userId
    });

    await AuditService.log({
      userId,
      action: 'RESTORE',
      entityType: 'REFORM_AREA',
      entityId: id,
      diffJson: JSON.stringify({ oldState: reformArea, newState: restored })
    });

    return restored;
  }

  async getById(id: string, userOrganizationId: string) {
    const reformArea = await this.reformAreaRepository.findById(id);
    if (!reformArea) throw new NotFoundError('Reform Area not found');
    
    // Readonly validation of access
    await this.validateEditionAccessAndState(reformArea.editionId, userOrganizationId, true);
    return reformArea;
  }

  async findByEditionId(editionId: string, userOrganizationId: string, page: number = 1, limit: number = 50, filters: Prisma.ReformAreaWhereInput = {}) {
    await this.validateEditionAccessAndState(editionId, userOrganizationId, true);
    
    const skip = (page - 1) * limit;
    const [data, total] = await this.reformAreaRepository.findByEditionId(editionId, skip, limit, filters);
    
    return { data, total };
  }

  async search(userOrganizationId: string, page: number = 1, limit: number = 50, filters: Prisma.ReformAreaWhereInput = {}) {
    const skip = (page - 1) * limit;
    // We must enforce tenant isolation by only finding reform areas whose edition belongs to the user's organization.
    const where: Prisma.ReformAreaWhereInput = {
      deletedAt: null,
      ...filters,
      edition: {
        organizationId: userOrganizationId
      }
    };
    
    const [data, total] = await Promise.all([
      prisma.reformArea.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.reformArea.count({ where })
    ]);
    
    return { data, total };
  }
}
