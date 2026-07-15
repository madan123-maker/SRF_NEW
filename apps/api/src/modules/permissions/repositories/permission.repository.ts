import { PrismaClient, Permission, Prisma } from '@prisma/client';
import { BaseRepository } from '../../../shared/repositories/base.repository';

const prisma = new PrismaClient();

export class PermissionRepository extends BaseRepository<Permission, Prisma.PermissionUncheckedCreateInput, Prisma.PermissionUpdateInput> {
  constructor() {
    super(prisma, prisma.permission);
  }

  async findByAction(action: string): Promise<Permission | null> {
    return this.findOne({ action });
  }

  async search(query: string, skip: number, take: number) {
    const where: Prisma.PermissionWhereInput = {
      OR: [
        { action: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [data, total] = await Promise.all([
      this.model.findMany({ 
        where, 
        skip, 
        take, 
        orderBy: { action: 'asc' } 
      }),
      this.model.count({ where }),
    ]);

    return { data, total };
  }
}
