import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  datetime,
  json,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with restaurant-specific roles and permissions.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 20 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["admin", "manager", "cashier", "waiter", "kitchen"]).default("waiter").notNull(),
    restaurantId: int("restaurantId"),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("restaurant_idx").on(table.restaurantId),
    roleIdx: index("role_idx").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Restaurant/Establishment table for multi-tenant support
 */
export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }).unique(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  ownerId: int("ownerId").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;

/**
 * Product/Menu Item table
 */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    ean: varchar("ean", { length: 20 }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    categoryId: int("categoryId"),
    unit: mysqlEnum("unit", ["UN", "KG", "L", "M"]).default("UN").notNull(),
    costPrice: decimal("costPrice", { precision: 10, scale: 2 }).notNull(),
    salePrice: decimal("salePrice", { precision: 10, scale: 2 }).notNull(),
    stockMin: int("stockMin").default(0).notNull(),
    stockQty: int("stockQty").default(0).notNull(),
    // Ficha Técnica - Gramatura/Medida
    weight: decimal("weight", { precision: 10, scale: 3 }),
    weightUnit: mysqlEnum("weightUnit", ["g", "kg", "ml", "l", "un"]).default("g"),
    isActive: boolean("isActive").default(true).notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("product_restaurant_idx").on(table.restaurantId),
    categoryIdx: index("product_category_idx").on(table.categoryId),
    skuIdx: index("product_sku_idx").on(table.sku),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product Category table
 */
export const productCategories = mysqlTable(
  "productCategories",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("category_restaurant_idx").on(table.restaurantId),
  })
);

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = typeof productCategories.$inferInsert;

/**
 * Table/Mesa for restaurant seating
 */
export const tables = mysqlTable(
  "tables",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    tableNumber: varchar("tableNumber", { length: 50 }).notNull(),
    capacity: int("capacity").notNull(),
    status: mysqlEnum("status", ["available", "occupied", "reserved", "cleaning"]).default("available").notNull(),
    currentOrderId: int("currentOrderId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("table_restaurant_idx").on(table.restaurantId),
    statusIdx: index("table_status_idx").on(table.status),
  })
);

export type Table = typeof tables.$inferSelect;
export type InsertTable = typeof tables.$inferInsert;

/**
 * Order/Pedido table
 */
export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    tableId: int("tableId"),
    customerId: int("customerId"),
    orderNumber: varchar("orderNumber", { length: 50 }).notNull(),
    status: mysqlEnum("status", ["pending", "confirmed", "preparing", "ready", "served", "completed", "cancelled"]).default("pending").notNull(),
    type: mysqlEnum("type", ["dine_in", "takeout", "delivery", "ifood"]).default("dine_in").notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    tax: decimal("tax", { precision: 10, scale: 2 }).default("0.00").notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: mysqlEnum("paymentStatus", ["pending", "partial", "paid", "refunded"]).default("pending").notNull(),
    notes: text("notes"),
    waiterId: int("waiterId"),
    ifoodOrderId: varchar("ifoodOrderId", { length: 100 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  (table) => ({
    restaurantIdx: index("order_restaurant_idx").on(table.restaurantId),
    tableIdx: index("order_table_idx").on(table.tableId),
    statusIdx: index("order_status_idx").on(table.status),
    ifoodIdx: index("order_ifood_idx").on(table.ifoodOrderId),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order Item/Pedido Item table
 */
export const orderItems = mysqlTable(
  "orderItems",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    notes: text("notes"),
    status: mysqlEnum("status", ["pending", "preparing", "ready", "served", "cancelled"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    orderIdx: index("orderItem_order_idx").on(table.orderId),
    productIdx: index("orderItem_product_idx").on(table.productId),
  })
);

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Customer/Cliente table
 */
export const customers = mysqlTable(
  "customers",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    cpf: varchar("cpf", { length: 20 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 320 }),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zipCode", { length: 10 }),
    loyaltyPoints: int("loyaltyPoints").default(0).notNull(),
    creditBalance: decimal("creditBalance", { precision: 10, scale: 2 }).default("0.00").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("customer_restaurant_idx").on(table.restaurantId),
    cpfIdx: index("customer_cpf_idx").on(table.cpf),
  })
);

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Cash Register/Caixa table
 */
export const cashRegisters = mysqlTable(
  "cashRegisters",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    userId: int("userId").notNull(),
    openTime: datetime("openTime").notNull(),
    closeTime: datetime("closeTime"),
    initialAmount: decimal("initialAmount", { precision: 10, scale: 2 }).notNull(),
    finalAmount: decimal("finalAmount", { precision: 10, scale: 2 }),
    totalSales: decimal("totalSales", { precision: 10, scale: 2 }).default("0.00").notNull(),
    totalCash: decimal("totalCash", { precision: 10, scale: 2 }).default("0.00").notNull(),
    totalCard: decimal("totalCard", { precision: 10, scale: 2 }).default("0.00").notNull(),
    totalPix: decimal("totalPix", { precision: 10, scale: 2 }).default("0.00").notNull(),
    totalCredit: decimal("totalCredit", { precision: 10, scale: 2 }).default("0.00").notNull(),
    status: mysqlEnum("status", ["open", "closed"]).default("open").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("cashRegister_restaurant_idx").on(table.restaurantId),
    userIdx: index("cashRegister_user_idx").on(table.userId),
    statusIdx: index("cashRegister_status_idx").on(table.status),
  })
);

