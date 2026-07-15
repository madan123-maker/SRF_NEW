import { PrismaClient } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleDTO, UpdateRoleDTO } from '../validators/role.validator';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';

const prisma = new PrismaClient();

export class RoleService extends BaseService {
  private roleRepository = new RoleRepository();

  constructor() {
    super(prisma);
  }

  async create(data: CreateRoleDTO) {
    const existing = await this.roleRepository.findByName(data.name);
    if (existing) {
      throw new ConflictError('Role with this name already exists');
    }

    return this.executeInTransaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name: data.name,
          description: data.description,
          permissions: {
            create: data.permissionIds.map(id => ({ permissionId: id }))
          }
        },
        include: { permissions: true }
      });
      return role;
    });
  }

  async update(id: string, data: UpdateRoleDTO) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundError('Role not found');

    if (data.name && data.name !== role.name) {
      const existing = await this.roleRepository.findByName(data.name);
      if (existing) throw new ConflictError('Role name already in use');
    }

    return this.executeInTransaction(async (tx) => {
      if (data.permissionIds) {
        // Clear existing permissions
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
      }

      return await tx.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          ...(data.permissionIds && {
            permissions: {
              create: data.permissionIds.map(pid => ({ permissionId: pid }))
            }
          })
        },
        include: { permissions: true }
      });
    });
  }

  async getById(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundError('Role not found');
    return role;
  }

  async search(query: string = '', page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return this.roleRepository.search(query, skip, limit);
  }

  async delete(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundError('Role not found');
    // Hard delete since we don't have soft delete on Role in schema
    return this.roleRepository.delete(id);
  }
}
