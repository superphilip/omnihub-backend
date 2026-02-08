import bcrypt from "bcryptjs";
import { AppError } from "./AppError.js";

export interface UserStatusCheck {
    status: string;
    deletedAt?: Date | null;
}

export function normalizeEmail(email: string) {
    return email.toLowerCase().trim();
}

export function normalizeUserName(userName: string) {
    return userName.toUpperCase().trim();
}

export async function verifyPassword(password: string, hash: string) {
    const isValid = await bcrypt.compare(password, hash);
    if (!isValid) throw new AppError('Invalid password', 401);
}

export function checkUserStatus(user: UserStatusCheck) {
    if (user.deletedAt) throw new AppError('Account has been deleted', 403);

    const statusMessages: Record<string, string> = {
        'BLOCKED': 'Your account has been blocked. Contact support',
        'DEACTIVATED': 'Your account has been deactivated',
        'PENDING': 'Your account is pending verification',
        'ACTION_REQUIRED': 'Action required on your account. Please complete your profile'
    };
    if (statusMessages[user.status]) throw new AppError(statusMessages[user.status] ?? 'Unknown error', 403);
}

export function raiseComplianceErrors(user: any) {
    if (user.complianceCheck?.requiresManualApproval) {
        throw new AppError('Your account is under review. Please wait for approval', 403);
    }
}