export type CashRegister = typeof cashRegisters.$inferSelect;
export type InsertCashRegister = typeof cashRegisters.$inferInsert;

/**
 * Payment/Pagamento table
 */
export const payments = mysqlTable(
  "payments",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    cashRegisterId: int("cashRegisterId"),
    method: mysqlEnum("method", ["cash", "card", "pix", "credit", "voucher"]).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["pending", "approved", "declined", "refunded"]).default("pending").notNull(),
    reference: varchar("reference", { length: 100 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    orderIdx: index("payment_order_idx").on(table.orderId),
    methodIdx: index("payment_method_idx").on(table.method),
  })
);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Inventory Movement/Movimentação de Estoque table
 */
export const inventoryMovements = mysqlTable(
  "inventoryMovements",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").notNull(),
    type: mysqlEnum("type", ["in", "out", "adjust", "return"]).notNull(),
    reason: varchar("reason", { length: 255 }),
    reference: varchar("reference", { length: 100 }),
    userId: int("userId").notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("inventory_restaurant_idx").on(table.restaurantId),
    productIdx: index("inventory_product_idx").on(table.productId),
    typeIdx: index("inventory_type_idx").on(table.type),
  })
);

export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = typeof inventoryMovements.$inferInsert;

/**
 * Supplier/Fornecedor table
 */
export const suppliers = mysqlTable(
  "suppliers",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    cnpj: varchar("cnpj", { length: 20 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 320 }),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zipCode", { length: 10 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("supplier_restaurant_idx").on(table.restaurantId),
  })
);

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

/**
 * Purchase Order/Pedido de Compra table
 */
export const purchaseOrders = mysqlTable(
  "purchaseOrders",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    supplierId: int("supplierId").notNull(),
    orderNumber: varchar("orderNumber", { length: 50 }).notNull(),
    status: mysqlEnum("status", ["pending", "confirmed", "received", "cancelled"]).default("pending").notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    receivedAt: timestamp("receivedAt"),
  },
  (table) => ({
    restaurantIdx: index("purchaseOrder_restaurant_idx").on(table.restaurantId),
    supplierIdx: index("purchaseOrder_supplier_idx").on(table.supplierId),
    statusIdx: index("purchaseOrder_status_idx").on(table.status),
  })
);

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

/**
 * Purchase Order Item table
 */
export const purchaseOrderItems = mysqlTable(
  "purchaseOrderItems",
  {
    id: int("id").autoincrement().primaryKey(),
    purchaseOrderId: int("purchaseOrderId").notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    purchaseOrderIdx: index("purchaseOrderItem_po_idx").on(table.purchaseOrderId),
    productIdx: index("purchaseOrderItem_product_idx").on(table.productId),
  })
);

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;

/**
 * Audit Log table
 */
