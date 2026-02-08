import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as RoleService from '../services/role.service.js';

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

export const getAllRoles = asyncHandler(async (req:  Request, res: Response) => {
  const roles = await RoleService.getAllRoles();

  res.json({
    success: true,
    data: roles,
  });
});

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