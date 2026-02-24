import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as RoleService from '../services/role.service.js';
import COLUMN_LABELS from '../common/mappers/ColumRole.mapper.js';


export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await RoleService.createRole(
    req.body,
    req.user!.userId
  );

  res.status(201).json({
    success: true,
    message: 'notifications.saved',
    data: role,
  });
});

export async function getAllRoles(req: Request, res: Response) {
  const pagination = req.pagination!;
  const filters = req.filters ?? {};
  const includeColumns = String(req.query.include ?? '')
    .split(',').map(s => s.trim()).includes('columns');

  const result = await RoleService.getAllRoles(
    pagination,
    filters,
    req.locale ?? 'es' // ← pasa locale para traducción
  );

  if (includeColumns) {
  // Obtén locale (es/en)
  const locale = req.locale ?? 'es';
  const labels: Record<string, string> = COLUMN_LABELS[locale] ?? {};

  // Obtén keys de las columnas a mostrar
  const keys = Object.keys(result.data[0] ?? {});
  const columns = keys.map(key => ({
    key,
    label: labels[key] ?? key,
  }));

  return res.json({
    data: result.data,
    columns,
    meta: result.meta,
  });
}

  return res.json({
    data: result.data,
    meta: result.meta,
  });
}

export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const role = await RoleService.getRoleById(
    req.params.id as string,
    req.locale // ← localiza si está disponible
  );

  res.json({
    success: true,
    data: role,
  });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await RoleService.updateRole(
    req.params.id as string,
    req.body,
    req.user!.userId
  );

  res.json({
    success: true,
    message: 'notifications.updated',
    data: role,
  });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  await RoleService.deleteRole(
    req.params.id as string,
    req.user!.userId
  );

  res.json({
    success: true,
    message: 'notifications.deleted',
  });
});

export const assignPermissionsToRole = asyncHandler(async (req: Request, res: Response) => {
  const result = await RoleService.assignPermissionsToRole(
    req.params.id as string,
    req.body,
    req.user!.userId
  );

  res.json({
    success: true,
    message: `${result.assigned} permission(s) assigned successfully. ${result.skipped} already existed`,
    data: result,
  });
});

export const removePermissionsFromRole = asyncHandler(async (req: Request, res: Response) => {
  const result = await RoleService.removePermissionsFromRole(
    req.params.id as string,
    req.body,
    req.user!.userId
  );

  res.json({
    success: true,
    message: `${result.removed} permission(s) removed successfully`,
    data: result,
  });
});