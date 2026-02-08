import prisma, { AuditAction } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { createAuditLog } from "../utils/audit.js";
import type { CreateRouteInput, UpdateRouteInput } from "../validators/route.validators.js";

/**
 * Crear nueva ruta
 */
export const createRouteService = async (data: CreateRouteInput, userId: string) => {
  const exists = await prisma.route.findUnique({ where: { name: data.name } });
  if (exists) throw new AppError("Route name already exists", 409);

  const route = await prisma.route.create({ data });

  await createAuditLog({
    userId,
    entity: 'Route',
    entityId: route.id,
    action: AuditAction.CREATE,
    details: {
      action: 'Route created',
      name: route.name,
      zone: route.zone,
      description: route.description,
    },
  });

  return route;
};

/**
 * Listar todas las rutas
 */
export const getAllRoutesService = async () => {
  return prisma.route.findMany({
    orderBy: { name: "asc" },
    include: {
      assignedUsers: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true,
              clientLevel: true,
            }
          }
        }
      },
      clients: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
        }
      },
      loans: {
        select: {
          id: true,
          amountRequested: true,
          status: true,
          clientId: true,
        }
      }
    },
  });
};

/**
 * Obtener ruta por ID
 */
export const getRouteByIdService = async (id: string) => {
  const route = await prisma.route.findUnique({
    where: { id },
    include: {
      assignedUsers: {
        where: { isActive: true },
        select: {
          id: true,
          roleInRoute: true,
          isActive: true,
          assignedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true,
              clientLevel: true,
            }
          }
        }
      },
      clients: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
        }
      },
      loans: {
        select: {
          id: true,
          amountRequested: true,
          status: true,
          clientId: true,
        }
      }
    },
  });
  if (!route) throw new AppError("Route not found", 404);
  return route;
};

/**
 * Actualizar ruta
 */
export const updateRouteService = async (
  routeId: string,
  data: UpdateRouteInput,
  userId: string
) => {
  const route = await prisma.route.update({ where: { id: routeId }, data });

  await createAuditLog({
    userId,
    entity: 'Route',
    entityId: routeId,
    action: AuditAction.UPDATE,
    details: {
      action: 'Route updated',
      changes: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.zone ? { zone: data.zone } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
    },
  });

  return route;
};

/**
 * Desactivar ruta
 */
export const disableRouteService = async (routeId: string, userId: string) => {
  const route = await prisma.route.update({
    where: { id: routeId },
    data: { isActive: false },
  });

  await createAuditLog({
    userId,
    entity: 'Route',
    entityId: routeId,
    action: AuditAction.UPDATE,
    details: {
      action: 'Route disabled',
    },
  });

  return route;
};