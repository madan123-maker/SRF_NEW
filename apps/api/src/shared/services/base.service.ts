/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.util';

export abstract class BaseService {
  constructor(protected readonly prisma: PrismaClient) {}

  protected async executeInTransaction<T>(
    operation: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        return await operation(tx);
      });
    } catch (error: any) {
      this.logError('Transaction failed', error);
      throw error; // Let the global error handler catch it or rethrow as AppError in subclasses
    }
  }

  protected logInfo(message: string, meta?: any) {
    logger.info(`[${this.constructor.name}] ${message}`, meta);
  }

  protected logError(message: string, error: any, meta?: any) {
    logger.error(`[${this.constructor.name}] ${message}`, { ...meta, error: error.message, stack: error.stack });
  }

  protected logWarn(message: string, meta?: any) {
    logger.warn(`[${this.constructor.name}] ${message}`, meta);
  }
}
