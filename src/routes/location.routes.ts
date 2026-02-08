import { Router } from 'express';
import {
  authenticate,
  requirePrimaryRole,
  checkRouteAccess,
} from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateBody.js';
import * as LocationController from '../controllers/location.controller.js';
import {
  recordLocationSchema,
  cleanupLocationsSchema,
} from '../validators/location.validator.js';

const router = Router();

router.use(authenticate);

//Register location
router.post(
  '/',
  validateBody(recordLocationSchema),
  LocationController.recordLocation
);

//View my location and history
router.get('/me', LocationController.getMyCurrentLocation);
router.get('/me/history', LocationController.getMyLocationHistory);

// View other users' locations (requires permissions)
router.get(
  '/user/:userId',
  checkRouteAccess,
  LocationController.getUserLocation
);

// View other users' location history (requires permissions)
router.get(
  '/user/:userId/history',
  checkRouteAccess,
  LocationController.getUserLocationHistory
);

// Real-time tracking (requires permissions)
router.get(
  '/tracking',
  checkRouteAccess,
  LocationController.getRealTimeTracking
);

// Route tracking (requires permissions)
router.get(
  '/route/:routeId',
  checkRouteAccess,
  LocationController.getRouteTracking
);

// Cleanup old location records (admin only)
router.delete(
  '/cleanup',
  requirePrimaryRole,
  validateBody(cleanupLocationsSchema),
  LocationController.cleanupOldLocations
);

export default router;