-- CreateTable
CREATE TABLE `routing_templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `routing_templates_is_default_idx`(`is_default`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `routing_template_steps` (
    `id` VARCHAR(191) NOT NULL,
    `template_id` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `role` ENUM('receiver', 'assignee', 'reviewer', 'approver', 'cc', 'observer') NOT NULL,

    INDEX `routing_template_steps_template_id_idx`(`template_id`),
    UNIQUE INDEX `routing_template_steps_template_id_order_key`(`template_id`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `routing_template_steps` ADD CONSTRAINT `routing_template_steps_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `routing_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
