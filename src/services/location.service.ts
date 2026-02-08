import prisma from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import { calculateDistance } from '../utils/locations.js';

import type {
  RecordLocationInput,
  GetLocationHistoryQuery,
  CleanupLocationsInput,
} from '../validators/location.validator.js';

/**
 * Registrar ubicación actual del usuario
 */
export const recordLocation = async (
  userId: string,
  data: RecordLocationInput
) => {
  // Verificar que el usuario existe y está activo
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      role: { select: { name: true } },
    },
  });
  if (!user) throw new AppError('User not found', 404);
  if (user.status !== 'ACTIVE') throw new AppError('User is not active', 403);

  const location = await prisma.locationRecord.create({
    data: {
      userId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      timestamp: data.timestamp || new Date(),
    },
  });

  return {
    location,
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role.name,
    },
  };
};

/**
 * Obtener ubicación más reciente de un usuario
 */
export const getCurrentLocation = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      role: { select: { name: true } },
    },
  });
  if (!user) throw new AppError('User not found', 404);

  const location = await prisma.locationRecord.findFirst({
    where: { userId },
    orderBy: { timestamp: 'desc' },
  });
  if (!location) throw new AppError('No location records found for this user', 404);

  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - location.timestamp.getTime()) / 60000);

  return {
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      status: user.status,
    },
    location: {
      id: location.id,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: location.timestamp,
      minutesAgo: diffMinutes,
      isRecent: diffMinutes < 15,
      status:
        diffMinutes < 5
          ? 'ONLINE'
          : diffMinutes < 15
          ? 'RECENT'
          : 'OFFLINE',
    },
  };
};

/**
 * Obtener historial de ubicaciones de un usuario
 */
export const getLocationHistory = async (
  userId: string,
  filters: GetLocationHistoryQuery
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: { select: { name: true } },
    },
  });
  if (!user) throw new AppError('User not found', 404);

  const whereClause: any = { userId };
  if (filters.startDate || filters.endDate) {
    whereClause.timestamp = {};
    if (filters.startDate) whereClause.timestamp.gte = filters.startDate;
    if (filters.endDate) whereClause.timestamp.lte = filters.endDate;
  }

  const locations = await prisma.locationRecord.findMany({
    where: whereClause,
    orderBy: { timestamp: 'desc' },
    take: filters.limit || 100,
  });

  let totalDistance = 0;
  for (let i = 0; i < locations.length - 1; i++) {
    totalDistance += calculateDistance(
      locations[i]!.latitude,
      locations[i]!.longitude,
      locations[i + 1]!.latitude,
      locations[i + 1]!.longitude
    );
  }

  return {
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role.name,
    },
    summary: {
      totalRecords: locations.length,
      firstRecord: locations[locations.length - 1]?.timestamp,
      lastRecord: locations[0]?.timestamp,
      estimatedDistanceKm: parseFloat(totalDistance.toFixed(2)),
    },
    locations,
  };
};

/**
 * Tracking en tiempo real - Todos los usuarios activos
 */
export const getRealTimeTracking = async (roleFilter?: string) => {
  const users = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      ...(roleFilter && { role: { name: roleFilter } }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: { select: { name: true } },
      assignedRoutes: {
        include: {
          route: { select: { id: true, name: true, zone: true } },
        },
      },
    },
  });

  const tracking = await Promise.all(
    users.map(async (user) => {
      const lastLocation = await prisma.locationRecord.findFirst({
        where: { userId: user.id },
        orderBy: { timestamp: 'desc' },
      });

      if (!lastLocation) return null;

      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastLocation.timestamp.getTime()) / 60000);

      return {
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone,
          role: user.role.name,
          routes: user.assignedRoutes.map((r) => ({
            id: r.route.id,
            name: r.route.name,
            zone: r.route.zone,
          })),
        },
        location: {
          id: lastLocation.id,
          latitude: lastLocation.latitude,
          longitude: lastLocation.longitude,
          accuracy: lastLocation.accuracy,
          timestamp: lastLocation.timestamp,
          minutesAgo: diffMinutes,
          status:
            diffMinutes < 5
              ? 'ONLINE'
              : diffMinutes < 15
              ? 'RECENT'
              : 'OFFLINE',
        },
      };
    })
  );

  const activeTracking = tracking
    .filter((t) => t !== null)
    .sort((a, b) => a!.location.minutesAgo - b!.location.minutesAgo);

  return {
    total: activeTracking.length,
    online: activeTracking.filter((t) => t!.location.status === 'ONLINE').length,
    recent: activeTracking.filter((t) => t!.location.status === 'RECENT').length,
    offline: activeTracking.filter((t) => t!.location.status === 'OFFLINE').length,
    tracking: activeTracking,
  };
};

/**
 * Tracking por ruta
 */
export const getRouteTracking = async (routeId: string) => {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: {
      assignedUsers: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              status: true,
              role: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!route) throw new AppError('Route not found', 404);

  const tracking = await Promise.all(
    route.assignedUsers.map(async (ur) => {
      const user = ur.user;

      const lastLocation = await prisma.locationRecord.findFirst({
        where: { userId: user.id },
        orderBy: { timestamp: 'desc' },
      });

      if (!lastLocation) {
        return {
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
            role: user.role.name,
            status: user.status,
          },
          location: null,
        };
      }

      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastLocation.timestamp.getTime()) / 60000);

      return {
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone,
          role: user.role.name,
          status: user.status,
        },
        location: {
          id: lastLocation.id,
          latitude: lastLocation.latitude,
          longitude: lastLocation.longitude,
          accuracy: lastLocation.accuracy,
          timestamp: lastLocation.timestamp,
          minutesAgo: diffMinutes,
          status:
            diffMinutes < 5
              ? 'ONLINE'
              : diffMinutes < 15
              ? 'RECENT'
              : 'OFFLINE',
        },
      };
    })
  );

  return {
    route: {
      id: route.id,
      name: route.name,
      zone: route.zone,
      description: route.description,
    },
    totalUsers: tracking.length,
    usersWithLocation: tracking.filter((t) => t.location !== null).length,
    tracking,
  };
};

/**
 * Limpiar ubicaciones antiguas
 */
export const cleanupOldLocations = async (
  data: CleanupLocationsInput,
  userId: string
) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - data.olderThanDays);

  const deleted = await prisma.locationRecord.deleteMany({
    where: { timestamp: { lt: cutoffDate } },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      entity: 'LocationRecord',
      entityId: 'BULK_CLEANUP',
      action: 'DELETE',
      changeDetails: JSON.stringify({
        action: 'Old location records cleaned up',
        olderThanDays: data.olderThanDays,
        cutoffDate: cutoffDate.toISOString(),
        deletedCount: deleted.count,
      }),
    },
  });

  return {
    deletedCount: deleted.count,
    olderThanDays: data.olderThanDays,
    cutoffDate,
  };
};