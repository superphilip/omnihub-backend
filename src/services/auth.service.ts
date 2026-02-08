import prisma from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import {
    verifyPassword,
    checkUserStatus,
    raiseComplianceErrors,
    normalizeUserName
} from '../utils/auth.js';
import { createAuditLog } from '../utils/audit.js';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt.js';
import type { LoginInput } from '../validators/auth.validator.js';
import { formatUserResponse } from '../utils/UserUtils.js';


export const loginUserService = async (data: LoginInput, ip?: string) => {
    const userName = normalizeUserName(data.userName);

    const user = await prisma.user.findUnique({
        where: { userName },
        include: {
            role: { select: { id: true, name: true } },
            complianceCheck: true,
            documents: true,
        },
    });
    if (!user) throw new AppError('Invalid credentials', 401);

    // Validaciones de usuario
    checkUserStatus(user);

    // Contraseña
    await verifyPassword(data.password, user.password);

    // Compliance
    raiseComplianceErrors(user);

    // Tokens
    const { accessToken, refreshToken } = generateTokenPair({
        userId: user.id,
        userName: user.userName,
        roleId: user.roleId,
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
    });

    await createAuditLog({
        userId: user.id,
        entity: 'Auth',
        entityId: user.id,
        action: 'CREATE',
        details: {
            action: 'User login',
            timestamp: new Date().toISOString(),
            ip: ip || 'N/A',
        },
    });

    const formattedUser = formatUserResponse(user, user.documents, user.complianceCheck);

    return {
        user: formattedUser,
        accessToken: `Bearer ${accessToken}`,
        refreshToken: `Bearer ${refreshToken}`,
    };
};

export async function handleRefreshToken(rawRefreshToken?: string): Promise<{ accessToken: string; refreshToken: string }> {
  let refreshToken = rawRefreshToken;
  if (!refreshToken) {
    throw new AppError('Refresh token es requerido en el body o el header Authorization.', 400);
  }
  if (refreshToken.startsWith('Bearer ')) {
    refreshToken = refreshToken.slice(7);
  }

  const decoded = verifyRefreshToken(refreshToken);
  const { iat, exp, ...payload } = decoded;
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(payload);

  return {
    accessToken: `Bearer ${accessToken}`,
    refreshToken: `Bearer ${newRefreshToken}`,
  };
}