export const auditLogs = mysqlTable(
  "auditLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    userId: int("userId").notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    entity: varchar("entity", { length: 100 }).notNull(),
    entityId: int("entityId"),
    oldValues: json("oldValues"),
    newValues: json("newValues"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("auditLog_restaurant_idx").on(table.restaurantId),
    userIdx: index("auditLog_user_idx").on(table.userId),
    actionIdx: index("auditLog_action_idx").on(table.action),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * iFood Integration table
 */
export const ifoodIntegrations = mysqlTable(
  "ifoodIntegrations",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    ifoodRestaurantId: varchar("ifoodRestaurantId", { length: 100 }).notNull().unique(),
    accessToken: text("accessToken").notNull(),
    refreshToken: text("refreshToken"),
    tokenExpiresAt: datetime("tokenExpiresAt"),
    isActive: boolean("isActive").default(true).notNull(),
    lastSyncAt: datetime("lastSyncAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("ifood_restaurant_idx").on(table.restaurantId),
  })
);

export type IfoodIntegration = typeof ifoodIntegrations.$inferSelect;
export type InsertIfoodIntegration = typeof ifoodIntegrations.$inferInsert;

/**
 * Fiscal Document/Documento Fiscal table
 */
export const fiscalDocuments = mysqlTable(
  "fiscalDocuments",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    orderId: int("orderId").notNull(),
    documentType: mysqlEnum("documentType", ["nfce", "sat", "cupom"]).notNull(),
    documentNumber: varchar("documentNumber", { length: 50 }).notNull(),
    series: varchar("series", { length: 10 }),
    xmlContent: text("xmlContent"),
    status: mysqlEnum("status", ["pending", "issued", "cancelled"]).default("pending").notNull(),
    issuedAt: datetime("issuedAt"),
    cancelledAt: datetime("cancelledAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("fiscal_restaurant_idx").on(table.restaurantId),
    orderIdx: index("fiscal_order_idx").on(table.orderId),
    statusIdx: index("fiscal_status_idx").on(table.status),
  })
);

export type FiscalDocument = typeof fiscalDocuments.$inferSelect;
export type InsertFiscalDocument = typeof fiscalDocuments.$inferInsert;

/**
 * Promotion/Promoção table
 */
export const promotions = mysqlTable(
  "promotions",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    type: mysqlEnum("type", ["percentage", "fixed", "bogo"]).notNull(),
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
    applicableTo: mysqlEnum("applicableTo", ["product", "category", "order"]).notNull(),
    targetId: int("targetId"),
    startDate: datetime("startDate").notNull(),
    endDate: datetime("endDate").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("promotion_restaurant_idx").on(table.restaurantId),
    activeIdx: index("promotion_active_idx").on(table.isActive),
  })
);

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;


/**
 * Cost Centers / Centros de Custo table
 * Represents different operational areas (Restaurante SS, Cozinha SS, etc)
 */
export const costCenters = mysqlTable(
  "costCenters",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    code: varchar("code", { length: 20 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    type: mysqlEnum("type", ["warehouse", "kitchen", "dining", "bar"]).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("costCenter_restaurant_idx").on(table.restaurantId),
    codeIdx: index("costCenter_code_idx").on(table.code),
  })
);

export type CostCenter = typeof costCenters.$inferSelect;
export type InsertCostCenter = typeof costCenters.$inferInsert;

/**
 * Warehouse/Almoxarifado Inventory table
 * Tracks inventory at each cost center with weight/quantity
 */
export const warehouseInventory = mysqlTable(
  "warehouseInventory",
  {
    id: int("id").autoincrement().primaryKey(),
    costCenterId: int("costCenterId").notNull(),
    productId: int("productId").notNull(),
    quantity: decimal("quantity", { precision: 12, scale: 3 }).default("0").notNull(),
    weight: decimal("weight", { precision: 12, scale: 3 }),
    weightUnit: mysqlEnum("weightUnit", ["g", "kg", "ml", "l", "un"]),
    lastMovedAt: datetime("lastMovedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    costCenterIdx: index("warehouse_costCenter_idx").on(table.costCenterId),
    productIdx: index("warehouse_product_idx").on(table.productId),
  })
);

export type WarehouseInventory = typeof warehouseInventory.$inferSelect;
export type InsertWarehouseInventory = typeof warehouseInventory.$inferInsert;

/**
 * Warehouse Movements / Movimentações de Almoxarifado
 * Tracks all inventory movements (entry, exit, transfer)
 */
export const warehouseMovements = mysqlTable(
  "warehouseMovements",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    fromCostCenterId: int("fromCostCenterId"),
    toCostCenterId: int("toCostCenterId").notNull(),
    productId: int("productId").notNull(),
    quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
    movementType: mysqlEnum("movementType", ["entry", "exit", "transfer", "adjustment", "waste"]).notNull(),
    reason: text("reason"),
    reference: varchar("reference", { length: 100 }),
    requestedBy: int("requestedBy"),
    approvedBy: int("approvedBy"),
    status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("movement_restaurant_idx").on(table.restaurantId),
    productIdx: index("movement_product_idx").on(table.productId),
    statusIdx: index("movement_status_idx").on(table.status),
  })
);

