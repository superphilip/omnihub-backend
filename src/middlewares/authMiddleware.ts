import prisma from '../database/prismaClient.js';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken, type DecodedToken } from '../config/jwt.js';
import { asyncHandler } from './asyncHandler.js';
import { SYSTEM_CONFIG_KEYS } from '../config/system.js';

// ═══════════════════════════════════════════════════════
// EXTEND EXPRESS REQUEST TYPE
// ═══════════════════════════════════════════════════��═══

declare global {
  namespace Express {
    interface Request {
      user?:  DecodedToken & {
        id:     string;
        status:  string;
        roleName: string;
        isPrimaryRole: boolean;
      };
    }
  }
}

// ═══════════════════════════════════════════════════════
// AUTHENTICATE
// ═══════════════════════════════════════════════════════

export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?. startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }

  const token = authHeader.substring(7);
  
  if (!token) {
    throw new AppError('Invalid token format', 401);
  }

  const decoded = verifyAccessToken(token);

  if (!decoded. userId) {
    throw new AppError('Invalid token:  Missing user ID', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded. userId },
    select: { 
      id: true,
      status: true,
      deletedAt: true,
      roleId: true,
      role: {
        select: { 
          id: true,
          name: true,
          isSystemRole: true,
        },
      },
    },
  });

  if (!user || user.deletedAt) {
    throw new AppError('Invalid credentials', 401);
  }

  const inactiveStatuses:  Record<string, string> = {
    'BLOCKED': 'Access denied.  Account is blocked',
    'DEACTIVATED': 'Access denied. Account is deactivated',
    'PENDING':  'Account verification pending',
    'ACTION_REQUIRED': 'Action required on your account',
  };

  if (inactiveStatuses[user.status]) {
    throw new AppError(inactiveStatuses[user.status] ??  'Invalid credentials', 403);
  }

  if (! user.role?. name) {
    throw new AppError('User role not found', 403);
  }

  const primaryRoleConfig = await prisma.systemConfig.findUnique({
    where: { key:  SYSTEM_CONFIG_KEYS.PRIMARY_ROLE_ID },
  });

  const isPrimaryRole = primaryRoleConfig?.value === user. roleId;

  req.user = {
    ...decoded,
    id: decoded.userId,
    status: user.status,
    roleName: user.role.name,
    isPrimaryRole,
  };

  next();
});

// ═══════════════════════════════════════════════════════
// OPTIONAL AUTH
// ═══════════════════════════════════════════════════════

export const optionalAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);

    if (decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { 
          id: true,
          status: true,
          deletedAt: true,
          roleId: true,
          role:  {
            select: { 
              id: true,
              name: true,
            },
          },
        },
      });

      if (user && ! user.deletedAt && user.status === 'ACTIVE') {
        const primaryRoleConfig = await prisma.systemConfig.findUnique({
          where: { key:  SYSTEM_CONFIG_KEYS.PRIMARY_ROLE_ID },
        });

        const isPrimaryRole = primaryRoleConfig?.value === user.roleId;

        req.user = {
          ...decoded,
          id: decoded.userId,
          status: user.status,
          roleName: user. role?. name || '',
          isPrimaryRole,
        };
      }
    }
  } catch (error) {
    // Silently continue without user
  }

  next();
});

// ═══════════════════════════════════════════════════════
// REQUIRE PRIMARY ROLE
// ═══════════════════════════════════════════════════════

export const requirePrimaryRole = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Unauthorized.  Please login first', 401);
  }

  if (! req.user.isPrimaryRole) {
    throw new AppError('Access denied. Primary role required', 403);
  }

  next();
});

// ═══════════════════════════════════════════════════════
// AUTHORIZE (por roles)
// ═══════════════════════════════════════════════════════

export const authorize = (...allowedRoles: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized. Please login first', 401);
    }

    if (req.user.isPrimaryRole) {
      return next();
    }

    if (!req.user.roleName) {
      throw new AppError('Role information missing', 403);
    }

    const validRoles = await prisma.role.findMany({
      where: { name: { in: allowedRoles } },
      select: { name: true },
    });

    if (validRoles.length === 0) {
      throw new AppError('Invalid roles configuration', 500);
    }

    const validRoleNames = validRoles. map(r => r.name);

    if (!validRoleNames.includes(req. user.roleName)) {
      throw new AppError(
        `Access denied. Required roles: ${validRoleNames.join(', ')}`, 
        403
      );
    }

    next();
  });
};

// ═══════════════════════════════════════════════════════
// REQUIRE PERMISSION (AND logic - todos requeridos)
// ═══════════════════════════════════════════════════════

