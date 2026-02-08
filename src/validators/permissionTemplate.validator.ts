import { z } from 'zod';
import { getValidTemplateIds } from '../config/permissionTemplates.js';

export const applyTemplateSchema = z.object({
  templateId: z.string().superRefine((val, ctx) => {
    if (!getValidTemplateIds().includes(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid template ID: "${val}". Available: ${getValidTemplateIds().join(', ')}`,
      });
    }
  }),
  roleId: z.string().uuid().optional(),
});

export type ApplyTemplateInput = z.infer<typeof applyTemplateSchema>;