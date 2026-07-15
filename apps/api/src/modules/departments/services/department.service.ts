import { PrismaClient } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { DepartmentRepository } from '../repositories/department.repository';
import { CreateDepartmentDTO, UpdateDepartmentDTO } from '../validators/department.validator';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';

const prisma = new PrismaClient();

export class DepartmentService extends BaseService {
  private departmentRepository = new DepartmentRepository();

  constructor() {
    super(prisma);
  }

  async create(data: CreateDepartmentDTO) {
    // Check if code exists globally or per org? Usually code is global or org-scoped.
    // Let's assume code is global for departments in this system, or we can check org+name.
    const existing = await this.departmentRepository.findOne({ 
      organizationId: data.organizationId,
      name: data.name
    });
    if (existing) {
      throw new ConflictError('Department with this name already exists in the organization');
    }

    return this.departmentRepository.create(data);
  }

  async update(id: string, data: UpdateDepartmentDTO) {
    const dept = await this.departmentRepository.findById(id);
    if (!dept) throw new NotFoundError('Department not found');

    if (data.name && data.name !== dept.name) {
      const existing = await this.departmentRepository.findOne({
        organizationId: dept.organizationId,
        name: data.name
      });
      if (existing) throw new ConflictError('Department with this name already exists in the organization');
    }

    return this.departmentRepository.update(id, data);
  }

  async getById(id: string) {
    const dept = await this.departmentRepository.findById(id);
    if (!dept || dept.deletedAt) throw new NotFoundError('Department not found');
    return dept;
  }

  async search(organizationId: string, query: string = '', page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return this.departmentRepository.search(organizationId, query, skip, limit);
  }

  async softDelete(id: string) {
    const dept = await this.departmentRepository.findById(id);
    if (!dept) throw new NotFoundError('Department not found');
    return this.departmentRepository.softDelete(id);
  }

  async restore(id: string) {
    const dept = await this.departmentRepository.findOne({ id });
    if (!dept) throw new NotFoundError('Department not found');
    return this.departmentRepository.restore(id);
  }
}
