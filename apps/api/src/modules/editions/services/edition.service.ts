import { PrismaClient, EditionStatus, Prisma } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { EditionRepository } from '../repositories/edition.repository';
import { CreateEditionDTO, UpdateEditionDTO } from '../validators/edition.validator';
import { ConflictError, NotFoundError, AuthorizationError } from '../../../shared/errors/AppError';
import { AuditService } from '../../../shared/services/audit.service';

const prisma = new PrismaClient();

export class EditionService extends BaseService {
  private editionRepository = new EditionRepository();

  constructor() {
    super(prisma);
  }

  async create(data: CreateEditionDTO, userId: string, userOrganizationId: string) {
    if (data.organizationId !== userOrganizationId) {
      throw new AuthorizationError('Cannot create edition for another organization');
    }

    const existing = await this.editionRepository.findOne({
      organizationId: data.organizationId,
      name: data.name
    });

    if (existing) {
      throw new ConflictError('Edition with this name already exists in the organization');
    }

    const inputData = { ...data, createdBy: userId, updatedBy: userId, metadata: data.metadata ?? Prisma.DbNull } as Prisma.EditionUncheckedCreateInput;

    const edition = await this.editionRepository.create(inputData);

    await AuditService.log({
      userId,
      action: 'CREATE',
      entityType: 'Edition',
      entityId: edition.id,
      diffJson: { newState: edition }
    });

    return edition;
  }

  async update(id: string, data: UpdateEditionDTO, userId: string, userOrganizationId: string) {
    const edition = await this.editionRepository.findById(id);
    if (!edition) throw new NotFoundError('Edition not found');
    if (edition.organizationId !== userOrganizationId) throw new AuthorizationError('Access denied');
    
    // Immutability checks
    if (edition.isLocked || ['PUBLISHED', 'CLOSED', 'ARCHIVED'].includes(edition.status)) {
      throw new ConflictError('Edition is immutable and cannot be updated. Please clone or version it.');
    }

    if (data.name && data.name !== edition.name) {
      const existing = await this.editionRepository.findOne({
        organizationId: edition.organizationId,
        name: data.name
      });
      if (existing) throw new ConflictError('Edition with this name already exists in the organization');
    }

    const updateData = { ...data, updatedBy: userId, metadata: data.metadata ?? Prisma.DbNull } as Prisma.EditionUpdateInput;

    const updatedEdition = await this.editionRepository.update(id, updateData);

    await AuditService.log({
      userId,
      action: 'UPDATE',
      entityType: 'Edition',
      entityId: updatedEdition.id,
      diffJson: { oldState: edition, newState: updatedEdition }
    });

    return updatedEdition;
  }

  async getById(id: string, userOrganizationId: string) {
    const edition = await this.editionRepository.findById(id);
    if (!edition || edition.deletedAt) throw new NotFoundError('Edition not found');
    if (edition.organizationId !== userOrganizationId) throw new AuthorizationError('Access denied');
    return edition;
  }

  async search(userOrganizationId: string, query: string = '', page: number = 1, limit: number = 10, status?: EditionStatus) {
    const skip = (page - 1) * limit;
    return this.editionRepository.search(userOrganizationId, query, skip, limit, status);
  }

  async changeStatus(id: string, newStatus: EditionStatus, userId: string, userOrganizationId: string) {
    const edition = await this.editionRepository.findById(id);
    if (!edition) throw new NotFoundError('Edition not found');
    if (edition.organizationId !== userOrganizationId) throw new AuthorizationError('Access denied');
    
    // Strict state machine validation
    const validTransitions: Record<EditionStatus, EditionStatus[]> = {
      DRAFT: ['REVIEW', 'CANCELLED'],
      REVIEW: ['PUBLISHED', 'DRAFT', 'CANCELLED'],
      PUBLISHED: ['CLOSED', 'CANCELLED'],
      CLOSED: ['ARCHIVED'],
      ARCHIVED: ['RESTORED'],
      RESTORED: ['DRAFT', 'REVIEW'],
      CANCELLED: []
    };

    if (!validTransitions[edition.status].includes(newStatus)) {
      throw new ConflictError(`Invalid status transition from ${edition.status} to ${newStatus}`);
    }

    const data: Prisma.EditionUpdateInput = { status: newStatus, updatedBy: userId };
    if (newStatus === 'PUBLISHED') {
      data.publishedBy = userId;
    }

    // Auto-lock on immutable states
    if (['PUBLISHED', 'CLOSED', 'ARCHIVED'].includes(newStatus)) {
      data.isLocked = true;
    } else if (newStatus === 'RESTORED' || newStatus === 'DRAFT') {
      data.isLocked = false;
    }

    const updatedEdition = await this.editionRepository.update(id, data);

    await AuditService.log({
      userId,
      action: `STATUS_${newStatus}`,
      entityType: 'Edition',
      entityId: updatedEdition.id,
      diffJson: { oldStatus: edition.status, newStatus }
    });

    return updatedEdition;
  }

