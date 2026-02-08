import prisma, { AuditAction } from '../database/prismaClient.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../utils/audit.js';
import { SYSTEM_CONFIG_KEYS, DEFAULT_SYSTEM_VERSION } from '../config/system.js';
import { generateTokenPair } from '../config/jwt.js';
import type { InitialSetupInput } from '../validators/setup.validator.js';

/**
 * Verifica el estado de configuración inicial del sistema
 */
export const checkSetupStatus = async () => {
  const userCount = await prisma.user.count();
  const isConfigured = await prisma.systemConfig.findUnique({
    where: { key: SYSTEM_CONFIG_KEYS.IS_CONFIGURED },
  });

  return {
    needsSetup: userCount === 0 && !isConfigured,
    isConfigured: !!isConfigured && userCount > 0,
    userCount,
  };
};

/**
 * Realiza el setup inicial del sistema
 */
export const performInitialSetup = async (data: InitialSetupInput) => {
  const status = await checkSetupStatus();
  if (!status.needsSetup) throw new AppError('System is already configured', 400);

  return await prisma.$transaction(async (tx) => {
    const primaryRole = await tx.role.create({
      data: {
        name: data.primaryRoleName,
        description: data.primaryRoleDescription || `Primary system role: ${data.primaryRoleName}`,
        isSystemRole: true,
      },
    });

    const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

    const adminUser = await tx.user.create({
      data: {
        firstName: data.adminFirstName,
        lastName: data.adminLastName,
        idNumber: data.adminIdNumber,
        userName: data.adminUserName,
        email: data.adminEmail,
        password: hashedPassword,
        phone: data.adminPhone,
        address: data.companyAddress || data.companyName,
        roleId: primaryRole.id,
        status: 'ACTIVE',
        clientLevel: 'DIAMOND',
        creditScore: 999,
      },
    });

    await tx.complianceCheck.create({
      data: {
        userId: adminUser.id,
        amlRiskScore: 0,
        requiresManualApproval: false,
      },
    });

    await tx.device.create({
      data: {
        userId: adminUser.id,
        deviceId: `SETUP-${adminUser.id}`,
        isTrusted: true,
        isBlocked: false,
      },
    });

    await tx.systemConfig.createMany({
      data: [
        {
          key: SYSTEM_CONFIG_KEYS.IS_CONFIGURED,
          value: 'true',
          description: 'System configuration status',
          isPublic: false,
        },
        {
          key: SYSTEM_CONFIG_KEYS.SETUP_COMPLETED_AT,
          value: new Date().toISOString(),
          description: 'Setup completion timestamp',
          isPublic: false,
        },
        {
          key: SYSTEM_CONFIG_KEYS.TEMPLATE_APPLIED,
          value: 'false',
          description: 'Whether a permission template has been applied',
          isPublic: false,
        },
        {
          key: SYSTEM_CONFIG_KEYS.COMPANY_NAME,
          value: data.companyName,
          description: 'Company name',
          isPublic: true,
        },
        {
          key: SYSTEM_CONFIG_KEYS.COMPANY_EMAIL,
          value: data.companyEmail || '',
          description: 'Company email',
          isPublic: true,
        },
        {
          key: SYSTEM_CONFIG_KEYS.COMPANY_PHONE,
          value: data.companyPhone || '',
          description: 'Company phone',
          isPublic: true,
        },
        {
          key: SYSTEM_CONFIG_KEYS.COMPANY_ADDRESS,
          value: data.companyAddress || '',
          description: 'Company address',
          isPublic: true,
        },
        {
          key: SYSTEM_CONFIG_KEYS.PRIMARY_ROLE_ID,
          value: primaryRole.id,
          description: 'Primary system role ID',
          isPublic: false,
        },
        {
          key: SYSTEM_CONFIG_KEYS.PRIMARY_ROLE_NAME,
          value: primaryRole.name,
          description: 'Primary system role name',
          isPublic: false,
        },
        {
          key: SYSTEM_CONFIG_KEYS.SYSTEM_VERSION,
          value: DEFAULT_SYSTEM_VERSION,
          description: 'System version',
          isPublic: true,
        },
      ],
    });

    // await createAuditLog({
    //   userId: adminUser.id,
    //   entity: 'System',
    //   entityId: 'SETUP',
    //   action: AuditAction.CREATE,
    //   details: {
    //     action: 'Initial system setup',
    //     companyName: data.companyName,
    //     primaryRoleName: primaryRole.name,
    //     timestamp: new Date().toISOString(),
    //   },
    // });

    const { accessToken, refreshToken } = generateTokenPair({
      userId: adminUser.id,
      userName: adminUser.email,
      roleId: primaryRole.id,
    });

    return {
      company: {
        name: data.companyName,
        email: data.companyEmail,
        phone: data.companyPhone,
        address: data.companyAddress,
      },
      role: {
        id: primaryRole.id,
        name: primaryRole.name,
        description: primaryRole.description,
      },
      user: {
        id: adminUser.id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        userName: adminUser.userName,
        email: adminUser.email,
        phone: adminUser.phone,
        role: primaryRole.name,
      },
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
      nextSteps: {
        message: 'Setup completed successfully! Now you can configure your permissions.',
        actions: [
          'Apply a permission template for quick setup',
          'Create custom permissions manually',
          'Configure roles and assign permissions',
        ],
      },
    };
  });
};