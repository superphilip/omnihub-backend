import { z } from 'zod';

export const initialSetupSchema = z.object({
  // Company Information
  companyName: z.string()
    .min(2, 'validation.minlength')
    .trim(),

  companyEmail: z.string()
    .refine((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }, 'validation.email')
    .toLowerCase()
    .trim()
    .optional(),

  companyPhone: z.string()
    .min(7, 'validation.minlength')
    .trim()
    .optional(),

  companyAddress: z.string()
    .min(5, 'validation.minlength')
    .trim()
    .optional(),

  // Primary Role
  primaryRoleName: z.string()
    .min(2,'validation.minlength')
    .regex(/^[A-Z_]+$/,'validation.role_name')
    .transform(val => val.toUpperCase().trim()),

  primaryRoleDescription: z.string()
    .min(5, 'validation.minlength')
    .trim()
    .optional(),

  // Admin User
  adminFirstName: z.string()
    .min(2, 'validation.minlength')
    .trim(),

  adminLastName: z.string()
    .min(2, 'validation.minlength')
    .trim(),

  adminIdNumber: z.string()
    .min(5, 'validation.minlength')
    .trim(),

  adminUserName: z.string()
    .min(5, 'validation.minlength')
    .trim(),

  adminEmail: z
    .string()
    .nonempty('validation.required')
    .refine((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }, 'validation.email')
    .trim()
    .toLowerCase()
    .trim(),

  adminPassword: z.string()
        .min(8, 'validation.minlength')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/, 'validation.robust_password'),

  adminPhone: z.string()
    .min(10, 'validation.minlength')
    .trim(),
});

export type InitialSetupInput = z.infer<typeof initialSetupSchema>;