export const requirePermission = (...requiredPermissions: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized. Please login first', 401);
    }

    if (req.user.isPrimaryRole) {
      return next();
    }

    const userPermissions = await prisma.permission.findMany({
      where: {
        OR: [
          {
            roles: {
              some: {
                roleId: req.user.roleId,
              },
            },
          },
          {
            users: {
              some: {
                userId:  req.user.userId,
              },
            },
          },
        ],
      },
      select: { slug: true },
    });

    const userPermissionSlugs = userPermissions.map(p => p. slug);

    const hasAllPermissions = requiredPermissions. every(permission => 
      userPermissionSlugs.includes(permission)
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        p => !userPermissionSlugs.includes(p)
      );
      throw new AppError(
        `Access denied. Missing permissions: ${missingPermissions.join(', ')}`, 
        403
      );
    }

    next();
  });
};

// ═══════════════════════════════════════════════════════
// REQUIRE ANY PERMISSION (OR logic - al menos uno)
// ═══════════════════════════════════════════════════════

export const requireAnyPermission = (...requiredPermissions: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized. Please login first', 401);
    }

    if (req.user.isPrimaryRole) {
      return next();
    }

    const userPermissions = await prisma.permission.findMany({
      where: {
        OR: [
          {
            roles: {
              some: {
                roleId: req.user.roleId,
              },
            },
          },
          {
            users: {
              some: {
                userId: req. user.userId,
              },
            },
          },
        ],
      },
      select: { slug: true },
    });

    const userPermissionSlugs = userPermissions.map(p => p.slug);

    const hasAnyPermission = requiredPermissions.some(permission => 
      userPermissionSlugs.includes(permission)
    );

    if (!hasAnyPermission) {
      throw new AppError(
        `Access denied. Required at least one of: ${requiredPermissions.join(', ')}`, 
        403
      );
    }

    next();
  });
};

// ═══════════════════════════════════════════════════════
// REQUIRE PERMISSION OR ROLE (Híbrido)
// ═══════════════════════════════════════════════════════

export const requirePermissionOrRole = (
  permissionSlug: string, 
  fallbackRoles: string[] = []
) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized. Please login first', 401);
    }

    if (req.user. isPrimaryRole) {
      return next();
    }

    const permissionExists = await prisma.permission.findUnique({
      where: { slug: permissionSlug },
    });

    if (permissionExists) {
      const userHasPermission = await prisma. permission.findFirst({
        where: {
          slug: permissionSlug,
          OR: [
            {
              roles: {
                some:  {
                  roleId: req.user.roleId,
                },
              },
            },
            {
              users: {
                some: {
                  userId: req.user.userId,
                },
              },
            },
          ],
        },
      });

      if (userHasPermission) {
        return next();
      }

      throw new AppError(
        `Access denied. Missing permission: ${permissionSlug}`,
        403
      );
    }

    if (fallbackRoles.length > 0) {
      if (fallbackRoles.includes(req.user.roleName)) {
        return next();
      }

      throw new AppError(
        `Access denied. Required role: ${fallbackRoles.join(' or ')}`,
        403
      );
    }

    throw new AppError(
      `Access denied. Permission '${permissionSlug}' not configured in the system`,
      403
    );
  });
};

// ═══════════════════════════════════════════════════════
// REQUIRE ANY PERMISSION OR ROLE (Híbrido - OR logic)
// ═══════════════════════════════════════════════════════

export const requireAnyPermissionOrRole = (
  permissionSlugs: string[], 
  fallbackRoles: string[] = []
) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized. Please login first', 401);
    }

    if (req.user.isPrimaryRole) {
      return next();
    }

    const existingPermissions = await prisma. permission.findMany({
      where: { slug: { in: permissionSlugs } },
    });

    if (existingPermissions.length > 0) {
      const userPermissions = await prisma.permission.findMany({
        where: {
          slug: { in:  permissionSlugs },
          OR: [
            {
              roles: {
                some: {
                  roleId: req. user.roleId,
                },
              },
            },
            {
              users: {
                some: {
                  userId:  req.user.userId,
                },
              },
            },
          ],
        },
      });

      if (userPermissions. length > 0) {
        return next();
      }

      throw new AppError(
        `Access denied. Required at least one of: ${permissionSlugs. join(', ')}`,
        403
      );
    }

    if (fallbackRoles. length > 0) {
      if (fallbackRoles.includes(req.user.roleName)) {
        return next();
      }

      throw new AppError(
        `Access denied. Required role: ${fallbackRoles.join(' or ')}`,
        403
      );
    }

    throw new AppError(
      `Access denied.  Permissions not configured: ${permissionSlugs.join(', ')}`,
      403
    );
  });
};

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