export type WarehouseMovement = typeof warehouseMovements.$inferSelect;
export type InsertWarehouseMovement = typeof warehouseMovements.$inferInsert;

/**
 * Warehouse Requisitions / Requisições de Almoxarifado
 * Formal requests for product transfers between cost centers
 */
export const warehouseRequisitions = mysqlTable(
  "warehouseRequisitions",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    requisitionNumber: varchar("requisitionNumber", { length: 50 }).notNull().unique(),
    fromCostCenterId: int("fromCostCenterId").notNull(),
    toCostCenterId: int("toCostCenterId").notNull(),
    requestedBy: int("requestedBy").notNull(),
    approvedBy: int("approvedBy"),
    status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
    totalItems: int("totalItems").default(0).notNull(),
    notes: text("notes"),
    requestedAt: datetime("requestedAt").notNull(),
    approvedAt: datetime("approvedAt"),
    completedAt: datetime("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("requisition_restaurant_idx").on(table.restaurantId),
    numberIdx: index("requisition_number_idx").on(table.requisitionNumber),
    statusIdx: index("requisition_status_idx").on(table.status),
  })
);

export type WarehouseRequisition = typeof warehouseRequisitions.$inferSelect;
export type InsertWarehouseRequisition = typeof warehouseRequisitions.$inferInsert;

/**
 * Warehouse Requisition Items
 * Individual items in a requisition
 */
export const warehouseRequisitionItems = mysqlTable(
  "warehouseRequisitionItems",
  {
    id: int("id").autoincrement().primaryKey(),
    requisitionId: int("requisitionId").notNull(),
    productId: int("productId").notNull(),
    requestedQuantity: decimal("requestedQuantity", { precision: 12, scale: 3 }).notNull(),
    approvedQuantity: decimal("approvedQuantity", { precision: 12, scale: 3 }),
    deliveredQuantity: decimal("deliveredQuantity", { precision: 12, scale: 3 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    requisitionIdx: index("reqItem_requisition_idx").on(table.requisitionId),
    productIdx: index("reqItem_product_idx").on(table.productId),
  })
);

export type WarehouseRequisitionItem = typeof warehouseRequisitionItems.$inferSelect;
export type InsertWarehouseRequisitionItem = typeof warehouseRequisitionItems.$inferInsert;

/**
 * House-Made Products / Produtos Feitos na Casa
 * Tracks recipes and prepared items (molhos, preparos, etc)
 */
export const houseMadeProducts = mysqlTable(
  "houseMadeProducts",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    productId: int("productId").notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    recipeJson: json("recipeJson"),
    yieldQuantity: decimal("yieldQuantity", { precision: 10, scale: 3 }).notNull(),
    yieldUnit: mysqlEnum("yieldUnit", ["g", "kg", "ml", "l", "un"]).notNull(),
    costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("houseMade_restaurant_idx").on(table.restaurantId),
    codeIdx: index("houseMade_code_idx").on(table.code),
  })
);

export type HouseMadeProduct = typeof houseMadeProducts.$inferSelect;
export type InsertHouseMadeProduct = typeof houseMadeProducts.$inferInsert;

/**
 * Ingredient/Insumo table for 1:1 mapping
 * Tracks raw materials and their relationships to products
 */
export const ingredients = mysqlTable(
  "ingredients",
  {
    id: int("id").autoincrement().primaryKey(),
    restaurantId: int("restaurantId").notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    unit: mysqlEnum("unit", ["g", "kg", "ml", "l", "un"]).notNull(),
    costPrice: decimal("costPrice", { precision: 10, scale: 2 }).notNull(),
    salePrice: decimal("salePrice", { precision: 10, scale: 2 }),
    supplier: varchar("supplier", { length: 255 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    restaurantIdx: index("ingredient_restaurant_idx").on(table.restaurantId),
    codeIdx: index("ingredient_code_idx").on(table.code),
  })
);

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;

/**
 * Product-Ingredient Mapping / Mapeamento Produto-Insumo
 * Maps ingredients to products with quantities
 */
export const productIngredients = mysqlTable(
  "productIngredients",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    ingredientId: int("ingredientId").notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
    unit: mysqlEnum("unit", ["g", "kg", "ml", "l", "un"]).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    productIdx: index("prodIng_product_idx").on(table.productId),
    ingredientIdx: index("prodIng_ingredient_idx").on(table.ingredientId),
  })
);

export type ProductIngredient = typeof productIngredients.$inferSelect;
export type InsertProductIngredient = typeof productIngredients.$inferInsert;
