import prisma, { AuditAction } from '../database/prismaClient.js';

interface AuditLogInput {
    userId: string;
    entity: string;
    entityId: string;
    action: AuditAction;
    details: unknown;
}

export async function createAuditLog({ userId, entity, entityId, action, details }: AuditLogInput) {
    await prisma.auditLog.create({
        data: {
            userId,
            entity,
            entityId,
            action,
            changeDetails: JSON.stringify(details),
        },
    });
}