  async clone(id: string, userId: string, userOrganizationId: string, bumpType: 'MAJOR' | 'MINOR' | 'DUPLICATE' = 'DUPLICATE') {
    const edition = await this.editionRepository.findById(id);
    if (!edition) throw new NotFoundError('Edition not found');
    if (edition.organizationId !== userOrganizationId) throw new AuthorizationError('Access denied');

    let newName = `${edition.name} (Clone)`;
    let major = edition.majorVersion;
    let minor = edition.minorVersion;

    if (bumpType === 'MAJOR') {
      major += 1;
      minor = 0;
      newName = `${edition.name} v${major}.${minor}`;
    } else if (bumpType === 'MINOR') {
      minor += 1;
      newName = `${edition.name} v${major}.${minor}`;
    }

    // Ensure name uniqueness
    const existing = await this.editionRepository.findOne({ organizationId: edition.organizationId, name: newName });
    if (existing) {
      newName = `${newName} - ${Date.now()}`;
    }

    const cloneData = {
      organizationId: edition.organizationId,
      departmentId: edition.departmentId,
      name: newName,
      description: edition.description,
      financialYear: edition.financialYear,
      majorVersion: major,
      minorVersion: minor,
      status: 'DRAFT' as EditionStatus,
      visibility: edition.visibility,
      clonedFromId: edition.id,
      createdBy: userId,
      updatedBy: userId,
      metadata: edition.metadata ? JSON.parse(JSON.stringify(edition.metadata)) : Prisma.DbNull
    };

    const newEdition = await this.editionRepository.create(cloneData);

    await AuditService.log({
      userId,
      action: 'CLONE',
      entityType: 'Edition',
      entityId: newEdition.id,
      diffJson: { clonedFromId: edition.id, bumpType }
    });

    return newEdition;
  }

  async toggleLock(id: string, lockStatus: boolean, userId: string, userOrganizationId: string) {
    const edition = await this.editionRepository.findById(id);
    if (!edition) throw new NotFoundError('Edition not found');
    if (edition.organizationId !== userOrganizationId) throw new AuthorizationError('Access denied');

    if (['PUBLISHED', 'CLOSED', 'ARCHIVED'].includes(edition.status) && !lockStatus) {
      throw new ConflictError('Cannot unlock an edition in an immutable state');
    }

    const updatedEdition = await this.editionRepository.update(id, { isLocked: lockStatus, updatedBy: userId });

    await AuditService.log({
      userId,
      action: lockStatus ? 'LOCK' : 'UNLOCK',
      entityType: 'Edition',
      entityId: updatedEdition.id,
    });

    return updatedEdition;
  }

  async softDelete(id: string, userId: string, userOrganizationId: string) {
    const edition = await this.editionRepository.findById(id);
    if (!edition) throw new NotFoundError('Edition not found');
    if (edition.organizationId !== userOrganizationId) throw new AuthorizationError('Access denied');
    if (edition.isLocked || ['PUBLISHED', 'CLOSED', 'ARCHIVED'].includes(edition.status)) {
      throw new ConflictError('Cannot delete an immutable edition');
    }

    const deleted = await this.editionRepository.softDelete(id);

    await AuditService.log({
      userId,
      action: 'DELETE',
      entityType: 'Edition',
      entityId: id,
    });

    return deleted;
  }

  async restore(id: string, userId: string, userOrganizationId: string) {
    const edition = await this.editionRepository.findOne({ id });
    if (!edition) throw new NotFoundError('Edition not found');
    if (edition.organizationId !== userOrganizationId) throw new AuthorizationError('Access denied');
    
    const restored = await this.editionRepository.restore(id);

    await AuditService.log({
      userId,
      action: 'RESTORE',
      entityType: 'Edition',
      entityId: id,
    });

    return restored;
  }
}
