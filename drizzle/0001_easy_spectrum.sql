CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entity` varchar(100) NOT NULL,
	`entityId` int,
	`oldValues` json,
	`newValues` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashRegisters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`userId` int NOT NULL,
	`openTime` datetime NOT NULL,
	`closeTime` datetime,
	`initialAmount` decimal(10,2) NOT NULL,
	`finalAmount` decimal(10,2),
	`totalSales` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalCash` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalCard` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalPix` decimal(10,2) NOT NULL DEFAULT '0.00',
	`totalCredit` decimal(10,2) NOT NULL DEFAULT '0.00',
	`status` enum('open','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cashRegisters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`cpf` varchar(20),
	`phone` varchar(20),
	`email` varchar(320),
	`address` text,
	`city` varchar(100),
	`state` varchar(2),
	`zipCode` varchar(10),
	`loyaltyPoints` int NOT NULL DEFAULT 0,
	`creditBalance` decimal(10,2) NOT NULL DEFAULT '0.00',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fiscalDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`orderId` int NOT NULL,
	`documentType` enum('nfce','sat','cupom') NOT NULL,
	`documentNumber` varchar(50) NOT NULL,
	`series` varchar(10),
	`xmlContent` text,
	`status` enum('pending','issued','cancelled') NOT NULL DEFAULT 'pending',
	`issuedAt` datetime,
	`cancelledAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fiscalDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ifoodIntegrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`ifoodRestaurantId` varchar(100) NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`tokenExpiresAt` datetime,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ifoodIntegrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `ifoodIntegrations_ifoodRestaurantId_unique` UNIQUE(`ifoodRestaurantId`)
);
--> statement-breakpoint
CREATE TABLE `inventoryMovements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`type` enum('in','out','adjust','return') NOT NULL,
	`reason` varchar(255),
	`reference` varchar(100),
	`userId` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventoryMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`discount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`notes` text,
	`status` enum('pending','preparing','ready','served','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`tableId` int,
	`customerId` int,
	`orderNumber` varchar(50) NOT NULL,
	`status` enum('pending','confirmed','preparing','ready','served','completed','cancelled') NOT NULL DEFAULT 'pending',
	`type` enum('dine_in','takeout','delivery','ifood') NOT NULL DEFAULT 'dine_in',
	`subtotal` decimal(10,2) NOT NULL,
	`discount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`tax` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total` decimal(10,2) NOT NULL,
	`paymentStatus` enum('pending','partial','paid','refunded') NOT NULL DEFAULT 'pending',
	`notes` text,
	`waiterId` int,
	`ifoodOrderId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`cashRegisterId` int,
	`method` enum('cash','card','pix','credit','voucher') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('pending','approved','declined','refunded') NOT NULL DEFAULT 'pending',
	`reference` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`sku` varchar(100) NOT NULL,
	`ean` varchar(20),
	`name` varchar(255) NOT NULL,
	`description` text,
	`categoryId` int,
	`unit` enum('UN','KG','L','M') NOT NULL DEFAULT 'UN',
	`costPrice` decimal(10,2) NOT NULL,
	`salePrice` decimal(10,2) NOT NULL,
	`stockMin` int NOT NULL DEFAULT 0,
	`stockQty` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`image` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('percentage','fixed','bogo') NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`applicableTo` enum('product','category','order') NOT NULL,
	`targetId` int,
	`startDate` datetime NOT NULL,
	`endDate` datetime NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseOrderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseOrderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchaseOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`supplierId` int NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`status` enum('pending','confirmed','received','cancelled') NOT NULL DEFAULT 'pending',
	`total` decimal(10,2) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`receivedAt` timestamp,
	CONSTRAINT `purchaseOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`phone` varchar(20),
	`email` varchar(320),
	`address` text,
	`city` varchar(100),
	`state` varchar(2),
	`zipCode` varchar(10),
	`ownerId` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`),
	CONSTRAINT `restaurants_cnpj_unique` UNIQUE(`cnpj`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`phone` varchar(20),
	`email` varchar(320),
	`address` text,
	`city` varchar(100),
	`state` varchar(2),
	`zipCode` varchar(10),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`tableNumber` varchar(50) NOT NULL,
	`capacity` int NOT NULL,
	`status` enum('available','occupied','reserved','cleaning') NOT NULL DEFAULT 'available',
	`currentOrderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','manager','cashier','waiter','kitchen') NOT NULL DEFAULT 'waiter';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `restaurantId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX `auditLog_restaurant_idx` ON `auditLogs` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `auditLog_user_idx` ON `auditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `auditLog_action_idx` ON `auditLogs` (`action`);--> statement-breakpoint
CREATE INDEX `cashRegister_restaurant_idx` ON `cashRegisters` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `cashRegister_user_idx` ON `cashRegisters` (`userId`);--> statement-breakpoint
CREATE INDEX `cashRegister_status_idx` ON `cashRegisters` (`status`);--> statement-breakpoint
CREATE INDEX `customer_restaurant_idx` ON `customers` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `customer_cpf_idx` ON `customers` (`cpf`);--> statement-breakpoint
CREATE INDEX `fiscal_restaurant_idx` ON `fiscalDocuments` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `fiscal_order_idx` ON `fiscalDocuments` (`orderId`);--> statement-breakpoint
CREATE INDEX `fiscal_status_idx` ON `fiscalDocuments` (`status`);--> statement-breakpoint
CREATE INDEX `ifood_restaurant_idx` ON `ifoodIntegrations` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `inventory_restaurant_idx` ON `inventoryMovements` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `inventory_product_idx` ON `inventoryMovements` (`productId`);--> statement-breakpoint
CREATE INDEX `inventory_type_idx` ON `inventoryMovements` (`type`);--> statement-breakpoint
CREATE INDEX `orderItem_order_idx` ON `orderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `orderItem_product_idx` ON `orderItems` (`productId`);--> statement-breakpoint
CREATE INDEX `order_restaurant_idx` ON `orders` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `order_table_idx` ON `orders` (`tableId`);--> statement-breakpoint
CREATE INDEX `order_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `order_ifood_idx` ON `orders` (`ifoodOrderId`);--> statement-breakpoint
CREATE INDEX `payment_order_idx` ON `payments` (`orderId`);--> statement-breakpoint
CREATE INDEX `payment_method_idx` ON `payments` (`method`);--> statement-breakpoint
CREATE INDEX `category_restaurant_idx` ON `productCategories` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `product_restaurant_idx` ON `products` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `product_category_idx` ON `products` (`categoryId`);--> statement-breakpoint
CREATE INDEX `product_sku_idx` ON `products` (`sku`);--> statement-breakpoint
CREATE INDEX `promotion_restaurant_idx` ON `promotions` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `promotion_active_idx` ON `promotions` (`isActive`);--> statement-breakpoint
CREATE INDEX `purchaseOrderItem_po_idx` ON `purchaseOrderItems` (`purchaseOrderId`);--> statement-breakpoint
CREATE INDEX `purchaseOrderItem_product_idx` ON `purchaseOrderItems` (`productId`);--> statement-breakpoint
CREATE INDEX `purchaseOrder_restaurant_idx` ON `purchaseOrders` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `purchaseOrder_supplier_idx` ON `purchaseOrders` (`supplierId`);--> statement-breakpoint
CREATE INDEX `purchaseOrder_status_idx` ON `purchaseOrders` (`status`);--> statement-breakpoint
CREATE INDEX `supplier_restaurant_idx` ON `suppliers` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `table_restaurant_idx` ON `tables` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `table_status_idx` ON `tables` (`status`);--> statement-breakpoint
CREATE INDEX `restaurant_idx` ON `users` (`restaurantId`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);