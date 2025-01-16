-- CreateTable
CREATE TABLE `products` (
    `id_products` INTEGER NOT NULL AUTO_INCREMENT,
    `name_products` VARCHAR(255) NOT NULL,
    `brand` VARCHAR(255) NOT NULL,
    `stock` INTEGER NOT NULL,

    PRIMARY KEY (`id_products`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
