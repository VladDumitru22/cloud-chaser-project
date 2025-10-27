CREATE DATABASE IF NOT EXISTS `cloud_chaser_db`;

USE `cloud_chaser_db`;

CREATE TABLE `users` (
  `id_user` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('CLIENT', 'OPERATIVE', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
  `phone_number` VARCHAR(20) NULL,
  `address` VARCHAR(200) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`)
);

CREATE TABLE `components` (
  `id_component` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `component_type` VARCHAR(50) NOT NULL,
  `unit_cost` DECIMAL(19,4) NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id_component`)
);

CREATE TABLE `products` (
  `id_product` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `monthly_price` DECIMAL(19,4) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (`id_product`)
);

CREATE TABLE `products_components` (
  `id_product` BIGINT UNSIGNED NOT NULL,
  `id_component` BIGINT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_product`, `id_component`)
);

CREATE TABLE `subscriptions` (
  `id_subscription` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_user` BIGINT UNSIGNED NOT NULL,
  `id_product` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('Active', 'Cancelled', 'Expired') NOT NULL DEFAULT 'Active',
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  PRIMARY KEY (`id_subscription`)
);

CREATE TABLE `campaigns` (
  `id_campaign` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_subscription` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `status` ENUM('Pending', 'Active', 'Completed', 'On Hold') NOT NULL DEFAULT 'Pending',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  PRIMARY KEY (`id_campaign`),
  CONSTRAINT `chk_campaign_dates` CHECK (`start_date` <= `end_date`)
);

ALTER TABLE `products_components`
ADD CONSTRAINT `fk_products_components_products`
  FOREIGN KEY (`id_product`) REFERENCES `products`(`id_product`)
  ON DELETE CASCADE;

ALTER TABLE `products_components`
ADD CONSTRAINT `fk_products_components_component`
  FOREIGN KEY (`id_component`) REFERENCES `components`(`id_component`)
  ON DELETE CASCADE;

ALTER TABLE `subscriptions`
ADD CONSTRAINT `fk_subscription_user`
  FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`)
  ON DELETE CASCADE;

ALTER TABLE `subscriptions`
ADD CONSTRAINT `fk_subscription_products`
  FOREIGN KEY (`id_product`) REFERENCES `products`(`id_product`)
  ON DELETE RESTRICT;

ALTER TABLE `campaigns`
ADD CONSTRAINT `fk_campaign_subscription`
  FOREIGN KEY (`id_subscription`) REFERENCES `subscriptions`(`id_subscription`)
  ON DELETE CASCADE;