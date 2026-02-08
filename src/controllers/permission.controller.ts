import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as PermissionService from '../services/permission.service.js';

/**
 * POST /api/permissions
 */
export const createPermission = asyncHandler(async (req: Request, res: Response) => {
  const permission = await PermissionService.createPermission(
    req.body,
    req.user! .userId
  );

  res.status(201).json({
    success: true,
    message: 'Permission created successfully',
    data: permission,
  });
});

/**
 * GET /api/permissions
 */
export const getAllPermissions = asyncHandler(async (req: Request, res: Response) => {
  const data = await PermissionService.getAllPermissions();

  res.json({
    success: true,
    data,
  });
});

/**
 * GET /api/permissions/:id
 */
export const getPermissionById = asyncHandler(async (req: Request, res:  Response) => {
  const permission = await PermissionService.getPermissionById(req.params. id as string);

  res.json({
    success: true,
    data: permission,
  });
});

/**
 * PUT /api/permissions/:id
 */
export const updatePermission = asyncHandler(async (req: Request, res: Response) => {
  const permission = await PermissionService.updatePermission(
    req.params.id as string,
    req.body,
    req.user!.userId
  );

  res.json({
    success: true,
    message: 'Permission updated successfully',
    data: permission,
  });
});

export const deletePermission = asyncHandler(async (req: Request, res: Response) => {
  await PermissionService.deletePermission(
    req.params.id as string,
    req.user!. userId
  );

  res.json({
    success: true,
    message: 'Permission deleted successfully',
  });
});

export const assignPermissionToRole = asyncHandler(async (req: Request, res: Response) => {
  const result = await PermissionService.assignPermissionToRole(
    req.params.id as string,
    req.body. roleId,
    req.user!.userId
  );

  res.json({
    success: true,
    message: 'Permission assigned to role successfully',
    data: result,
  });
});

export const removePermissionFromRole = asyncHandler(async (req: Request, res: Response) => {
  await PermissionService.removePermissionFromRole(
    req.params.id as string,
    req.params.roleId as string,
    req.user! .userId
  );

  res.json({
    success: true,
    message: 'Permission removed from role successfully',
  });
});