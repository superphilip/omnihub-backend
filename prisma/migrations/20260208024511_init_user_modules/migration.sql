-- CreateEnum
CREATE TYPE "ClientLevel" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTION_REQUIRED', 'ACTIVE', 'BLOCKED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'REFINANCED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'PAID_FULL', 'PAID_PARTIAL', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CashRegisterStatus" AS ENUM ('OPEN', 'CLOSED', 'BALANCED', 'UNBALANCED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "InvestorMovementType" AS ENUM ('CAPITAL_CONTRIBUTION', 'CAPITAL_WITHDRAWAL', 'PROFIT_WITHDRAWAL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'RESTORE');

-- CreateEnum
CREATE TYPE "CollectionResult" AS ENUM ('PAYMENT_PROMISE', 'NO_CONTACT', 'REFUSAL', 'CLIENT_ILLNESS', 'ALREADY_PAID');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PUSH', 'WHATSAPP', 'SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('IN_PROGRESS', 'ACHIEVED', 'FAILED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('REQUESTED', 'DELIVERED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'RELEASED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_FRONT', 'ID_BACK', 'UTILITY_BILL', 'PROOFOF_INCOME', 'SELFIE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RE_UPLOAD_REQUIRED');

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "idNumber" TEXT,
    "birthDate" TIMESTAMP(3),
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "bankAccount" TEXT,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "creditScore" INTEGER NOT NULL DEFAULT 500,
    "clientLevel" "ClientLevel" NOT NULL DEFAULT 'BRONZE',
    "accruedPoints" INTEGER NOT NULL DEFAULT 0,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "roleId" TEXT NOT NULL,
    "mainRouteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "amountRequested" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "pendingBalance" DOUBLE PRECISION NOT NULL,
    "paymentFrequency" "PaymentFrequency" NOT NULL DEFAULT 'DAILY',
    "termDays" INTEGER NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "productId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "routeId" TEXT,
    "previousLoanId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_limits" (
    "id" TEXT NOT NULL,
    "loanProductId" TEXT,
    "clientId" TEXT,
    "maxAmount" DOUBLE PRECISION,
    "minAmount" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultInterest" DOUBLE PRECISION NOT NULL,
    "defaultFrequency" "PaymentFrequency" NOT NULL,
    "allowedTermsDays" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installments" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "expectedAmount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lateFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "loanId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_registers" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "openingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closingDate" TIMESTAMP(3),
    "initialAmount" DOUBLE PRECISION NOT NULL,
    "finalAmount" DOUBLE PRECISION,
    "calculatedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "CashRegisterStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "cash_registers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_movements" (
    "id" TEXT NOT NULL,
    "cashRegisterId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "MovementType" NOT NULL,
    "concept" TEXT NOT NULL,
    "loanId" TEXT,
    "expenseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "investedCapital" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sharePercentage" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "investors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_movements" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "InvestorMovementType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investor_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "cashRegisterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_logs" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "result" "CollectionResult" NOT NULL,
    "observation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "adminResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_redemptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prizeId" TEXT NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prize_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prizes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pointCost" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_bonuses" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "referral_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "references" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isCoSigner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "zone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_routes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "roleInRoute" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    "assignedBy" TEXT,

    CONSTRAINT "user_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceModel" TEXT,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "amlRiskScore" INTEGER NOT NULL DEFAULT 0,
    "lastReviewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "riskFlags" JSONB,
    "requiresManualApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_documents" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "confidenceScore" DOUBLE PRECISION DEFAULT 0,
    "userId" TEXT NOT NULL,
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "changeDetails" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "grantedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("userId","permissionId")
);

-- CreateTable
CREATE TABLE "route_permission_maps" (
    "id" TEXT NOT NULL,
    "routeKey" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "routeDescription" TEXT,
    "category" TEXT NOT NULL,
    "httpMethod" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "requiresAuth" BOOLEAN NOT NULL DEFAULT true,
    "onlyPrimaryRole" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_permission_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_permissions" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collateral" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'IN_CUSTODY',

    CONSTRAINT "Collateral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_insights" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "insightType" TEXT NOT NULL,
    "subType" TEXT,
    "value" DOUBLE PRECISION,
    "label" TEXT,
    "recommendedId" TEXT,
    "recommendedType" TEXT,
    "message" TEXT,
    "details" JSONB,
    "modelName" TEXT,
    "score" DOUBLE PRECISION,
    "origin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE INDEX "system_config_key_idx" ON "system_config"("key");

-- CreateIndex
CREATE INDEX "system_config_isPublic_idx" ON "system_config"("isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "users_idNumber_key" ON "users"("idNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_userName_key" ON "users"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_idNumber_idx" ON "users"("idNumber");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "loans_previousLoanId_key" ON "loans"("previousLoanId");

-- CreateIndex
CREATE INDEX "loans_clientId_idx" ON "loans"("clientId");

-- CreateIndex
CREATE INDEX "loans_routeId_idx" ON "loans"("routeId");

-- CreateIndex
CREATE INDEX "loan_limits_loanProductId_clientId_idx" ON "loan_limits"("loanProductId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "loan_products_name_key" ON "loan_products"("name");

-- CreateIndex
CREATE INDEX "installments_dueDate_idx" ON "installments"("dueDate");

-- CreateIndex
CREATE INDEX "cash_registers_routeId_idx" ON "cash_registers"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_name_key" ON "expense_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_date_key" ON "holidays"("date");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "roles_name_idx" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_slug_key" ON "permissions"("slug");

-- CreateIndex
CREATE INDEX "permissions_slug_idx" ON "permissions"("slug");

-- CreateIndex
CREATE INDEX "permissions_category_idx" ON "permissions"("category");

-- CreateIndex
CREATE UNIQUE INDEX "routes_name_key" ON "routes"("name");

-- CreateIndex
CREATE INDEX "routes_name_idx" ON "routes"("name");

-- CreateIndex
CREATE INDEX "routes_zone_idx" ON "routes"("zone");

-- CreateIndex
CREATE INDEX "routes_isActive_idx" ON "routes"("isActive");

-- CreateIndex
CREATE INDEX "user_routes_userId_idx" ON "user_routes"("userId");

-- CreateIndex
CREATE INDEX "user_routes_routeId_idx" ON "user_routes"("routeId");

-- CreateIndex
CREATE INDEX "user_routes_isActive_idx" ON "user_routes"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "user_routes_userId_routeId_key" ON "user_routes"("userId", "routeId");

-- CreateIndex
CREATE UNIQUE INDEX "devices_deviceId_key" ON "devices"("deviceId");

-- CreateIndex
CREATE INDEX "devices_userId_idx" ON "devices"("userId");

-- CreateIndex
CREATE INDEX "devices_deviceId_idx" ON "devices"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_checks_userId_key" ON "compliance_checks"("userId");

-- CreateIndex
CREATE INDEX "compliance_checks_userId_idx" ON "compliance_checks"("userId");

-- CreateIndex
CREATE INDEX "compliance_checks_status_idx" ON "compliance_checks"("status");

-- CreateIndex
CREATE INDEX "compliance_checks_amlRiskScore_idx" ON "compliance_checks"("amlRiskScore");

-- CreateIndex
CREATE INDEX "user_documents_userId_idx" ON "user_documents"("userId");

-- CreateIndex
CREATE INDEX "user_documents_status_idx" ON "user_documents"("status");

-- CreateIndex
CREATE INDEX "user_documents_type_idx" ON "user_documents"("type");

-- CreateIndex
CREATE INDEX "user_documents_id_idx" ON "user_documents"("id");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "location_records_userId_idx" ON "location_records"("userId");

-- CreateIndex
CREATE INDEX "location_records_timestamp_idx" ON "location_records"("timestamp");

-- CreateIndex
CREATE INDEX "location_records_userId_timestamp_idx" ON "location_records"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "role_permissions_roleId_idx" ON "role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "role_permissions"("permissionId");

-- CreateIndex
CREATE INDEX "user_permissions_userId_idx" ON "user_permissions"("userId");

-- CreateIndex
CREATE INDEX "user_permissions_permissionId_idx" ON "user_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "route_permission_maps_routeKey_key" ON "route_permission_maps"("routeKey");

-- CreateIndex
CREATE INDEX "route_permission_maps_routeKey_idx" ON "route_permission_maps"("routeKey");

-- CreateIndex
CREATE INDEX "route_permission_maps_category_idx" ON "route_permission_maps"("category");

-- CreateIndex
CREATE INDEX "route_permission_maps_httpMethod_idx" ON "route_permission_maps"("httpMethod");

-- CreateIndex
CREATE INDEX "route_permission_maps_onlyPrimaryRole_idx" ON "route_permission_maps"("onlyPrimaryRole");

-- CreateIndex
CREATE INDEX "route_permissions_routeId_idx" ON "route_permissions"("routeId");

-- CreateIndex
CREATE INDEX "route_permissions_permissionId_idx" ON "route_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "route_permissions_routeId_permissionId_key" ON "route_permissions"("routeId", "permissionId");

-- CreateIndex
CREATE INDEX "ai_insights_entityType_entityId_insightType_subType_idx" ON "ai_insights"("entityType", "entityId", "insightType", "subType");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_mainRouteId_fkey" FOREIGN KEY ("mainRouteId") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_productId_fkey" FOREIGN KEY ("productId") REFERENCES "loan_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_previousLoanId_fkey" FOREIGN KEY ("previousLoanId") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_limits" ADD CONSTRAINT "loan_limits_loanProductId_fkey" FOREIGN KEY ("loanProductId") REFERENCES "loan_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_limits" ADD CONSTRAINT "loan_limits_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_registers" ADD CONSTRAINT "cash_registers_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "cash_registers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_movements" ADD CONSTRAINT "investor_movements_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES "cash_registers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_logs" ADD CONSTRAINT "collection_logs_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_logs" ADD CONSTRAINT "collection_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_redemptions" ADD CONSTRAINT "prize_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_redemptions" ADD CONSTRAINT "prize_redemptions_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_bonuses" ADD CONSTRAINT "referral_bonuses_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_bonuses" ADD CONSTRAINT "referral_bonuses_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "references" ADD CONSTRAINT "references_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_routes" ADD CONSTRAINT "user_routes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_routes" ADD CONSTRAINT "user_routes_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_records" ADD CONSTRAINT "location_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_permissions" ADD CONSTRAINT "route_permissions_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "route_permission_maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_permissions" ADD CONSTRAINT "route_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collateral" ADD CONSTRAINT "Collateral_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
