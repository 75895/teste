ALTER TABLE `products` ADD `weight` decimal(10,3);--> statement-breakpoint
ALTER TABLE `products` ADD `weightUnit` enum('g','kg','ml','l','un') DEFAULT 'g';