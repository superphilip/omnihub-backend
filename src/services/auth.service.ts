import prisma from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import {
  verifyPassword,
  checkUserStatus,
  raiseComplianceErrors,
  normalizeUserName
} from '../utils/auth.js';
import { createAuditLog } from '../utils/audit.js';
import {
  generateTokenPair, verifyRefreshToken
} from '../config/jwt.js';
import type { LoginInput } from '../validators/auth.validator.js';
import { formatUserResponse } from '../utils/UserUtils.js';


export const loginUserService = async (
  data: LoginInput,
  ip?: string,
  userAgent?: string,
  deviceId?: string
) => {
  const userName = normalizeUserName(data.userName);

  const user = await prisma.user.findUnique({
    where: { userName },
    include: {
      role: { select: { id: true, name: true } },
      complianceCheck: true,
      documents: true,
    },
  });

  if (!user) throw new AppError('validation.invalid_credentials', 401);

  checkUserStatus(user);
  await verifyPassword(data.password, user.password);
  raiseComplianceErrors(user);

  const { accessToken, refreshToken } = generateTokenPair({
    userId: user.id,
    userName: user.userName,
    roleId: user.roleId,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      updatedAt: new Date()
    }
  });

  if (deviceId) {
    await prisma.device.upsert({
      where: { deviceId },
      update: { lastLoginAt: new Date(), userId: user.id },
      create: {
        deviceId,
        userId: user.id,
        deviceName: userAgent ?? 'Unknown Device',
        lastLoginAt: new Date(),
      },
    });
  }

  await prisma.session.updateMany({
    where: {
      userId: user.id,
      isValid: true
    },
    data: {
      isValid: false,
      updatedAt: new Date()
    }
  });

  await prisma.session.create({
    data: {
      userId: user.id,
      deviceId: deviceId ?? null,
      token: refreshToken,
      ipAddress: ip,
      userAgent,
      isValid: true,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    }
  });

  await createAuditLog({
    userId: user.id,
    entity: 'Auth',
    entityId: user.id,
    action: 'CREATE',
    details: {
      action: 'User login',
      deviceId: deviceId || 'N/A',
      ip: ip || 'N/A',
      userAgent: userAgent || 'N/A',
    },
  });

  const formattedUser = formatUserResponse(user, user.documents, user.complianceCheck);

  return {
    user: formattedUser,
    accessToken: `Bearer ${accessToken}`,
    refreshToken: `Bearer ${refreshToken}`,
  };
};

// ========================================================
// REFRESH TOKEN
// ========================================================
export async function handleRefreshToken(rawRefreshToken?: string): Promise<{ accessToken: string; refreshToken: string }> {
  let refreshToken = rawRefreshToken;
  if (!refreshToken) {
    throw new AppError('validation.refresh_token_required', 400);
  }
  if (refreshToken.startsWith('Bearer ')) {
    refreshToken = refreshToken.slice(7);
  }

  // Busca sesión activa
  const session = await prisma.session.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });
  if (!session || !session.isValid) {
    throw new AppError('session.invalid', 401);
  }

  const decoded = verifyRefreshToken(refreshToken);
  const { iat, exp, ...payload } = decoded;
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(payload);

  // Actualiza el token en la sesión
  await prisma.session.update({
    where: { id: session.id },
    data: {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // ajusta según tu TTL refresh
    }
  });

  return {
    accessToken: `Bearer ${accessToken}`,
    refreshToken: `Bearer ${newRefreshToken}`,
  };
}

export async function logoutUserByToken(refreshToken: string) {
  if (!refreshToken) throw new AppError('validation.refresh_token_required', 400);

  const tokenToInvalidate = refreshToken.startsWith('Bearer ') 
    ? refreshToken.slice(7) 
    : refreshToken;

  // Busca y marca como invalida la sesión correspondiente a este token
  const updateResult = await prisma.session.updateMany({
    where: { 
      token: tokenToInvalidate,
      isValid: true // Solo intentamos invalidar si aún estaba activa
    },
    data: { 
      isValid: false,
      updatedAt: new Date() 
    },
  });

  return { 
    success: true, 
    message: 'login.logout_success',
    affected: updateResult.count 
  };
}

export async function logoutAllSessionsByUser(userId: string) {
  if (!userId) throw new AppError('users.no_users', 400);

  await prisma.session.updateMany({
    where: { userId, isValid: true },
    data: { isValid: false },
  });

  return { success: true, message: 'login.all_sessions_closed' };
}