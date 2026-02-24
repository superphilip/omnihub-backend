import { z } from 'zod';

export const loginSchema = z.object({
  userName: z.string().min(5, { message: 'validation.minlength' }),
  password: z.string()
    .min(8, { message: 'validation.minlength' })
});

export type LoginInput = z.infer<typeof loginSchema>;