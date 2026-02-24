import bcrypt from "bcryptjs";
import { AppError } from "./AppError.js";
import type { Prisma } from "../database/prismaClient.js";

export interface UserStatusCheck {
    status: string;
    deletedAt?: Date | null;
}

type UserWithCompliance = Prisma.UserGetPayload<{
  include: { 
    role: { select: { id: true, name: true } }, 
    complianceCheck: true, 
    documents: true 
  }
}>;

export function normalizeEmail(email: string) {
    return email.toLowerCase().trim();
}

export function normalizeUserName(userName: string) {
    return userName.toUpperCase().trim();
}

export async function verifyPassword(password: string, hash: string) {
    const isValid = await bcrypt.compare(password, hash);
    if (!isValid) throw new AppError('validation.invalid_password', 401);
}

export function checkUserStatus(user: UserStatusCheck) {
    if (user.deletedAt) throw new AppError('validation.account_deleted', 403);

    const statusMessages: Record<string, string> = {
        'BLOCKED': 'validation.account_blocked',
        'DEACTIVATED': 'validation.account_deactivated',
        'PENDING': 'validation.account_pending',
        'ACTION_REQUIRED': 'validation.account_action_required'
    };
    if (statusMessages[user.status]) throw new AppError(statusMessages[user.status] ?? 'Unknown error', 403);
}

export function raiseComplianceErrors(user: UserWithCompliance | null | undefined) {
    
    if (!user || !user.complianceCheck) return;
    
    if (user.complianceCheck?.requiresManualApproval) {
        throw new AppError('validation.account_under_review', 403);
    }
}