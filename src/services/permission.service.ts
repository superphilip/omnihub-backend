import prisma, { AuditAction } from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../utils/audit.js';
import { checkUserStatus } from '../utils/auth.js';
import type {
  CreatePermissionInput,
  UpdatePermissionInput,
} from '../validators/permission.validator.js';

/**
 * Crear un permiso
 */
export const createPermission = async (
  data: CreatePermissionInput,
  userId: string
) => {
  const exists = await prisma.permission.findUnique({
    where: { slug: data.slug },
  });
  if (exists) throw new AppError('Permission with this slug already exists', 409);

  const permission = await prisma.permission.create({
    data: {
      slug: data.slug,
      description: data.description,
      category: data.category,
    },
  });

  await createAuditLog({
    userId,
    entity: 'Permission',
    entityId: permission.id,
    action: AuditAction.CREATE,
    details: {
      action: 'Permission created',
      slug: permission.slug,
      description: permission.description,
      category: permission.category,
    },
  });

  return permission;
};

/**
 * Obtener todos los permisos
 */
export const getAllPermissions = async () => {
  const permissions = await prisma.permission.findMany({
    include: {
      _count: {
        select: {
          roles: true,
          users: true,
          routes: true,
        },
      },
    },
    orderBy: [
      { category: 'asc' },
      { slug: 'asc' },
    ],
  });

  // Agrupar por categoría
  const grouped = permissions.reduce((acc, perm) => {
    const cat = perm.category || 'uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(perm);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return { permissions, grouped };
};

/**
 * Obtener un permiso por ID
 */
export const getPermissionById = async (id: string) => {
  const permission = await prisma.permission.findUnique({
    where: { id },
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
      routes: {
        include: {
          route: {
            select: {
              routeKey: true,
              routeName: true,
              httpMethod: true,
              path: true,
            },
          },
        },
      },
    },
  });

  if (!permission) throw new AppError('Permission not found', 404);

  return permission;
};

/**
 * Actualizar un permiso
 */
export const updatePermission = async (
  id: string,
  data: UpdatePermissionInput,
  userId: string
) => {
  const permission = await prisma.permission.findUnique({ where: { id } });
  if (!permission) throw new AppError('Permission not found', 404);

  if (data.slug && data.slug !== permission.slug) {
    const exists = await prisma.permission.findUnique({ where: { slug: data.slug } });
    if (exists) throw new AppError('Permission with this slug already exists', 409);
  }

  const updated = await prisma.permission.update({
    where: { id },
    data: {
      ...(data.slug && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
    },
  });

  await createAuditLog({
    userId,
    entity: 'Permission',
    entityId: id,
    action: AuditAction.UPDATE,
    details: {
      action: 'Permission updated',
      changes: {
        slug: data.slug ? { from: permission.slug, to: data.slug } : undefined,
        description:
          data.description !== undefined
            ? { from: permission.description, to: data.description }
            : undefined,
        category:
          data.category !== undefined
            ? { from: permission.category, to: data.category }
            : undefined,
      },
    },
  });

  return updated;
};

/**
 * Eliminar un permiso
 */
export const deletePermission = async (id: string, userId: string) => {
  const permission = await prisma.permission.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          roles: true,
          users: true,
          routes: true,
        },
      },
    },
  });
  if (!permission) throw new AppError('Permission not found', 404);

  // Verificar si está en uso
  const totalUsage =
    permission._count.roles + permission._count.users + permission._count.routes;
  if (totalUsage > 0) {
    throw new AppError(
      `Cannot delete permission. It is assigned to ${permission._count.roles} role(s), ${permission._count.users} user(s), and ${permission._count.routes} route(s)`,
      400
    );
  }

  await prisma.permission.delete({ where: { id } });

  await createAuditLog({
    userId,
    entity: 'Permission',
    entityId: id,
    action: AuditAction.DELETE,
    details: {
      action: 'Permission deleted',
      slug: permission.slug,
    },
  });
};

/**
 * Asignar permiso a un rol
 */
export const assignPermissionToRole = async (
  permissionId: string,
  roleId: string,
  userId: string
) => {
  const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
  if (!permission) throw new AppError('Permission not found', 404);

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new AppError('Role not found', 404);

  const exists = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: { roleId, permissionId },
    },
  });
  if (exists) throw new AppError('Permission already assigned to this role', 400);

  await prisma.rolePermission.create({ data: { roleId, permissionId } });

  await createAuditLog({
    userId,
    entity: 'RolePermission',
    entityId: `${roleId}-${permissionId}`,
    action: AuditAction.CREATE,
    details: {
      action: 'Permission assigned to role',
      permissionSlug: permission.slug,
      roleName: role.name,
    },
  });

  return { permission, role };
};

/**
 * Remover permiso de un rol
 */
export const removePermissionFromRole = async (
  permissionId: string,
  roleId: string,
  userId: string
) => {
  const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
  if (!permission) throw new AppError('Permission not found', 404);

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new AppError('Role not found', 404);

  const deleted = await prisma.rolePermission.deleteMany({
    where: {
      roleId,
      permissionId,
    },
  });

  if (deleted.count === 0) {
    throw new AppError('Permission was not assigned to this role', 404);
  }

  await createAuditLog({
    userId,
    entity: 'RolePermission',
    entityId: `${roleId}-${permissionId}`,
    action: AuditAction.DELETE,
    details: {
      action: 'Permission removed from role',
      permissionSlug: permission.slug,
      roleName: role.name,
    },
  });
};