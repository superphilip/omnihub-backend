import prisma, { AuditAction } from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../utils/audit.js';
import { paginateResource } from '../utils/PaginatePrisma.utils.js';
import type { FilterParams, PaginationParams } from '../utils/PaginationTypes.utils.js';
import type {
  CreateRoleInput,
  UpdateRoleInput,
  AssignPermissionsToRoleInput,
  RemovePermissionsFromRoleInput,
} from '../validators/role.validator.js';

export const createRole = async (
  data: CreateRoleInput,
  userId: string
) => {
  const exists = await prisma.role.findUnique({ where: { name: data.name } });
  if (exists) throw new AppError('Role with this name already exists', 409);

  const role = await prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
      isSystemRole: false,
    },
  });

  await createAuditLog({
    userId,
    entity: 'Role',
    entityId: role.id,
    action: AuditAction.CREATE,
    details: {
      action: 'Role created',
      name: role.name,
      description: role.description,
    },
  });

  return role;
};


// Ejemplo en roles
export async function getAllRoles(
  pagination: PaginationParams,
  filters: FilterParams
) {
  // Búsqueda avanzada: search en nombre/descripcion
  let where: Record<string, unknown> = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  // Multi-campo filtrado
  if (filters.status) {
    // Ejemplo si tienes campo status en roles
    where.status = filters.status;
  }

  // Más filtros: { isSystemRole: true }, etc.


  // Orden dinámico
  const orderBy = pagination.sort
    ? { [pagination.sort]: pagination.order }
    : [{ isSystemRole: 'desc' as const }, { name: 'asc' as const }];

  return await paginateResource(
    prisma.role,
    pagination,
    { where, orderBy}
  );
}

export const getRoleById = async (id: string) => {
  const role = await prisma.role.findUnique({
    where: { id },
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
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
        },
      },
    },
  });
  if (!role) throw new AppError('Role not found', 404);

  return role;
};

export const updateRole = async (
  id: string,
  data: UpdateRoleInput,
  userId: string
) => {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new AppError('Role not found', 404);

  if (role.isSystemRole) throw new AppError('Cannot update system roles', 403);

  if (data.name && data.name !== role.name) {
    const exists = await prisma.role.findUnique({ where: { name: data.name } });
    if (exists) throw new AppError('Role with this name already exists', 409);
  }

  const updated = await prisma.role.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });

  await createAuditLog({
    userId,
    entity: 'Role',
    entityId: id,
    action: AuditAction.UPDATE,
    details: {
      action: 'Role updated',
      changes: {
        name: data.name ? { from: role.name, to: data.name } : undefined,
        description: data.description !== undefined
          ? { from: role.description, to: data.description }
          : undefined,
      },
    },
  });

  return updated;
};

export const deleteRole = async (id: string, userId: string) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true } },
    },
  });
  if (!role) throw new AppError('Role not found', 404);

  if (role.isSystemRole) throw new AppError('Cannot delete system roles', 403);

  if (role._count.users > 0) {
    throw new AppError(
      `Cannot delete role. It is assigned to ${role._count.users} user(s)`,
      400
    );
  }

  await prisma.role.delete({ where: { id } });

  await createAuditLog({
    userId,
    entity: 'Role',
    entityId: id,
    action: AuditAction.DELETE,
    details: {
      action: 'Role deleted',
      name: role.name,
    },
  });
};

export const assignPermissionsToRole = async (
  roleId: string,
  data: AssignPermissionsToRoleInput,
  userId: string
) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new AppError('Role not found', 404);

  const permissions = await prisma.permission.findMany({
    where: { id: { in: data.permissionIds } },
  });
  if (permissions.length !== data.permissionIds.length) {
    throw new AppError('One or more permissions not found', 404);
  }

  const existing = await prisma.rolePermission.findMany({
    where: {
      roleId,
      permissionId: { in: data.permissionIds },
    },
  });
  const existingIds = existing.map(rp => rp.permissionId);
  const newPermissionIds = data.permissionIds.filter(id => !existingIds.includes(id));

  if (newPermissionIds.length === 0) {
    throw new AppError('All permissions are already assigned to this role', 400);
  }

  await prisma.rolePermission.createMany({
    data: newPermissionIds.map(permissionId => ({
      roleId,
      permissionId,
    })),
  });

  await createAuditLog({
    userId,
    entity: 'Role',
    entityId: roleId,
    action: AuditAction.UPDATE,
    details: {
      action: 'Permissions assigned to role',
      roleName: role.name,
      assignedCount: newPermissionIds.length,
      skippedCount: existingIds.length,
      permissionSlugs: permissions.filter(p => newPermissionIds.includes(p.id)).map(p => p.slug),
    },
  });

  return {
    assigned: newPermissionIds.length,
    skipped: existingIds.length,
  };
};

export const removePermissionsFromRole = async (
  roleId: string,
  data: RemovePermissionsFromRoleInput,
  userId: string
) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new AppError('Role not found', 404);

  const deleted = await prisma.rolePermission.deleteMany({
    where: {
      roleId,
      permissionId: { in: data.permissionIds },
    },
  });
  if (deleted.count === 0) {
    throw new AppError('None of the specified permissions were assigned to this role', 404);
  }

  await createAuditLog({
    userId,
    entity: 'Role',
    entityId: roleId,
    action: AuditAction.UPDATE,
    details: {
      action: 'Permissions removed from role',
      roleName: role.name,
      removedCount: deleted.count,
    },
  });

  return { removed: deleted.count };
};