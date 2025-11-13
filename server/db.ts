import { eq, and, desc, asc, like, gte, lte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  restaurants,
  products,
  productCategories,
  tables,
  orders,
  orderItems,
  customers,
  cashRegisters,
  payments,
  inventoryMovements,
  suppliers,
  purchaseOrders,
  purchaseOrderItems,
  auditLogs,
  ifoodIntegrations,
  fiscalDocuments,
  promotions,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * User Management
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Restaurant Management
 */
export async function getRestaurantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRestaurantsByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.ownerId, ownerId));
}

/**
 * Product Management
 */
export async function getProductsByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.restaurantId, restaurantId),
        eq(products.isActive, true)
      )
    )
    .orderBy(asc(products.name));
}

export async function searchProducts(
  restaurantId: number,
  query: string
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.restaurantId, restaurantId),
        eq(products.isActive, true),
        like(products.name, `%${query}%`)
      )
    )
    .limit(20);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Order Management
 */
export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByRestaurant(
  restaurantId: number,
  status?: string
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(orders.restaurantId, restaurantId)];
  if (status) {
    conditions.push(eq(orders.status, status as any));
  }

  return await db
    .select()
    .from(orders)
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(100);
}

export async function getOrdersByTable(tableId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orders)
    .where(eq(orders.tableId, tableId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderItemsByOrder(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
}

/**
 * Table Management
 */
export async function getTablesByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tables)
    .where(eq(tables.restaurantId, restaurantId))
    .orderBy(asc(tables.tableNumber));
}

export async function getTableById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(tables)
    .where(eq(tables.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Customer Management
 */
export async function getCustomersByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.restaurantId, restaurantId),
        eq(customers.isActive, true)
      )
    )
    .orderBy(asc(customers.name));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Cash Register Management
 */
export async function getOpenCashRegister(restaurantId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(cashRegisters)
    .where(
      and(
        eq(cashRegisters.restaurantId, restaurantId),
        eq(cashRegisters.status, "open")
      )
    )
    .orderBy(desc(cashRegisters.openTime))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCashRegisterById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(cashRegisters)
    .where(eq(cashRegisters.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Inventory Management
 */
export async function getInventoryMovements(
  restaurantId: number,
  productId?: number
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(inventoryMovements.restaurantId, restaurantId)];
  if (productId) {
    conditions.push(eq(inventoryMovements.productId, productId));
  }

  return await db
    .select()
    .from(inventoryMovements)
    .where(and(...conditions))
    .orderBy(desc(inventoryMovements.createdAt))
    .limit(100);
}

/**
 * Supplier Management
 */
export async function getSuppliersByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(suppliers)
    .where(
      and(
        eq(suppliers.restaurantId, restaurantId),
        eq(suppliers.isActive, true)
      )
    )
    .orderBy(asc(suppliers.name));
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * iFood Integration
 */
export async function getIfoodIntegration(restaurantId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(ifoodIntegrations)
    .where(eq(ifoodIntegrations.restaurantId, restaurantId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Audit Logging
 */
export async function createAuditLog(
  restaurantId: number,
  userId: number,
  action: string,
  entity: string,
  entityId?: number,
  oldValues?: any,
  newValues?: any,
  ipAddress?: string
) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(auditLogs).values({
      restaurantId,
      userId,
      action,
      entity,
      entityId,
      oldValues,
      newValues,
      ipAddress,
    });
  } catch (error) {
    console.error("[Database] Failed to create audit log:", error);
  }
}

/**
 * Promotion Management
 */
export async function getActivePromotions(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return await db
    .select()
    .from(promotions)
    .where(
      and(
        eq(promotions.restaurantId, restaurantId),
        eq(promotions.isActive, true),
        lte(promotions.startDate, now),
        gte(promotions.endDate, now)
      )
    );
}
