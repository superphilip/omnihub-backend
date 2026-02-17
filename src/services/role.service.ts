import prisma, { AuditAction } from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../utils/audit.js';
import type { FilterParams, PaginationParams } from '../utils/PaginationTypes.utils.js';
import type {
  CreateRoleInput,
  UpdateRoleInput,
  AssignPermissionsToRoleInput,
  RemovePermissionsFromRoleInput,
} from '../validators/role.validator.js';
import type { Locale } from '../i18n/locale.js';
import { fetchTranslationsMap, applyTranslations } from '../i18n/translate-repo.js';
import { TranslationService } from './translation.service.js';
import { translationConfig } from '../config/env.js';



const translator = new TranslationService(translationConfig);
/**
 * Crea un rol (texto base en la entidad; traducciones se administran aparte).
 */
export const createRole = async (data: CreateRoleInput, userId: string) => {
  const exists = await prisma.role.findUnique({ where: { name: data.name } });
  if (exists) throw new Error('Role with this name already exists');

  const role = await prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
      isSystemRole: data.isSystemRole,
    },
  });

  // Traducción automática (ejemplo: a inglés)
  const targetLangs = ['en'];
  for (const lang of targetLangs) {
    const nameTranslated = await translator.translate(role.name, lang);
    const descTranslated = await translator.translate(role.description ?? '', lang);
    await prisma.translation.createMany({
      data: [
        { resourceType: 'roles', resourceId: role.id, field: 'name', locale: lang, text: nameTranslated },
        { resourceType: 'roles', resourceId: role.id, field: 'description', locale: lang, text: descTranslated }
      ]
    });
  }

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

/**
 * Lista roles con paginación/filtrado, devolviendo name/description localizados según locale.
 */
export async function getAllRoles(
  pagination: PaginationParams,
  filters: FilterParams,
  locale: Locale
) {
  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.OR = [
      { name: { equals: filters.search, mode: 'insensitive' } },
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const orderBy = pagination.sort
    ? { [pagination.sort]: (pagination.order ?? 'asc') }
    : [{ isSystemRole: 'desc' as const }, { name: 'asc' as const }];

  const select = {
    id: true,
    name: true,
    description: true,
    isSystemRole: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  const [data, total] = await Promise.all([
    prisma.role.findMany({
      where,
      orderBy,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      select,
    }),
    prisma.role.count({ where }),
  ]);

  // Traducciones desde Translation con fallback al valor base
  const ids = data.map(r => r.id);
  const tmap = await fetchTranslationsMap(prisma, 'roles', ids, ['name', 'description'], locale);
  const localized = applyTranslations(data, tmap);

  return {
    data: localized,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    },
  };
}

/**
 * Obtiene un rol por ID (incluye relaciones); opcionalmente localiza los campos básicos.
 */
export const getRoleById = async (id: string, locale?: Locale) => {
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

  // Localiza name/description si se proporciona locale
  if (locale) {
    const tmap = await fetchTranslationsMap(prisma, 'roles', [role.id], ['name', 'description'], locale);
    const t = tmap.get(role.id);
    if (t?.name) role.name = t.name;
    if (t?.description) role.description = t.description;
  }

  return role;
};

/**
 * Actualiza un rol (texto base). Las traducciones se administran en el módulo de translations.
 */
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
      ...(data.isSystemRole !== undefined && { isSystemRole: data.isSystemRole }),
    },
  });

  // Traducción automática
  const targetLangs = ['en'];
  for (const lang of targetLangs) {
    if (data.name) {
      const nameTranslated = await translator.translate(data.name, lang);
      await prisma.translation.upsert({
        where: {
          resourceType_resourceId_field_locale: {
            resourceType: 'roles',
            resourceId: id,
            field: 'name',
            locale: lang,
          },
        },
        update: { text: nameTranslated },
        create: {
          resourceType: 'roles',
          resourceId: id,
          field: 'name',
          locale: lang,
          text: nameTranslated,
        },
      });
    }
    if (data.description !== undefined) {
      const descTranslated = await translator.translate(data.description ?? '', lang);
      await prisma.translation.upsert({
        where: {
          resourceType_resourceId_field_locale: {
            resourceType: 'roles',
            resourceId: id,
            field: 'description',
            locale: lang,
          },
        },
        update: { text: descTranslated },
        create: {
          resourceType: 'roles',
          resourceId: id,
          field: 'description',
          locale: lang,
          text: descTranslated,
        },
      });
    }
  }

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

/**
 * Elimina un rol (verifica usos y sistema).
 */
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

  // Elimina traducciones asociadas
  await prisma.translation.deleteMany({
    where: {
      resourceType: 'roles',
      resourceId: id,
    },
  });

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

/**
 * Asigna permisos a un rol (evita duplicados).
 */
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

/**
 * Quita permisos de un rol (solo los que existan).
 */
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