export const checkUserHasPermission = async (
  userId: string, 
  permissionSlug: string
): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select:  { roleId: true },
  });

  if (!user) return false;

  const primaryRoleConfig = await prisma. systemConfig.findUnique({
    where: { key: SYSTEM_CONFIG_KEYS.PRIMARY_ROLE_ID },
  });

  if (primaryRoleConfig?.value === user.roleId) {
    return true;
  }

  const permission = await prisma.permission.findFirst({
    where: {
      slug: permissionSlug,
      OR: [
        {
          roles: {
            some:  {
              role: {
                users: {
                  some: { id: userId },
                },
              },
            },
          },
        },
        {
          users: {
            some: { userId },
          },
        },
      ],
    },
  });

  return !!permission;
};

export const getUserPermissions = async (userId:  string): Promise<string[]> => {
  const user = await prisma. user.findUnique({
    where: { id: userId },
    select: { roleId: true },
  });

  if (!user) return [];

  const primaryRoleConfig = await prisma. systemConfig.findUnique({
    where: { key: SYSTEM_CONFIG_KEYS.PRIMARY_ROLE_ID },
  });

  if (primaryRoleConfig?.value === user.roleId) {
    const allPermissions = await prisma.permission.findMany({
      select: { slug: true },
    });
    return allPermissions.map(p => p.slug);
  }

  const permissions = await prisma. permission.findMany({
    where: {
      OR: [
        {
          roles: {
            some: {
              role: {
                users: {
                  some: { id: userId },
                },
              },
            },
          },
        },
        {
          users: {
            some: { userId },
          },
        },
      ],
    },
    select: { slug: true },
  });

  return permissions.map(p => p.slug);
};

export const userHasPrimaryRole = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id:  userId },
    select: { roleId: true },
  });

  if (!user) return false;

  const primaryRoleConfig = await prisma.systemConfig.findUnique({
    where: { key:  SYSTEM_CONFIG_KEYS.PRIMARY_ROLE_ID },
  });

  return primaryRoleConfig?.value === user. roleId;
};

// ...  todo tu código anterior (authenticate, requirePrimaryRole, etc.)

// ═══════════════════════════════════════════════════════
// CHECK ROUTE ACCESS (100% Dinámico desde BD)
// ═══════════════════════════════════════════════════════

/**
 * Middleware que verifica acceso a rutas de forma completamente dinámica
 * NO recibe parámetros, todo se lee de BD
 */
export const checkRouteAccess = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // ─────────────────────────────────────────────────────
  // 1. DETECTAR LA RUTA ACTUAL
  // ─────────────────────────────────────────────────────
  const method = req.method;
  const path = req.route?.path || req.path;
  const basePath = req.baseUrl;
  const fullPath = `${basePath}${path}`;
  const routeKey = `${method}:${fullPath.replace(/\/+$/, '')}`;

  console.log(`🔍 Checking access for:  ${routeKey}`);

  const routeConfig = await prisma.routePermissionMap.findUnique({
    where: { routeKey },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!routeConfig) {
    console.error(`❌ Route not found in database: ${routeKey}`);
    throw new AppError(
      'Access denied.  Route not configured in the system',
      403
    );
  }

  if (routeConfig.requiresAuth && !req.user) {
    throw new AppError('Unauthorized.  Please login first', 401);
  }

  // Si no requiere auth, permitir
  if (!routeConfig.requiresAuth) {
    console.log('✅ Access granted: Public route');
    return next();
  }

  if (req.user!. isPrimaryRole) {
    console.log('✅ Access granted: Primary role bypass');
    return next();
  }

  
  if (routeConfig.onlyPrimaryRole) {
    console.log('❌ Access denied: Primary role only');
    throw new AppError(
      'Access denied. This action is reserved for system administrators',
      403
    );
  }

  if (routeConfig.permissions.length === 0) {
    console.log('❌ Access denied: No permissions configured for this route');
    throw new AppError(
      'Access denied.  This route has no permissions configured.  Contact administrator',
      403
    );
  }

  const requiredPermissionIds = routeConfig.permissions.map(rp => rp.permissionId);

  const userPermissions = await prisma. permission.findMany({
    where: {
      id: { in: requiredPermissionIds },
      OR: [
        // Permisos del rol
        {
          roles: {
            some: {
              roleId:  req.user!.roleId,
            },
          },
        },
        // Permisos directos del usuario
        {
          users:  {
            some: {
              userId: req.user!.userId,
            },
          },
        },
      ],
    },
  });

  if (userPermissions.length === 0) {
    const requiredPermissionNames = routeConfig.permissions
      .map(rp => rp.permission.slug)
      .join(', ');
    
    console.log(`❌ Access denied: Missing required permissions:  ${requiredPermissionNames}`);
    throw new AppError(
      `Access denied. Required permission: ${requiredPermissionNames}`,
      403
    );
  }

  console.log(`✅ Access granted: User has permission(s)`);
  next();
});