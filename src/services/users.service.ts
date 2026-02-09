import prisma, { DocumentType, Prisma, UserStatus, AuditAction } from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../utils/audit.js';
import bcrypt from 'bcryptjs';
import type { SignupInput, ConfirmOCRInput, UpdateUserInput } from '../validators/user.validator.js';
import path from "path";
import fs from "fs";
import { formatUserResponse } from '../utils/UserUtils.js';

/**
 * Registro de usuario (signup)
 */
export const createUserService = async (input: SignupInput) => {
    const defaultRoleName = process.env.DEFAULT_REGISTER_ROLE || 'CLIENT';
    const defaultRole = await prisma.role.findUnique({ where: { name: defaultRoleName } });
    if (!defaultRole) throw new AppError('Default role not configured', 500);

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) throw new AppError('Email already exists', 409);

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                userName: input.userName,
                email: input.email,
                password: hashedPassword,
                phone: input.phone,
                address: input.address,
                bankAccount: input.bankAccount,
                roleId: defaultRole.id,
                status: 'PENDING',
            },
            include: { role: true }
        });

        const compliance = await tx.complianceCheck.create({
            data: {
                userId: newUser.id,
                riskFlags: { restrictive_lists: false, pep: false, manual_scoring: 'PENDING' },
            },
        });

        await createAuditLog({
            userId: newUser.id,
            entity: 'User',
            entityId: newUser.id,
            action: AuditAction.CREATE,
            details: {
                action: 'Initial Signup'
            },
        });

        return { user: newUser, compliance };
    });

    return formatUserResponse(result.user, [], result.compliance);
};

/**
 * Actualizar usuario (admin o self)
 */
export const updateUserService = async (
    userId: string,
    input: UpdateUserInput,
    adminId?: string
) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const changes: Record<string, { from: string | null; to: string | null }> = {};
    const fieldsToCompare: (keyof UpdateUserInput)[] = ['phone', 'address', 'bankAccount'];
    fieldsToCompare.forEach((field) => {
        if (input[field] !== undefined && input[field] !== user[field as keyof typeof user]) {
            changes[field] = {
                from: user[field as keyof typeof user] as string | null,
                to: input[field] as string | null
            };
        }
    });

    if (Object.keys(changes).length === 0) return user;

    return await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
                phone: input.phone ?? user.phone,
                address: input.address ?? user.address,
                bankAccount: input.bankAccount !== undefined ? input.bankAccount : user.bankAccount,
            },
        });

        await createAuditLog({
            userId: adminId || userId,
            entity: 'User',
            entityId: userId,
            action: AuditAction.UPDATE,
            details: {
                updates: changes,
                performedBy: adminId ? 'ADMIN' : 'USER'
            },
        });

        return updatedUser;
    });
};

/**
 * Subir o actualizar documento del usuario
 */
export const updateUserDocumentService = async (userId: string, type: DocumentType, file: Express.Multer.File, description?: string) => {
    const dbUrl = `/uploads/users/${userId}/${file.filename}`;

    await prisma.$transaction(async (tx) => {
        const existingDoc = await tx.userDocument.findFirst({ where: { userId, type } });

        if (existingDoc) {
            const oldPath = path.join(process.cwd(), 'public', existingDoc.url);
            if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch (_) {} }
            await tx.userDocument.update({
                where: { id: existingDoc.id },
                data: { url: dbUrl, description: description || null, status: 'PENDING' }
            });
        } else {
            await tx.userDocument.create({
                data: { type, url: dbUrl, userId, description: description || null, status: 'PENDING' }
            });
        }
    });

    const userDocs = await prisma.userDocument.findMany({ where: { userId } });
    const required = ['ID_FRONT', 'ID_BACK', 'SELFIE'];
    const isKitComplete = required.every(t => userDocs.some(d => d.type === t));

    if (isKitComplete) {
        processOCRSimulation(userId).catch(console.error);
    }

    const fullUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true, documents: true, complianceCheck: true }
    });

    return formatUserResponse(fullUser!, fullUser?.documents, fullUser?.complianceCheck);
};

/**
 * Simulación de OCR y auto-lenado (demo, async)
 */
const processOCRSimulation = async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    await prisma.user.update({
        where: { id: userId },
        data: {
            firstName: "GERONIMO",
            lastName: "VELEZ RUIZ",
            idNumber: "1999999999",
            birthDate: new Date("2000-03-12"),
            status: 'ACTION_REQUIRED'
        }
    });
};

/**
 * Confirmar identidad OCR
 */
export const confirmUserIdentityService = async (userId: string, input: ConfirmOCRInput) => {
    return await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
                firstName: input.firstName,
                lastName: input.lastName,
                idNumber: input.idNumber,
                birthDate: input.birthDate,
                status: 'PENDING'
            }
        });

        await tx.userDocument.updateMany({
            where: { userId, type: { in: ['ID_FRONT', 'ID_BACK', 'SELFIE'] } },
            data: { status: 'APPROVED' }
        });

        const fullUser = await tx.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
                documents: true,
                complianceCheck: true
            }
        });

        return formatUserResponse(fullUser!, fullUser?.documents, fullUser?.complianceCheck);
    });
};

/**
 * Tipos de documento disponibles
 */
export const getDocumentTypesService = async () => {
    return Object.values(DocumentType);
};

/**
 * Cambiar estado y/o rol del usuario (admin)
 */
export const manageUserStatusService = async (
    userId: string,
    adminId: string,
    newStatus: UserStatus,
    roleName?: string,
    reason?: string
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { documents: true }
    });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    let roleId = user.roleId;
    if (newStatus === 'ACTIVE') {
        const requiredDocs = ['ID_FRONT', 'ID_BACK', 'SELFIE'];
        const allApproved = requiredDocs.every(type =>
            user.documents.some(doc => doc.type === type && doc.status === 'APPROVED')
        );
        if (!allApproved) throw new AppError('No se puede activar: Documentos no aprobados por IA', 400);

        if (roleName) {
            const role = await prisma.role.findUnique({ where: { name: roleName } });
            if (!role) throw new AppError('El rol especificado no existe', 400);
            roleId = role.id;
        }
    }

    return await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
                status: newStatus,
                roleId: roleId,
                deletedAt: newStatus === 'DEACTIVATED' ? new Date() : (newStatus === 'ACTIVE' ? null : undefined)
            }
        });

        await createAuditLog({
            userId: adminId,
            entity: 'User',
            entityId: userId,
            action: AuditAction.UPDATE,
            details: {
                oldStatus: user.status,
                newStatus: newStatus,
                roleChanged: !!roleName,
                reason: reason || 'Cambio de estado administrativo'
            }
        });

        return updatedUser;
    });
};

/**
 * Obtener usuario con todos los datos por ID
 */
export const getUserByIdService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            role: true,
            documents: true,
            complianceCheck: true
        }
    });

    if (!user) throw new AppError('User not found', 404);

    return user;
};

/**
 * Listar todos los usuarios
 */
export const getAllUsersService = async () => {
    return await prisma.user.findMany({
        where: { deletedAt: null },
        include: {
            role: true
        },
        orderBy: { createdAt: 'desc' }
    });
};