import prisma, { AuditAction } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { createAuditLog } from "../utils/audit.js";
import type { AssignUsersInput } from "../validators/userRoute.validator.js";

/**
 * Asignar usuarios a una ruta (soporta userIds de solo string o de objeto {userId,roleInRoute})
 */
export const assignUsersToRouteService = async (
  routeId: string,
  data: AssignUsersInput,
  assignedBy: string
) => {
  const now = new Date();
  const result: any[] = [];

  for (const input of data.userIds) {
    // Si tu validador SOLO acepta strings, puedes dejar esto como "const userId = input";
    const userId = typeof input === "string" ? input : input.userId;
    const roleInRoute = typeof input === "object" ? input.roleInRoute : undefined;

    const exist = await prisma.userRoute.findUnique({
      where: { userId_routeId: { userId, routeId } },
    });

    if (exist && exist.isActive && (roleInRoute === undefined || exist.roleInRoute === roleInRoute)) continue;

    if (exist) {
      const updated = await prisma.userRoute.update({
        where: { userId_routeId: { userId, routeId } },
        data: {
          isActive: true,
          assignedAt: now,
          unassignedAt: null,
          assignedBy,
          ...(roleInRoute != null && { roleInRoute }),
        },
      });
      result.push(updated);

      await createAuditLog({
        userId: assignedBy,
        entity: "UserRoute",
        entityId: `${userId}-${routeId}`,
        action: AuditAction.UPDATE,
        details: {
          action: "Re-assigned user to route",
          userId,
          routeId,
          assignedAt: now,
          ...(roleInRoute != null && { roleInRoute }),
        },
      });
    } else {
      const created = await prisma.userRoute.create({
        data: {
          userId,
          routeId,
          assignedBy,
          isActive: true,
          assignedAt: now,
          ...(roleInRoute != null && { roleInRoute }),
        },
      });
      result.push(created);

      await createAuditLog({
        userId: assignedBy,
        entity: "UserRoute",
        entityId: `${userId}-${routeId}`,
        action: AuditAction.CREATE,
        details: {
          action: "Assigned user to route",
          userId,
          routeId,
          assignedAt: now,
          ...(roleInRoute != null && { roleInRoute }),
        },
      });
    }
  }
  return result;
};

/**
 * Remover usuario de una ruta (soft removal)
 */
export const removeUserFromRouteService = async (
  routeId: string,
  userId: string,
  removedBy: string
) => {
  const now = new Date();
  const updateResult = await prisma.userRoute.updateMany({
    where: { routeId, userId, isActive: true },
    data: { isActive: false, unassignedAt: now },
  });

  if (updateResult.count > 0) {
    await createAuditLog({
      userId: removedBy,
      entity: "UserRoute",
      entityId: `${userId}-${routeId}`,
      action: AuditAction.UPDATE,
      details: {
        action: "Unassigned user from route",
        userId,
        routeId,
        unassignedAt: now,
      },
    });
    return { success: true, unassigned: updateResult.count };
  }
  return { success: false, unassigned: 0 };
};

/**
 * Obtener usuarios asignados (activos y opción inactivos) a una ruta
 */
export const getUsersByRouteService = async (routeId: string, onlyActive = true) => {
  return prisma.userRoute.findMany({
    where: { routeId, ...(onlyActive && { isActive: true }) },
    include: { user: true },
  });
};

/**
 * Obtener rutas activas de un usuario
 */
export const getRoutesByUserService = async (userId: string) => {
  return prisma.userRoute.findMany({
    where: { userId, isActive: true },
    include: { route: true },
  });
};