import { PrismaClient } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { PermissionRepository } from '../repositories/permission.repository';
import { CreatePermissionDTO, UpdatePermissionDTO } from '../validators/permission.validator';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';

const prisma = new PrismaClient();

export class PermissionService extends BaseService {
  private permissionRepository = new PermissionRepository();

  constructor() {
    super(prisma);
  }

  async create(data: CreatePermissionDTO) {
    const existing = await this.permissionRepository.findByAction(data.action);
    if (existing) {
      throw new ConflictError('Permission with this action already exists');
    }
    return this.permissionRepository.create(data);
  }

  async update(id: string, data: UpdatePermissionDTO) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) throw new NotFoundError('Permission not found');

    if (data.action && data.action !== permission.action) {
      const existing = await this.permissionRepository.findByAction(data.action);
      if (existing) throw new ConflictError('Permission action already in use');
    }

    return this.permissionRepository.update(id, data);
  }

  async getById(id: string) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) throw new NotFoundError('Permission not found');
    return permission;
  }

  async search(query: string = '', page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return this.permissionRepository.search(query, skip, limit);
  }

  async delete(id: string) {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) throw new NotFoundError('Permission not found');
    return this.permissionRepository.delete(id);
  }
}
