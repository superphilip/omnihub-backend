import { z } from 'zod';

export const recordLocationSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  accuracy: z
    .number()
    .min(0, 'Accuracy must be positive')
    .max(10000, 'Accuracy must be less than 10km')
    .optional()
    .nullable(),
  timestamp: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
});

export const getLocationHistoryQuerySchema = z.object({
  startDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 100))
    .pipe(z.number().min(1).max(1000)),
});

export const cleanupLocationsSchema = z.object({
  olderThanDays: z
    .number()
    .min(1, 'Must be at least 1 day')
    .max(365, 'Cannot be more than 1 year')
    .default(90),
});

export type RecordLocationInput = z.infer<typeof recordLocationSchema>;
export type GetLocationHistoryQuery = z.infer<typeof getLocationHistoryQuerySchema>;
export type CleanupLocationsInput = z.infer<typeof cleanupLocationsSchema>;