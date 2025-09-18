-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'MODERATOR', 'UPLOADER');

-- CreateEnum
CREATE TYPE "OS" AS ENUM ('WINDOWS', 'MACOS', 'LINUX', 'ANDROID', 'IOS', 'OTHER');

-- CreateEnum
CREATE TYPE "Arch" AS ENUM ('X86', 'X64', 'ARM64', 'ARM', 'OTHER');

-- CreateEnum
CREATE TYPE "InstallerKind" AS ENUM ('EXE', 'MSI', 'DMG', 'PKG', 'APPIMAGE', 'DEB', 'RPM', 'ZIP', 'TAR', 'GZ', 'PORTABLE', 'OTHER');

-- CreateEnum
CREATE TYPE "VersionChannel" AS ENUM ('STABLE', 'BETA', 'ALPHA', 'LTS', 'OTHER');

-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('SUBMIT_SOFTWARE', 'SUBMIT_VERSION', 'REQUEST_UPDATE');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('QUEUED', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('QUEUED', 'SENT', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Software" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDesc" TEXT,
    "longDesc" TEXT,
    "category" TEXT,
    "website" TEXT,
    "license" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Software_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT NOT NULL,
    "softwareId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "channel" "VersionChannel" NOT NULL DEFAULT 'STABLE',
    "filename" TEXT,
    "sizeBytes" BIGINT,
    "sha256" TEXT,
    "notes" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diffJson" JSONB,
    "derivedFromVersionId" TEXT,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Build" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "os" "OS" NOT NULL,
    "arch" "Arch" NOT NULL,
    "kind" "InstallerKind" NOT NULL,
    "filename" TEXT,
    "sizeBytes" BIGINT,
    "sha256" TEXT,
    "portable" BOOLEAN NOT NULL DEFAULT false,
    "silentFlags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mirror" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL DEFAULT false,
    "httpStatus" INTEGER,
    "latencyMs" INTEGER,
    "lastChecked" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mirror_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "softwareId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "posterUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "softwareId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "softwareId" TEXT NOT NULL,
    "versionId" TEXT,
    "buildId" TEXT,
    "scope" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftwareTranslation" (
    "id" TEXT NOT NULL,
    "softwareId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT,
    "shortDesc" TEXT,
    "longDesc" TEXT,

    CONSTRAINT "SoftwareTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoMeta" (
    "id" TEXT NOT NULL,
    "softwareId" TEXT,
    "versionId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "canonical" TEXT,
    "ogImage" TEXT,
    "jsonLd" JSONB,
    "generated" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SeoMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "kind" "SubmissionKind" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'QUEUED',
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Software_slug_key" ON "Software"("slug");

-- CreateIndex
CREATE INDEX "Version_softwareId_version_idx" ON "Version"("softwareId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Version_softwareId_version_key" ON "Version"("softwareId", "version");

-- CreateIndex
CREATE INDEX "Build_versionId_idx" ON "Build"("versionId");

-- CreateIndex
CREATE INDEX "Mirror_buildId_idx" ON "Mirror"("buildId");

-- CreateIndex
CREATE UNIQUE INDEX "Mirror_buildId_url_key" ON "Mirror"("buildId", "url");

-- CreateIndex
CREATE INDEX "Media_softwareId_kind_idx" ON "Media"("softwareId", "kind");

-- CreateIndex
CREATE INDEX "Faq_softwareId_idx" ON "Faq"("softwareId");

-- CreateIndex
CREATE INDEX "Requirement_softwareId_idx" ON "Requirement"("softwareId");

-- CreateIndex
CREATE INDEX "Requirement_versionId_idx" ON "Requirement"("versionId");

-- CreateIndex
CREATE INDEX "Requirement_buildId_idx" ON "Requirement"("buildId");

-- CreateIndex
CREATE INDEX "SoftwareTranslation_softwareId_idx" ON "SoftwareTranslation"("softwareId");

-- CreateIndex
CREATE UNIQUE INDEX "SoftwareTranslation_softwareId_locale_key" ON "SoftwareTranslation"("softwareId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMeta_softwareId_key" ON "SeoMeta"("softwareId");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMeta_versionId_key" ON "SeoMeta"("versionId");

-- CreateIndex
CREATE INDEX "EditLog_entityType_entityId_idx" ON "EditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "EditLog_userId_idx" ON "EditLog"("userId");

-- CreateIndex
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_derivedFromVersionId_fkey" FOREIGN KEY ("derivedFromVersionId") REFERENCES "Version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "Software"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mirror" ADD CONSTRAINT "Mirror_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "Software"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "Software"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "Software"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "Build"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareTranslation" ADD CONSTRAINT "SoftwareTranslation_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "Software"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoMeta" ADD CONSTRAINT "SeoMeta_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "Software"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoMeta" ADD CONSTRAINT "SeoMeta_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditLog" ADD CONSTRAINT "EditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
