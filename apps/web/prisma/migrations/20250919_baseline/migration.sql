-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Tag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoftwareCategory` (
    `softwareId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `SoftwareCategory_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`softwareId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vendor` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vendor_slug_key`(`slug`),
    INDEX `Vendor_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Software` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `license` VARCHAR(64) NULL,
    `homepage` VARCHAR(191) NULL,
    `version` VARCHAR(191) NULL,
    `vendor` VARCHAR(191) NULL,
    `fileSizeBytes` INTEGER NULL,
    `shortDesc` VARCHAR(191) NULL,
    `longDesc` LONGTEXT NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` VARCHAR(191) NULL,
    `os` JSON NULL,
    `iconUrl` VARCHAR(191) NULL,
    `heroUrl` VARCHAR(191) NULL,
    `featuredImage` VARCHAR(191) NULL,
    `ratingsAvg` DOUBLE NOT NULL DEFAULT 0,
    `ratingsCount` INTEGER NOT NULL DEFAULT 0,
    `isLatest` BOOLEAN NOT NULL DEFAULT false,
    `isUpdated` BOOLEAN NOT NULL DEFAULT false,
    `isRecommended` BOOLEAN NOT NULL DEFAULT false,
    `isNew` BOOLEAN NOT NULL DEFAULT false,
    `lastUpdatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `publishedAt` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `vendorId` VARCHAR(191) NULL,
    `faqs` JSON NULL,
    `systemRequirements` JSON NULL,

    UNIQUE INDEX `Software_slug_key`(`slug`),
    INDEX `Software_lastUpdatedAt_idx`(`lastUpdatedAt`),
    INDEX `Software_isLatest_isUpdated_isRecommended_isNew_idx`(`isLatest`, `isUpdated`, `isRecommended`, `isNew`),
    INDEX `Software_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Version` (
    `id` VARCHAR(191) NOT NULL,
    `softwareId` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `osLabel` VARCHAR(64) NULL,
    `license` VARCHAR(64) NULL,
    `changelog` MEDIUMTEXT NULL,
    `releasedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Version_softwareId_createdAt_idx`(`softwareId`, `createdAt`),
    INDEX `Version_releasedAt_idx`(`releasedAt`),
    UNIQUE INDEX `Version_softwareId_version_key`(`softwareId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Build` (
    `id` VARCHAR(191) NOT NULL,
    `versionId` VARCHAR(191) NOT NULL,
    `os` VARCHAR(32) NULL,
    `arch` VARCHAR(16) NULL,
    `buildType` ENUM('X86', 'X64', 'ARM64', 'Installer', 'Portable', 'Other') NULL,
    `sizeMB` INTEGER NULL,
    `fileSize` VARCHAR(32) NULL,
    `sha256` CHAR(64) NULL,
    `downloadUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Build_versionId_idx`(`versionId`),
    INDEX `Build_os_arch_idx`(`os`, `arch`),
    INDEX `Build_buildType_idx`(`buildType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mirror` (
    `id` VARCHAR(191) NOT NULL,
    `buildId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(64) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 100,

    INDEX `Mirror_buildId_priority_idx`(`buildId`, `priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoftwareMedia` (
    `id` VARCHAR(191) NOT NULL,
    `softwareId` VARCHAR(191) NOT NULL,
    `type` ENUM('ICON', 'HERO', 'GALLERY', 'SCREENSHOT', 'VIDEO') NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `meta` JSON NULL,

    INDEX `SoftwareMedia_softwareId_type_order_idx`(`softwareId`, `type`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `softwareId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'SPAM', 'DELETED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Comment_softwareId_status_createdAt_idx`(`softwareId`, `status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `softwareId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `body` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Review_softwareId_rating_idx`(`softwareId`, `rating`),
    UNIQUE INDEX `Review_softwareId_userId_key`(`softwareId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'MODERATOR', 'UPLOADER', 'USER') NOT NULL DEFAULT 'USER',
    `avatarUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_username_key`(`username`),
    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Page` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Page_slug_key`(`slug`),
    INDEX `Page_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `key` VARCHAR(191) NOT NULL,
    `json` JSON NULL,
    `text` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DownloadLog` (
    `id` VARCHAR(191) NOT NULL,
    `softwareId` VARCHAR(191) NOT NULL,
    `versionId` VARCHAR(191) NULL,
    `buildId` VARCHAR(191) NULL,
    `ip` VARCHAR(45) NULL,
    `ua` VARCHAR(191) NULL,
    `referer` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DownloadLog_softwareId_createdAt_idx`(`softwareId`, `createdAt`),
    INDEX `DownloadLog_versionId_idx`(`versionId`),
    INDEX `DownloadLog_buildId_idx`(`buildId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DownloadCounter` (
    `softwareId` VARCHAR(191) NOT NULL,
    `total` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DownloadCounter_total_idx`(`total` DESC),
    PRIMARY KEY (`softwareId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DownloadCounter30d` (
    `softwareId` VARCHAR(191) NOT NULL,
    `total30d` INTEGER NOT NULL DEFAULT 0,
    `computedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DownloadCounter30d_total30d_idx`(`total30d` DESC),
    PRIMARY KEY (`softwareId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DownloadCounterDaily` (
    `softwareId` VARCHAR(191) NOT NULL,
    `day` DATETIME(3) NOT NULL,
    `total` INTEGER NOT NULL DEFAULT 0,

    INDEX `DownloadCounterDaily_day_total_idx`(`day`, `total` DESC),
    PRIMARY KEY (`softwareId`, `day`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DownloadCounterWeekly` (
    `softwareId` VARCHAR(191) NOT NULL,
    `weekStart` DATETIME(3) NOT NULL,
    `total` INTEGER NOT NULL DEFAULT 0,

    INDEX `DownloadCounterWeekly_weekStart_total_idx`(`weekStart`, `total` DESC),
    PRIMARY KEY (`softwareId`, `weekStart`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SoftwareTags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_SoftwareTags_AB_unique`(`A`, `B`),
    INDEX `_SoftwareTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoftwareCategory` ADD CONSTRAINT `SoftwareCategory_softwareId_fkey` FOREIGN KEY (`softwareId`) REFERENCES `Software`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoftwareCategory` ADD CONSTRAINT `SoftwareCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Software` ADD CONSTRAINT `Software_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Version` ADD CONSTRAINT `Version_softwareId_fkey` FOREIGN KEY (`softwareId`) REFERENCES `Software`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Build` ADD CONSTRAINT `Build_versionId_fkey` FOREIGN KEY (`versionId`) REFERENCES `Version`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mirror` ADD CONSTRAINT `Mirror_buildId_fkey` FOREIGN KEY (`buildId`) REFERENCES `Build`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoftwareMedia` ADD CONSTRAINT `SoftwareMedia_softwareId_fkey` FOREIGN KEY (`softwareId`) REFERENCES `Software`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_softwareId_fkey` FOREIGN KEY (`softwareId`) REFERENCES `Software`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_softwareId_fkey` FOREIGN KEY (`softwareId`) REFERENCES `Software`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownloadLog` ADD CONSTRAINT `DownloadLog_softwareId_fkey` FOREIGN KEY (`softwareId`) REFERENCES `Software`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownloadLog` ADD CONSTRAINT `DownloadLog_versionId_fkey` FOREIGN KEY (`versionId`) REFERENCES `Version`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownloadLog` ADD CONSTRAINT `DownloadLog_buildId_fkey` FOREIGN KEY (`buildId`) REFERENCES `Build`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownloadCounter` ADD CONSTRAINT `DownloadCounter_softwareId_fkey` FOREIGN KEY (`softwareId`) REFERENCES `Software`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownloadCounter30d` ADD CONSTRAINT `DownloadCounter30d_softwareId_fkey` FOREIGN KEY (`softwareId`) REFERENCES `Software`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownloadCounterDaily` ADD CONSTRAINT `DownloadCounterDaily_softwareId_fkey` FOREIGN KEY (`softwareId`) REFERENCES `Software`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DownloadCounterWeekly` ADD CONSTRAINT `DownloadCounterWeekly_softwareId_fkey` FOREIGN KEY (`softwareId`) REFERENCES `Software`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SoftwareTags` ADD CONSTRAINT `_SoftwareTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `Software`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SoftwareTags` ADD CONSTRAINT `_SoftwareTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

