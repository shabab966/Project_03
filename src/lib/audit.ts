import { db } from './db';

export interface AuditLogParams {
  organizationId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any> | string;
  ipAddress?: string | null;
}

export async function logAuditEvent(params: AuditLogParams) {
  try {
    const detailsJson = typeof params.details === 'object' ? JSON.stringify(params.details) : params.details || null;
    return await db.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        detailsJson,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
