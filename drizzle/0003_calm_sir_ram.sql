CREATE TABLE `costCenters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('warehouse','kitchen','dining','bar') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `costCenters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `houseMadeProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`productId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`recipeJson` json,
	`yieldQuantity` decimal(10,3) NOT NULL,
	`yieldUnit` enum('g','kg','ml','l','un') NOT NULL,
	`costPrice` decimal(10,2),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `houseMadeProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`unit` enum('g','kg','ml','l','un') NOT NULL,
	`costPrice` decimal(10,2) NOT NULL,
	`salePrice` decimal(10,2),
	`supplier` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productIngredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`ingredientId` int NOT NULL,
	`quantity` decimal(10,3) NOT NULL,
	`unit` enum('g','kg','ml','l','un') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productIngredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouseInventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`costCenterId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` decimal(12,3) NOT NULL DEFAULT '0',
	`weight` decimal(12,3),
	`weightUnit` enum('g','kg','ml','l','un'),
	`lastMovedAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warehouseInventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouseMovements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`fromCostCenterId` int,
	`toCostCenterId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` decimal(12,3) NOT NULL,
	`movementType` enum('entry','exit','transfer','adjustment','waste') NOT NULL,
	`reason` text,
	`reference` varchar(100),
	`requestedBy` int,
	`approvedBy` int,
	`status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warehouseMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouseRequisitionItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requisitionId` int NOT NULL,
	`productId` int NOT NULL,
	`requestedQuantity` decimal(12,3) NOT NULL,
	`approvedQuantity` decimal(12,3),
	`deliveredQuantity` decimal(12,3),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warehouseRequisitionItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouseRequisitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`requisitionNumber` varchar(50) NOT NULL,
	`fromCostCenterId` int NOT NULL,
	`toCostCenterId` int NOT NULL,
	`requestedBy` int NOT NULL,
	`approvedBy` int,
	`status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
	`totalItems` int NOT NULL DEFAULT 0,
	`notes` text,
	`requestedAt` datetime NOT NULL,
	`approvedAt` datetime,
	`completedAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warehouseRequisitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `warehouseRequisitions_requisitionNumber_unique` UNIQUE(`requisitionNumber`)
);
--> statement-breakpoint
CREATE INDEX `costCenter_restaurant_idx` ON `costCenters` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `costCenter_code_idx` ON `costCenters` (`code`);--> statement-breakpoint
CREATE INDEX `houseMade_restaurant_idx` ON `houseMadeProducts` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `houseMade_code_idx` ON `houseMadeProducts` (`code`);--> statement-breakpoint
CREATE INDEX `ingredient_restaurant_idx` ON `ingredients` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `ingredient_code_idx` ON `ingredients` (`code`);--> statement-breakpoint
CREATE INDEX `prodIng_product_idx` ON `productIngredients` (`productId`);--> statement-breakpoint
CREATE INDEX `prodIng_ingredient_idx` ON `productIngredients` (`ingredientId`);--> statement-breakpoint
CREATE INDEX `warehouse_costCenter_idx` ON `warehouseInventory` (`costCenterId`);--> statement-breakpoint
CREATE INDEX `warehouse_product_idx` ON `warehouseInventory` (`productId`);--> statement-breakpoint
CREATE INDEX `movement_restaurant_idx` ON `warehouseMovements` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `movement_product_idx` ON `warehouseMovements` (`productId`);--> statement-breakpoint
CREATE INDEX `movement_status_idx` ON `warehouseMovements` (`status`);--> statement-breakpoint
CREATE INDEX `reqItem_requisition_idx` ON `warehouseRequisitionItems` (`requisitionId`);--> statement-breakpoint
CREATE INDEX `reqItem_product_idx` ON `warehouseRequisitionItems` (`productId`);--> statement-breakpoint
CREATE INDEX `requisition_restaurant_idx` ON `warehouseRequisitions` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `requisition_number_idx` ON `warehouseRequisitions` (`requisitionNumber`);--> statement-breakpoint
CREATE INDEX `requisition_status_idx` ON `warehouseRequisitions` (`status`);