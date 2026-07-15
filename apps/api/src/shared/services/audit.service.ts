/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogOptions {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  diffJson?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static async log(options: AuditLogOptions) {
    try {
      const data: any = {
        userId: options.userId || null,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
      };

      if (options.diffJson) {
        data.diffJson = JSON.stringify(options.diffJson);
      }

      await prisma.auditLog.create({ data });
    } catch (error) {
      // We don't want audit log failures to crash business logic, but we should log them.
      console.error('Failed to write audit log:', error);
    }
  }
}
