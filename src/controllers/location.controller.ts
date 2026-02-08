import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as LocationService from '../services/location.service.js';


//Register a new location for the authenticated user
export const recordLocation = asyncHandler(async (req: Request, res: Response) => {
  const result = await LocationService.recordLocation(req.user! .userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Location recorded successfully',
    data: result,
  });
});

// My current location
export const getMyCurrentLocation = asyncHandler(async (req: Request, res: Response) => {
  const location = await LocationService.getCurrentLocation(req.user!.userId);

  res.json({
    success: true,
    data: location,
  });
});

// My location history
export const getMyLocationHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await LocationService.getLocationHistory(
    req.user!.userId,
    req.query as any
  );

  res.json({
    success: true,
    data: history,
  });
});

//location of a specific user
export const getUserLocation = asyncHandler(async (req: Request, res: Response) => {
  const location = await LocationService.getCurrentLocation(req.params.userId as string);

  res.json({
    success: true,
    data: location,
  });
});

//location history of a specific user
export const getUserLocationHistory = asyncHandler(async (req: Request, res:  Response) => {
  const history = await LocationService.getLocationHistory(
    req.params.userId as string,
    req.query as any
  );

  res.json({
    success: true,
    data: history,
  });
});

// Real-time tracking of users by role
export const getRealTimeTracking = asyncHandler(async (req: Request, res: Response) => {
  const tracking = await LocationService.getRealTimeTracking(req.query. role as string);

  res.json({
    success: true,
    data: tracking,
  });
});

// Route tracking by route ID
export const getRouteTracking = asyncHandler(async (req: Request, res: Response) => {
  const tracking = await LocationService.getRouteTracking(req.params.routeId as string);

  res.json({
    success: true,
    data: tracking,
  });
});

// Cleanup old location records
export const cleanupOldLocations = asyncHandler(async (req: Request, res: Response) => {
  const result = await LocationService.cleanupOldLocations(req.body, req.user!.userId);

  res.json({
    success: true,
    message:  `${result.deletedCount} old location records deleted`,
    data: result,
  });
});