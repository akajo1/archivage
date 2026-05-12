/*
  Warnings:

  - A unique constraint covering the columns `[registration_number]` on the table `documents` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `documents` ADD COLUMN `document_type` VARCHAR(191) NULL,
    ADD COLUMN `receipt_date` DATETIME(3) NULL,
    ADD COLUMN `registration_number` VARCHAR(191) NULL,
    ADD COLUMN `sender_department` VARCHAR(191) NULL,
    ADD COLUMN `sender_name` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('draft', 'received', 'in_review', 'validated', 'archived', 'courrier_prepared', 'courrier_sent') NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE `role_feature_permissions` ADD COLUMN `can_create` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `department_id` VARCHAR(191) NULL,
    ADD COLUMN `must_change_password` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `password_reset_expiry` DATETIME(3) NULL,
    ADD COLUMN `password_reset_requested_at` DATETIME(3) NULL,
    ADD COLUMN `password_reset_token` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `chief_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `departments_name_key`(`name`),
    UNIQUE INDEX `departments_chief_id_key`(`chief_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mail_routings` (
    `id` VARCHAR(191) NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'in_review', 'forwarded', 'intervening', 'awaiting_verification', 'verified', 'rejected', 'returned', 'completed') NOT NULL DEFAULT 'pending',
    `initiated_by_id` VARCHAR(191) NOT NULL,
    `current_assignee_id` VARCHAR(191) NULL,
    `due_date` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `mail_routings_document_id_idx`(`document_id`),
    INDEX `mail_routings_status_idx`(`status`),
    INDEX `mail_routings_current_assignee_id_idx`(`current_assignee_id`),
    INDEX `mail_routings_due_date_idx`(`due_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mail_participants` (
    `id` VARCHAR(191) NOT NULL,
    `routing_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` ENUM('receiver', 'assignee', 'reviewer', 'approver', 'cc', 'observer') NOT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,

    INDEX `mail_participants_routing_id_idx`(`routing_id`),
    INDEX `mail_participants_user_id_idx`(`user_id`),
    UNIQUE INDEX `mail_participants_routing_id_user_id_role_key`(`routing_id`, `user_id`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mail_routing_actions` (
    `id` VARCHAR(191) NOT NULL,
    `routing_id` VARCHAR(191) NOT NULL,
    `actor_id` VARCHAR(191) NOT NULL,
    `actionType` ENUM('forward', 'add_cc', 'assign', 'comment', 'verify', 'reject', 'return_to_sender', 'mark_complete', 'archive') NOT NULL,
    `target_user_id` VARCHAR(191) NULL,
    `previous_status` ENUM('pending', 'in_review', 'forwarded', 'intervening', 'awaiting_verification', 'verified', 'rejected', 'returned', 'completed') NULL,
    `new_status` ENUM('pending', 'in_review', 'forwarded', 'intervening', 'awaiting_verification', 'verified', 'rejected', 'returned', 'completed') NULL,
    `note` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mail_routing_actions_routing_id_idx`(`routing_id`),
    INDEX `mail_routing_actions_actor_id_idx`(`actor_id`),
    INDEX `mail_routing_actions_actionType_idx`(`actionType`),
    INDEX `mail_routing_actions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mail_comments` (
    `id` VARCHAR(191) NOT NULL,
    `document_id` VARCHAR(191) NOT NULL,
    `routing_id` VARCHAR(191) NOT NULL,
    `author_id` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `parent_comment_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `mail_comments_document_id_idx`(`document_id`),
    INDEX `mail_comments_routing_id_idx`(`routing_id`),
    INDEX `mail_comments_author_id_idx`(`author_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mail_audit_trails` (
    `id` VARCHAR(191) NOT NULL,
    `routing_id` VARCHAR(191) NOT NULL,
    `actor_id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `previous_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mail_audit_trails_routing_id_idx`(`routing_id`),
    INDEX `mail_audit_trails_actor_id_idx`(`actor_id`),
    INDEX `mail_audit_trails_action_idx`(`action`),
    INDEX `mail_audit_trails_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NULL,
    `entity_id` VARCHAR(191) NULL,
    `entity_label` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `user_name` VARCHAR(191) NULL,
    `user_role` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_user_id_idx`(`user_id`),
    INDEX `activity_logs_action_idx`(`action`),
    INDEX `activity_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `documents_registration_number_key` ON `documents`(`registration_number`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_chief_id_fkey` FOREIGN KEY (`chief_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_routings` ADD CONSTRAINT `mail_routings_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_routings` ADD CONSTRAINT `mail_routings_initiated_by_id_fkey` FOREIGN KEY (`initiated_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_routings` ADD CONSTRAINT `mail_routings_current_assignee_id_fkey` FOREIGN KEY (`current_assignee_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_participants` ADD CONSTRAINT `mail_participants_routing_id_fkey` FOREIGN KEY (`routing_id`) REFERENCES `mail_routings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_participants` ADD CONSTRAINT `mail_participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_routing_actions` ADD CONSTRAINT `mail_routing_actions_routing_id_fkey` FOREIGN KEY (`routing_id`) REFERENCES `mail_routings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_routing_actions` ADD CONSTRAINT `mail_routing_actions_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_routing_actions` ADD CONSTRAINT `mail_routing_actions_target_user_id_fkey` FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_comments` ADD CONSTRAINT `mail_comments_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_comments` ADD CONSTRAINT `mail_comments_routing_id_fkey` FOREIGN KEY (`routing_id`) REFERENCES `mail_routings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_comments` ADD CONSTRAINT `mail_comments_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_comments` ADD CONSTRAINT `mail_comments_parent_comment_id_fkey` FOREIGN KEY (`parent_comment_id`) REFERENCES `mail_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_audit_trails` ADD CONSTRAINT `mail_audit_trails_routing_id_fkey` FOREIGN KEY (`routing_id`) REFERENCES `mail_routings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mail_audit_trails` ADD CONSTRAINT `mail_audit_trails_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
