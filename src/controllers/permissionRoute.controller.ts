import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as permissionRouteService from '../services/permissionRoute.service.js';


export const getAllRoutes = asyncHandler(async (req: Request, res: Response) => {
  const data = await permissionRouteService.getAllRoutes();

  res.json({
    success: true,
    data,
  });
});


export const getRouteDetails = asyncHandler(async (req: Request, res: Response) => {
  const { routeKey } = req.params;
  
  const route = await permissionRouteService.getRouteByKey(
    decodeURIComponent(routeKey as string)
  );

  res.json({
    success: true,
    data: route,
  });
});

export const assignPermissionToRoute = asyncHandler(async (req: Request, res: Response) => {
  const { routeKey } = req.params;
  const { permissionId } = req.body;

  const result = await permissionRouteService.assignPermissionToRoute(
    decodeURIComponent(routeKey as string),
    {permissionId},
    req.user!.userId
  );

  res.json({
    success: true,
    message: 'Permission assigned to route successfully',
    data: result,
  });
});

export const removePermissionFromRoute = asyncHandler(async (req: Request, res: Response) => {
  const { routeKey, permissionId } = req.params;

  await permissionRouteService.removePermissionFromRoute(
    decodeURIComponent(routeKey as string),
    permissionId as string,
    req.user!.userId
  );

  res.json({
    success: true,
    message: 'Permission removed from route successfully',
  });
});

export const updateRouteConfig = asyncHandler(async (req: Request, res: Response) => {
  const { routeKey } = req. params;
  const { routeName, routeDescription, onlyPrimaryRole } = req.body;

  const updated = await permissionRouteService.updateRouteConfig(
    decodeURIComponent(routeKey as string),
    { routeName, routeDescription, onlyPrimaryRole },
    req.user! .userId
  );

  res.json({
    success: true,
    message: 'Route configuration updated successfully',
    data:  updated,
  });
});