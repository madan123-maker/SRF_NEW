/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, Prisma } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { UserRepository } from '../../authentication/repositories/user.repository';
import { CreateUserDTO, UpdateUserDTO } from '../validators/user.validator';
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class UserService extends BaseService {
  private userRepository = new UserRepository();

  constructor() {
    super(prisma);
  }

  async create(data: CreateUserDTO) {
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) throw new ConflictError('Email already in use');

    const existingUsername = await this.userRepository.findOne({ username: data.username });
    if (existingUsername) throw new ConflictError('Username already in use');

    const passwordHash = await bcrypt.hash(data.password, 12);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = data;

    return this.userRepository.create({
      ...rest,
      passwordHash,
    });
  }

  async update(id: string, data: UpdateUserDTO) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');

    const updateData: any = { ...data };
    if (updateData.preferences === null) {
        updateData.preferences = Prisma.DbNull;
    }

    return this.userRepository.update(id, updateData);
  }

  async getById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user || user.deletedAt) throw new NotFoundError('User not found');
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async search(query: string = '', page: number = 1, limit: number = 10, filters: any = {}) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...filters,
      OR: query ? [
        { email: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
      ] : undefined,
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, username: true, firstName: true, lastName: true, active: true,
          userRoles: { include: { role: true } }, organizationId: true, departmentId: true, createdAt: true
        }
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async softDelete(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return this.userRepository.softDelete(id);
  }

  async restore(id: string) {
    const user = await this.userRepository.findOne({ id });
    if (!user) throw new NotFoundError('User not found');
    return this.userRepository.restore(id);
  }
}
