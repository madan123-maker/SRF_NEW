/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T, CreateDTO, UpdateDTO> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly model: any // Represents the prisma delegate e.g., prisma.user
  ) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findOne(filter: any): Promise<T | null> {
    return this.model.findFirst({ where: filter });
  }

  async findMany(filter: any = {}, skip?: number, take?: number): Promise<T[]> {
    return this.model.findMany({
      where: filter,
      skip,
      take,
    });
  }

  async create(data: CreateDTO): Promise<T> {
    return this.model.create({ data });
  }

  async createMany(data: CreateDTO[]): Promise<number> {
    const result = await this.model.createMany({ data });
    return result.count;
  }

  async update(id: string, data: UpdateDTO): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async updateMany(filter: any, data: UpdateDTO): Promise<number> {
    const result = await this.model.updateMany({
      where: filter,
      data,
    });
    return result.count;
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  async deleteMany(filter: any): Promise<number> {
    const result = await this.model.deleteMany({ where: filter });
    return result.count;
  }

  async count(filter: any = {}): Promise<number> {
    return this.model.count({ where: filter });
  }

  async exists(filter: any): Promise<boolean> {
    const count = await this.count(filter);
    return count > 0;
  }

  // Soft delete capabilities (requires a deletedAt field on the model)
  async softDelete(id: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
