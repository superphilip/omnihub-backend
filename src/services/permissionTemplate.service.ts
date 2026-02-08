import prisma, { AuditAction } from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../utils/audit.js';
import { getAllTemplates, getTemplateById, getTemplatePreview } from '../config/permissionTemplates.js';
import { SYSTEM_CONFIG_KEYS } from '../config/system.js';
import type { ApplyTemplateInput } from '../validators/permissionTemplate.validator.js';

export const listTemplates = async () => {
  const templates = getAllTemplates();
  return templates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    icon: t.icon,
    recommended: t.recommended,
    totalPermissions: t.totalPermissions,
  }));
};

export const previewTemplate = async (templateId: string) => {
  const preview = getTemplatePreview(templateId);
  if (!preview) throw new AppError('Template not found', 404);
  return preview;
};

export const applyTemplate = async (data: ApplyTemplateInput, userId: string) => {
  const template = getTemplateById(data.templateId);
  if (!template) throw new AppError('Template not found', 404);

  let targetRoleId = data.roleId;

  if (!targetRoleId) {
    const primaryRoleConfig = await prisma.systemConfig.findUnique({
      where: { key: SYSTEM_CONFIG_KEYS.PRIMARY_ROLE_ID },
    });
    if (!primaryRoleConfig) throw new AppError('Primary role not found in system configuration', 500);
    targetRoleId = primaryRoleConfig.value;
  }

  const role = await prisma.role.findUnique({ where: { id: targetRoleId } });
  if (!role) throw new AppError('Role not found', 404);

  // Búsqueda y creación en batch de permisos
  const createdPermissions = [];
  const assignedPermissions = [];
  const skippedPermissions = [];

  // 1. Permisos ya existentes
  const existingPermissions = await prisma.permission.findMany({
    where: { slug: { in: template.permissions.map(p => p.slug) } },
  });
  const existingPermissionsMap = new Map(existingPermissions.map(p => [p.slug, p]));

  // 2. Crear los que no existen
  const permissionsToCreate = template.permissions.filter(
    p => !existingPermissionsMap.has(p.slug)
  );
  if (permissionsToCreate.length > 0) {
    await prisma.permission.createMany({
      data: permissionsToCreate.map(p => ({
        slug: p.slug,
        description: p.description,
        category: p.category,
      })),
    });
    const newlyCreated = await prisma.permission.findMany({
      where: { slug: { in: permissionsToCreate.map(p => p.slug) } },
    });
    createdPermissions.push(...newlyCreated);
    newlyCreated.forEach(p => existingPermissionsMap.set(p.slug, p));
  }

  // 3. Buscar ya asignados
  const allPermissionIds = Array.from(existingPermissionsMap.values()).map(p => p.id);
  const existingAssignments = await prisma.rolePermission.findMany({
    where: { roleId: targetRoleId, permissionId: { in: allPermissionIds } },
  });
  const existingAssignmentsSet = new Set(existingAssignments.map(a => a.permissionId));

  // 4. Asignar los que correspondan
  const assignmentsToCreate = template.permissions
    .map(p => existingPermissionsMap.get(p.slug))
    .filter(p => p && !existingAssignmentsSet.has(p.id))
    .map(p => ({
      roleId: targetRoleId,
      permissionId: p!.id,
    }));
  if (assignmentsToCreate.length > 0) {
    await prisma.rolePermission.createMany({ data: assignmentsToCreate });
    assignedPermissions.push(...assignmentsToCreate);
  }

  // 5. Los que ya estaban asignados
  const skipped = template.permissions
    .map(p => existingPermissionsMap.get(p.slug))
    .filter(p => p && existingAssignmentsSet.has(p.id));
  skippedPermissions.push(...skipped);

  // 6. Marcar como aplicado en systemConfig
  await prisma.systemConfig.upsert({
    where: { key: SYSTEM_CONFIG_KEYS.TEMPLATE_APPLIED },
    update: { value: 'true' },
    create: {
      key: SYSTEM_CONFIG_KEYS.TEMPLATE_APPLIED,
      value: 'true',
      description: 'Whether a permission template has been applied',
      isPublic: false,
    },
  });

  // 7. Audit log
  await createAuditLog({
    userId,
    entity: 'Permission',
    entityId: 'TEMPLATE',
    action: AuditAction.CREATE,
    details: {
      action: 'Applied permission template',
      templateId: template.id,
      templateName: template.name,
      roleId: targetRoleId,
      roleName: role.name,
      permissionsCreated: createdPermissions.length,
      permissionsAssigned: assignedPermissions.length,
      permissionsSkipped: skippedPermissions.length,
      timestamp: new Date().toISOString(),
    },
  });

  return {
    template: {
      id: template.id,
      name: template.name,
      description: template.description,
      icon: template.icon,
    },
    role: {
      id: role.id,
      name: role.name,
    },
    stats: {
      permissionsCreated: createdPermissions.length,
      permissionsAssigned: assignedPermissions.length,
      permissionsSkipped: skippedPermissions.length,
      totalPermissions: template.totalPermissions,
    },
    permissions: template.permissions.map(p => ({
      slug: p.slug,
      description: p.description,
      category: p.category,
    })),
  };
};