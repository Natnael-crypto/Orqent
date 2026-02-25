-- CreateTable
CREATE TABLE "rest_tools" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "path" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'application/json',
    "headers" JSONB,
    "requestConfig" JSONB NOT NULL,
    "responseConfig" JSONB NOT NULL,
    "requiresConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rest_tools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rest_tools_integrationId_idx" ON "rest_tools"("integrationId");

-- AddForeignKey
ALTER TABLE "rest_tools" ADD CONSTRAINT "rest_tools_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
