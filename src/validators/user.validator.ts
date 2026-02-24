import { use } from 'react';
import { z } from 'zod';


export const UserStatusEnum = z.enum(['enum.userStatus.PENDING', 'enum.userStatus.ACTION_REQUIRED', 'enum.userStatus.ACTIVE', 'enum.userStatus.BLOCKED', 'enum.userStatus.DEACTIVATED']);
export const ClientLevelEnum = z.enum(['enum.clientLevel.BRONZE', 'enum.clientLevel.SILVER', 'enum.clientLevel.GOLD', 'enum.clientLevel.DIAMOND']);

export const signupSchema = z.object({
    userName: z.string().min(3, 'validation.minlength').trim(),
    email: z
        .string()
        .nonempty('validation.required')
        .refine((value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }, 'validation.email')
        .trim()
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(8, 'validation.minlength')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/, 'validation.robust_password'),
    phone: z.string().min(7, 'validation.minlength').trim(),
    address: z.string().min(5, 'validation.minlength').regex(/^[\w\s#\-,.]+$/, { message: 'validation.valid_address' }).trim(),
    bankAccount: z.string().regex(/^[0-9]+$/).min(10, 'validation.minlength').trim().nullable(),
});

export const updateUserSchema = z.object({
    phone: z.string().min(7, 'validation.minlength').max(15, 'validation.maxlength').trim().optional(),
    address: z.string()
        .min(10, 'validation.minlength')
        .regex(/^[\w\s#\-,.]+$/, { message: 'validation.valid_address' })
        .trim()
        .optional(),
    bankAccount: z.string().regex(/^[0-9]+$/).min(10, 'validation.minlength').optional().nullable(),
});

export const confirmOCRSchema = z.object({
    firstName: z.string().min(2, 'validation.required').trim(),
    lastName: z.string().min(2, 'validation.required').trim(),
    idNumber: z.string().min(5, 'validation.required').trim(),
    birthDate: z.coerce.date({ message: "validation.required" }),
});


export const updateUserDocumentSchema = z.object({
    description: z.string().optional().nullable()
}).optional();

export type SignupInput = z.infer<typeof signupSchema>;
export type ConfirmOCRInput = z.infer<typeof confirmOCRSchema>;
export type UpdateUserDocumentInput = z.infer<typeof updateUserDocumentSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserStatus = z.infer<typeof UserStatusEnum>;
export type ClientLevel = z.infer<typeof ClientLevelEnum>;