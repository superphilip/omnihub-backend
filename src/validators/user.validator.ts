import { use } from 'react';
import { z } from 'zod';


export const UserStatusEnum = z.enum(['PENDING', 'ACTION_REQUIRED', 'ACTIVE', 'BLOCKED', 'DEACTIVATED']);
export const ClientLevelEnum = z.enum(['BRONZE', 'SILVER', 'GOLD', 'DIAMOND']);

export const signupSchema = z.object({
    userName: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username cannot exceed 30 characters').trim(),
    email: z
        .string()
        .nonempty('Email is required')
        .refine((value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }, 'Invalid email address')
        .trim()
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/, 'Password too weak'),
    phone: z.string().min(7).max(15).trim(),
    address: z.string().min(5).max(200).trim(),
    bankAccount: z.string().regex(/^[0-9]+$/).min(10).max(20).trim().nullable(),
});

export const updateUserSchema = z.object({
    phone: z.string().min(7).max(15).trim().optional(),
    address: z.string()
        .min(10, 'Address must be at least 10 characters long')
        .max(200, 'Address cannot exceed 200 characters')
        .trim()
        .optional(),
    bankAccount: z.string().regex(/^[0-9]+$/).min(10).max(20).optional().nullable(),
});

export const confirmOCRSchema = z.object({
    firstName: z.string().min(2, 'First name is required').trim(),
    lastName: z.string().min(2, 'Last name is required').trim(),
    idNumber: z.string().min(5, 'Valid ID number is required').trim(),
    birthDate: z.coerce.date({ message: "Birth date is required" }),
});


export const updateUserDocumentSchema = z.object({
    description: z.string().max(255).optional().nullable()
}).optional();

export type SignupInput = z.infer<typeof signupSchema>;
export type ConfirmOCRInput = z.infer<typeof confirmOCRSchema>;
export type UpdateUserDocumentInput = z.infer<typeof updateUserDocumentSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserStatus = z.infer<typeof UserStatusEnum>;
export type ClientLevel = z.infer<typeof ClientLevelEnum>;