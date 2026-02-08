import { z } from 'zod';
import { 
  ROLE_NAME_PATTERN, 
  MIN_ROLE_NAME_LENGTH, 
  MAX_ROLE_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  PASSWORD_PATTERNS,
} from '../config/system.js';

export const initialSetupSchema = z.object({
  // Company Information
  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .trim(),
  
  companyEmail: z.string()
    .email('Invalid company email format')
    .toLowerCase()
    .trim()
    .optional(),
  
  companyPhone: z.string()
    .min(7, 'Company phone must be at least 7 characters')
    .max(20, 'Company phone must be less than 20 characters')
    .trim()
    .optional(),
  
  companyAddress:  z.string()
    .min(5, 'Company address must be at least 5 characters')
    .max(200, 'Company address must be less than 200 characters')
    .trim()
    .optional(),
  
  // Primary Role
  primaryRoleName: z.string()
    .min(MIN_ROLE_NAME_LENGTH, `Role name must be at least ${MIN_ROLE_NAME_LENGTH} characters`)
    .max(MAX_ROLE_NAME_LENGTH, `Role name must be less than ${MAX_ROLE_NAME_LENGTH} characters`)
    .regex(ROLE_NAME_PATTERN, 'Role name must be uppercase letters and underscores only (e.g., SUPER_ADMIN, DIRECTOR, OWNER)')
    .transform(val => val.toUpperCase().trim()),
  
  primaryRoleDescription: z.string()
    .min(5, 'Role description must be at least 5 characters')
    .max(200, 'Role description must be less than 200 characters')
    .trim()
    .optional(),
  
  // Admin User
  adminFirstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  
  adminLastName:  z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  
  adminIdNumber: z.string()
    .min(5, 'ID Number must be at least 5 characters')
    .max(20, 'ID Number must be less than 20 characters')
    .trim(),

  adminUserName: z.string()
    .min(5, 'Username must be at least 5 characters')
    .max(20, 'Username must be less than 20 characters')
    .trim(),
  
  adminEmail: z
        .string()
        .nonempty('Email is required')
        .refine((value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }, 'Invalid email address')
        .trim()
        .toLowerCase()
        .trim(),
  
  adminPassword: z. string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .regex(PASSWORD_PATTERNS.UPPERCASE, 'Password must contain at least one uppercase letter')
    .regex(PASSWORD_PATTERNS. LOWERCASE, 'Password must contain at least one lowercase letter')
    .regex(PASSWORD_PATTERNS. NUMBER, 'Password must contain at least one number')
    .regex(PASSWORD_PATTERNS.SPECIAL, 'Password must contain at least one special character'),
  
  adminPhone: z.string()
    .min(10, 'Phone must be at least 10 characters')
    .max(20, 'Phone must be less than 20 characters')
    .trim(),
});

export type InitialSetupInput = z.infer<typeof initialSetupSchema>;