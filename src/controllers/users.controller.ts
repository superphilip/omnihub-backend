import type { Request, Response } from 'express';
import * as UserService from '../services/users.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { DocumentType } from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';

export const signup = asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.createUserService(req.body);
    res.status(201).json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const updatedUser = await UserService.updateUserService(
        id as string,
        req.body,
        (req as typeof req & { user: { id: string } }).user.id
    );

    res.status(200).json({
        success: true,
        data: updatedUser
    });
});

export const getDocumentTypes = asyncHandler(async (req: Request, res: Response) => {
    const types = await UserService.getDocumentTypesService();
    res.status(200).json({ success: true, data: types });
});

export const updateUserDocument = asyncHandler(async (req: Request, res: Response) => {
    const { id, docType } = req.params;
    const { description } = req.body || {};
    const file = req.file;


    const type = docType?.toUpperCase().replace(/-/g, '_') as DocumentType;
    const validTypes = await UserService.getDocumentTypesService();

    if (!validTypes.includes(type)) {
        throw new AppError(`El tipo '${docType}' no es válido.`, 400);
    }

    const updatedUser = await UserService.updateUserDocumentService(id as string, type, file as Express.Multer.File, description);
    res.status(200).json({ success: true, data: updatedUser });
});

export const confirmIdentity = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedUser = await UserService.confirmUserIdentityService(id as string, req.body);
    res.status(200).json({ 
        success: true,
        data: updatedUser
    });
});

export const manageUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, roleName, reason } = req.body;
    
    const updatedUser = await UserService.manageUserStatusService(
        id as string,
        (req as typeof req & { user: { id: string } }).user.id,
        status,
        roleName,
        reason
    );

    res.status(200).json({
        success: true,
        data: updatedUser
    });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await UserService.getUserByIdService(id as string);

    res.status(200).json({
        success: true,
        data: user
    });
});

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await UserService.getAllUsersService();

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});