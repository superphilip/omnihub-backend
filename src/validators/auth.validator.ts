import { z } from 'zod';

export const loginSchema = z.object({
    userName: z.string().min(5),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/, 'Password too weak'),
});

export type LoginInput = z.infer<typeof loginSchema>;