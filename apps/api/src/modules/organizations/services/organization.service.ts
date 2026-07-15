import { PrismaClient } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateOrganizationDTO, UpdateOrganizationDTO } from '../validators/organization.validator';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';

const prisma = new PrismaClient();

export class OrganizationService extends BaseService {
  private organizationRepository = new OrganizationRepository();

  constructor() {
    super(prisma);
  }

  async create(data: CreateOrganizationDTO) {
    const existing = await this.organizationRepository.findByCode(data.code);
    if (existing) {
      throw new ConflictError('Organization with this code already exists');
    }
    
    // In future, audit logging integration goes here
    return this.organizationRepository.create(data);
  }

  async update(id: string, data: UpdateOrganizationDTO) {
    const org = await this.organizationRepository.findById(id);
    if (!org) throw new NotFoundError('Organization not found');

    if (data.code && data.code !== org.code) {
      const existing = await this.organizationRepository.findByCode(data.code);
      if (existing) throw new ConflictError('Organization code already in use');
    }

    return this.organizationRepository.update(id, data);
  }

  async getById(id: string) {
    const org = await this.organizationRepository.findById(id);
    if (!org || org.deletedAt) throw new NotFoundError('Organization not found');
    return org;
  }

  async search(query: string = '', page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return this.organizationRepository.search(query, skip, limit);
  }

  async softDelete(id: string) {
    const org = await this.organizationRepository.findById(id);
    if (!org) throw new NotFoundError('Organization not found');
    return this.organizationRepository.softDelete(id);
  }

  async restore(id: string) {
    const org = await this.organizationRepository.findOne({ id });
    if (!org) throw new NotFoundError('Organization not found');
    return this.organizationRepository.restore(id);
  }
}
