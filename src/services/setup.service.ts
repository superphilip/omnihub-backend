import prisma from '../database/prismaClient.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError.js';
import { generateTokenPair } from '../config/jwt.js';
import type { InitialSetupInput } from '../validators/setup.validator.js';
import { DEFAULT_SYSTEM_VERSION, SYSTEM_CONFIG_KEYS } from '../config/system.js';
import { TranslationService } from './translation.service.js';
import { translationConfig } from '../config/env.js';

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

const translator = new TranslationService(translationConfig);
const targetLangs = ['en']; // Agrega los idiomas destino aquí, ej: ['en', 'fr']

export const performInitialSetup = async (data: InitialSetupInput) => {
  const status = await checkSetupStatus();

  if (!status.needsSetup) throw new AppError('validation.system_already_configured', 400);

  return await prisma.$transaction(async (tx) => {
    // 1. Guarda el rol principal en español/original (NO la versión traducida)
    const primaryRole = await tx.role.create({
      data: {
        name: data.primaryRoleName ?? '',
        description: data.primaryRoleDescription ?? '',
        isSystemRole: true,
      },
    });

    // 2. Guarda el usuario admin en español/original
    const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

    const adminUser = await tx.user.create({
      data: {
        firstName: data.adminFirstName ?? '',
        lastName: data.adminLastName ?? '',
        idNumber: data.adminIdNumber ?? '',
        userName: data.adminUserName ?? '',
        email: data.adminEmail ?? '',
        password: hashedPassword,
        phone: data.adminPhone ?? '',
        address: data.companyAddress ?? data.companyName ?? '',
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

    // 3. Guarda datos de empresa, sistema, etc en SystemConfig
    await tx.systemConfig.createMany({
      data: [
        {
          key: SYSTEM_CONFIG_KEYS.IS_CONFIGURED,
          value: 'true',
          description: 'config.system_status',
          isPublic: false,
        },
        {
          key: SYSTEM_CONFIG_KEYS.SETUP_COMPLETED_AT,
          value: new Date().toISOString(),
          description: 'config.setup_completed_at',
          isPublic: false,
        },
        {
          key: SYSTEM_CONFIG_KEYS.TEMPLATE_APPLIED,
          value: 'false',
          description: 'config.template_applied',
          isPublic: false,
        },
        {
          key: SYSTEM_CONFIG_KEYS.COMPANY_NAME,
          value: data.companyName ?? '',
          description: 'config.company_name',
          isPublic: true,
        },
        {
          key: SYSTEM_CONFIG_KEYS.COMPANY_EMAIL,
          value: data.companyEmail ?? '',
          description: 'config.company_email',
          isPublic: true,
        },
        {
          key: SYSTEM_CONFIG_KEYS.COMPANY_PHONE,
          value: data.companyPhone ?? '',
          description: 'config.company_phone',
          isPublic: true,
        },
        {
          key: SYSTEM_CONFIG_KEYS.COMPANY_ADDRESS,
          value: data.companyAddress ?? '',
          description: 'config.company_address',
          isPublic: true,
        },
        {
          key: SYSTEM_CONFIG_KEYS.PRIMARY_ROLE_ID,
          value: primaryRole.id,
          description: 'config.primary_role_id',
          isPublic: false,
        },
        {
          key: SYSTEM_CONFIG_KEYS.PRIMARY_ROLE_NAME,
          value: data.primaryRoleName ?? '',
          description: 'config.primary_role_name',
          isPublic: false,
        },
        {
          key: SYSTEM_CONFIG_KEYS.SYSTEM_VERSION,
          value: DEFAULT_SYSTEM_VERSION,
          description: 'config.system_version',
          isPublic: true,
        },
      ],
    });

    // 4. Traducciones: rol principal, usuario admin, empresa, etc.
    for (const lang of targetLangs) {
      // Traducción rol principal
      await tx.translation.createMany({
        data: [
          {
            resourceType: 'roles',
            resourceId: primaryRole.id,
            field: 'name',
            locale: lang,
            text: await translator.translate(data.primaryRoleName ?? '', lang),
          },
          {
            resourceType: 'roles',
            resourceId: primaryRole.id,
            field: 'description',
            locale: lang,
            text: await translator.translate(data.primaryRoleDescription ?? '', lang),
          },
        ],
      });

      // Traducción usuario admin (puedes expandir campos)
      await tx.translation.createMany({
        data: [
          {
            resourceType: 'users',
            resourceId: adminUser.id,
            field: 'firstName',
            locale: lang,
            text: await translator.translate(data.adminFirstName ?? '', lang),          },
          {
            resourceType: 'users',
            resourceId: adminUser.id,
            field: 'lastName',
            locale: lang,
            text: await translator.translate(data.adminLastName ?? '', lang),
          },
          {
            resourceType: 'users',
            resourceId: adminUser.id,
            field: 'userName',
            locale: lang,
            text: await translator.translate(data.adminUserName ?? '', lang),
          },
        ],
      });
      // Traducción datos de empresa (systemConfig)
      await tx.translation.createMany({
        data: [
          {
            resourceType: 'systemConfig',
            resourceId: SYSTEM_CONFIG_KEYS.COMPANY_NAME,
            field: 'value',
            locale: lang,
            text: await translator.translate(data.companyName ?? '', lang),
          },
          {
            resourceType: 'systemConfig',
            resourceId: SYSTEM_CONFIG_KEYS.COMPANY_EMAIL,
            field: 'value',
            locale: lang,
            text: await translator.translate(data.companyEmail ?? '', lang),
          },
          {
            resourceType: 'systemConfig',
            resourceId: SYSTEM_CONFIG_KEYS.COMPANY_PHONE,
            field: 'value',
            locale: lang,
            text: await translator.translate(data.companyPhone ?? '', lang),
          },
          {
            resourceType: 'systemConfig',
            resourceId: SYSTEM_CONFIG_KEYS.COMPANY_ADDRESS,
            field: 'value',
            locale: lang,
            text: await translator.translate(data.companyAddress ?? '', lang),
          },
        ],
      });
    }

    const { accessToken, refreshToken } = generateTokenPair({
      userId: adminUser.id,
      userName: adminUser.email,
      roleId: primaryRole.id,
    });
    return {
      company: {
        name: data.companyName ?? '',
        email: data.companyEmail ?? '',
        phone: data.companyPhone ?? '',
        address: data.companyAddress ?? '',
      },
      role: {
        id: primaryRole.id,
        name: data.primaryRoleName ?? '',
        description: data.primaryRoleDescription ?? '',
      },
      user: {
        id: adminUser.id,
        firstName: data.adminFirstName ?? '',
        lastName: data.adminLastName ?? '',
        userName: data.adminUserName ?? '',
        email: data.adminEmail ?? '',
        phone: data.adminPhone ?? '',
        role: data.primaryRoleName ?? '',
      },
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,

      nextSteps: {
        message: 'config.setup_completed_message',
        actions: [
          'config.apply_permission_template',
          'config.create_custom_permissions',
          'config.configure_roles',
        ],
      },
    };
  });

};