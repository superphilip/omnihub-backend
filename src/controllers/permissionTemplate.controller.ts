import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { 
  listTemplates, 
  previewTemplate, 
  applyTemplate 
} from '../services/permissionTemplate.service.js';

export const getTemplates = asyncHandler(async (req: Request, res: Response) => {
  const templates = await listTemplates();

  res.json({
    success: true,
    data: templates,
  });
});

export const getTemplatePreview = asyncHandler(async (req: Request, res:  Response) => {
  const { templateId } = req.params;
  
  const preview = await previewTemplate(templateId as string);

  res.json({
    success: true,
    data: preview,
  });
});

export const applyPermissionTemplate = asyncHandler(async (req: Request, res: Response) => {
  const result = await applyTemplate(req.body, req.user!.userId);
  res.status(201).json({
    success: true,
    message: 'Template applied successfully',
    data: result,
  });
});