export const SYSTEM_CONFIG_KEYS = {
  // Setup
  IS_CONFIGURED: 'system.is_configured',
  SETUP_COMPLETED_AT: 'system.setup_completed_at',
  TEMPLATE_APPLIED: 'system.template_applied',
  
  // Company
  COMPANY_NAME: 'company.name',
  COMPANY_EMAIL: 'company.email',
  COMPANY_PHONE:  'company.phone',
  COMPANY_ADDRESS: 'company.address',
  
  // Primary Role
  PRIMARY_ROLE_ID: 'system.primary_role_id',
  PRIMARY_ROLE_NAME: 'system.primary_role_name',
  
  // Version
  SYSTEM_VERSION: 'system.version',
} as const;

export type SystemConfigKey = typeof SYSTEM_CONFIG_KEYS[keyof typeof SYSTEM_CONFIG_KEYS];


export const DEFAULT_SYSTEM_VERSION = '1.0.0';


export const ROLE_NAME_PATTERN = /^[A-Z_]+$/;
export const MIN_ROLE_NAME_LENGTH = 2;
export const MAX_ROLE_NAME_LENGTH = 50;

export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_PATTERNS = {
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBER: /[0-9]/,
  SPECIAL: /[^A-Za-z0-9]/,
};