-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "translations_resourceType_resourceId_locale_idx" ON "translations"("resourceType", "resourceId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "translations_resourceType_resourceId_field_locale_key" ON "translations"("resourceType", "resourceId", "field", "locale");
