import prisma, { AuditAction } from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../utils/audit.js';
import type { AssignPermissionInput, UpdateRouteConfigInput } from '../validators/permissionRoute.validator.js';

/**
 * Obtener todas las rutas y agrupadas por categoría
 */
export const getAllRoutes = async () => {
  const routes = await prisma.routePermissionMap.findMany({
    include: {
      permissions: {
        include: {
          permission: {
            select: {
              id: true,
              slug: true,
              description: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: [
      { category: 'asc' },
      { routeName: 'asc' },
    ],
  });

  // Agrupar por categoría
  const grouped = routes.reduce((acc, route) => {
    const cat = route.category || 'uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(route);
    return acc;
  }, {} as Record<string, typeof routes>);

  // Estadísticas
  const stats = {
    total: routes.length,
    byCategory: Object.fromEntries(
      Object.entries(grouped).map(([cat, arr]) => [cat, arr.length])
    ),
    onlyPrimaryRole: routes.filter(r => r.onlyPrimaryRole).length,
    delegable: routes.filter(r => !r.onlyPrimaryRole).length,
    withPermissions: routes.filter(r => r.permissions.length > 0).length,
    withoutPermissions: routes.filter(r => r.permissions.length === 0 && !r.onlyPrimaryRole).length,
  };

  return { routes, grouped, stats };
};

/**
 * Obtener detalles de una ruta específica
 */
export const getRouteByKey = async (routeKey: string) => {
  const route = await prisma.routePermissionMap.findUnique({
    where: { routeKey },
    include: {
      permissions: {
        include: {
          permission: {
            include: {
              roles: {
                include: {
                  role: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                    },
                  },
                },
              },
              users: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!route) throw new AppError('Route not found', 404);

  return route;
};

/**
 * Asignar permiso a una ruta
 */
export const assignPermissionToRoute = async (
  routeKey: string,
  data: AssignPermissionInput,
  userId: string
) => {
  const route = await prisma.routePermissionMap.findUnique({ where: { routeKey } });
  if (!route) throw new AppError('Route not found', 404);

  if (route.onlyPrimaryRole) {
    throw new AppError('Cannot assign permissions to primary-role-only routes', 400);
  }

  const permission = await prisma.permission.findUnique({
    where: { id: data.permissionId },
  });
  if (!permission) throw new AppError('Permission not found', 404);

  const exists = await prisma.routePermission.findFirst({
    where: { routeId: route.id, permissionId: data.permissionId },
  });
  if (exists) throw new AppError('Permission already assigned to this route', 400);

  await prisma.routePermission.create({
    data: { routeId: route.id, permissionId: data.permissionId },
  });

  await createAuditLog({
    userId,
    entity: 'RoutePermission',
    entityId: `${route.id}-${data.permissionId}`,
    action: AuditAction.CREATE,
    details: {
      action: 'Permission assigned to route',
      routeKey,
      routeName: route.routeName,
      permissionId: data.permissionId,
      permissionSlug: permission.slug,
    },
  });

  return {
    routeKey,
    routeName: route.routeName,
    permission: {
      id: permission.id,
      slug: permission.slug,
      description: permission.description,
    },
  };
};

/**
 * Remover permiso de una ruta
 */
export const removePermissionFromRoute = async (
  routeKey: string,
  permissionId: string,
  userId: string
) => {
  const route = await prisma.routePermissionMap.findUnique({ where: { routeKey } });
  if (!route) throw new AppError('Route not found', 404);

  const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
  if (!permission) throw new AppError('Permission not found', 404);

  const deleted = await prisma.routePermission.deleteMany({
    where: { routeId: route.id, permissionId },
  });
  if (deleted.count === 0) {
    throw new AppError('Permission was not assigned to this route', 404);
  }

  await createAuditLog({
    userId,
    entity: 'RoutePermission',
    entityId: `${route.id}-${permissionId}`,
    action: AuditAction.DELETE,
    details: {
      action: 'Permission removed from route',
      routeKey,
      routeName: route.routeName,
      permissionId,
      permissionSlug: permission.slug,
    },
  });
};

/**
 * Actualizar configuración de una ruta
 */
export const updateRouteConfig = async (
  routeKey: string,
  data: UpdateRouteConfigInput,
  userId: string
) => {
  const route = await prisma.routePermissionMap.findUnique({ where: { routeKey } });
  if (!route) throw new AppError('Route not found', 404);

  // Si cambia a primaryRole, eliminamos permisos asociados
  if (data.onlyPrimaryRole === true && !route.onlyPrimaryRole) {
    await prisma.routePermission.deleteMany({ where: { routeId: route.id } });
  }

  const updated = await prisma.routePermissionMap.update({
    where: { routeKey },
    data: {
      ...(data.routeName && { routeName: data.routeName }),
      ...(data.routeDescription !== undefined && { routeDescription: data.routeDescription }),
      ...(data.onlyPrimaryRole !== undefined && { onlyPrimaryRole: data.onlyPrimaryRole }),
    },
  });

  await createAuditLog({
    userId,
    entity: 'RoutePermissionMap',
    entityId: route.id,
    action: AuditAction.UPDATE,
    details: {
      action: 'Route configuration updated',
      routeKey,
      changes: {
        routeName: data.routeName ? { from: route.routeName, to: data.routeName } : undefined,
        routeDescription:
          data.routeDescription !== undefined
            ? { from: route.routeDescription, to: data.routeDescription }
            : undefined,
        onlyPrimaryRole:
          data.onlyPrimaryRole !== undefined
            ? { from: route.onlyPrimaryRole, to: data.onlyPrimaryRole }
            : undefined,
      },
    },
  });

  return updated;
};