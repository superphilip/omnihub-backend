import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as RoleService from '../services/role.service.js';
import { inferColumnsFromRows } from '../utils/ColumnInfer.utils.js';

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await RoleService.createRole(
    req.body,
    req.user!.userId
  );

  res.status(201).json({
    success: true,
    message: 'Role created successfully',
    data: role,
  });
});


export async function getAllRoles(req: Request, res: Response) {
  const pagination = req.pagination!;
  const filters = req.filters ?? {};
  const includeColumns = String(req.query.include ?? '')
    .split(',').map(s => s.trim()).includes('columns');

  // Ejecuta la consulta
  const result = await RoleService.getAllRoles(pagination, filters);

  // Si se piden columnas, infiérela desde la data
  if (includeColumns) {
    const columns = inferColumnsFromRows(result.data as unknown as Record<string, unknown>[], {
      excludeKeys: ['password', 'refreshToken'],
    });

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
  const role = await RoleService. getRoleById(req.params. id as string);

  res.json({
    success: true,
    data: role,
  });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await RoleService.updateRole(
    req. params.id as string,
    req.body,
    req. user!.userId
  );

  res.json({
    success: true,
    message: 'Role updated successfully',
    data: role,
  });
});

export const deleteRole = asyncHandler(async (req: Request, res:  Response) => {
  await RoleService.deleteRole(
    req.params.id as string,
    req.user!.userId
  );

  res.json({
    success: true,
    message: 'Role deleted successfully',
  });
});

export const assignPermissionsToRole = asyncHandler(async (req: Request, res:  Response) => {
  const result = await RoleService.assignPermissionsToRole(
    req.params.id as string,
    req.body,
    req.user!.userId
  );

  res.json({
    success: true,
    message: `${result.assigned} permission(s) assigned successfully.  ${result.skipped} already existed`,
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