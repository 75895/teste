import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getDb,
  getRestaurantsByOwnerId,
  getTablesByRestaurant,
  getProductsByRestaurant,
  searchProducts,
  getOrdersByRestaurant,
  getOrdersByTable,
  getOrderItemsByOrder,
  getCustomersByRestaurant,
  getOpenCashRegister,
  getSuppliersByRestaurant,
  getIfoodIntegration,
  getActivePromotions,
  getInventoryMovements,
  createAuditLog,
} from "./db";
import { tables, orders, orderItems, products, customers, cashRegisters, payments, inventoryMovements, suppliers, ifoodIntegrations, promotions } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Restaurant Router
 */
const restaurantRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getRestaurantsByOwnerId(ctx.user.id);
  }),
});

/**
 * Table/Mesa Router
 */
const tableRouter = router({
  list: protectedProcedure
    .input(z.object({ restaurantId: z.number() }))
    .query(async ({ input }) => {
      return await getTablesByRestaurant(input.restaurantId);
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        tableId: z.number(),
        status: z.enum(["available", "occupied", "reserved", "cleaning"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(tables)
        .set({ status: input.status })
        .where(eq(tables.id, input.tableId));

      await createAuditLog(
        0,
        ctx.user.id,
        "UPDATE_TABLE_STATUS",
        "table",
        input.tableId,
        null,
        { status: input.status }
      );

      return { success: true };
    }),
});

/**
 * Product/Menu Router
 */
const productRouter = router({
  list: protectedProcedure
    .input(z.object({ restaurantId: z.number() }))
    .query(async ({ input }) => {
      return await getProductsByRestaurant(input.restaurantId);
    }),

  search: protectedProcedure
    .input(z.object({ restaurantId: z.number(), query: z.string() }))
    .query(async ({ input }) => {
      return await searchProducts(input.restaurantId, input.query);
    }),

  getPromotions: protectedProcedure
    .input(z.object({ restaurantId: z.number() }))
    .query(async ({ input }) => {
      return await getActivePromotions(input.restaurantId);
    }),
});

/**
 * Order Router
 */
const orderRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        restaurantId: z.number(),
        status: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getOrdersByRestaurant(input.restaurantId, input.status);
    }),

  getByTable: protectedProcedure
    .input(z.object({ tableId: z.number() }))
    .query(async ({ input }) => {
      return await getOrdersByTable(input.tableId);
    }),

  getItems: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      return await getOrderItemsByOrder(input.orderId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        restaurantId: z.number(),
        tableId: z.number().optional(),
        customerId: z.number().optional(),
        type: z.enum(["dine_in", "takeout", "delivery", "ifood"]),
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number(),
            notes: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calculate totals
      let subtotal = 0;
      const itemsData = [];

      for (const item of input.items) {
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (product.length === 0) throw new Error("Product not found");

        const itemTotal =
          Number(product[0].salePrice) * item.quantity;
        subtotal += itemTotal;

        itemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product[0].salePrice,
          notes: item.notes,
        });
      }

      // Create order
      const orderNumber = `ORD-${Date.now()}`;
      const result = await db.insert(orders).values({
        restaurantId: input.restaurantId,
        tableId: input.tableId,
        customerId: input.customerId,
        orderNumber,
        type: input.type,
        subtotal: subtotal.toString(),
        tax: "0.00",
        total: subtotal.toString(),
        waiterId: ctx.user.id,
      });

      const orderId = result[0].insertId;

      // Create order items
      for (const item of itemsData) {
        await db.insert(orderItems).values({
          orderId: orderId as number,
          ...item,
        });
      }

      // Update table status if dine_in
      if (input.type === "dine_in" && input.tableId) {
        await db
          .update(tables)
          .set({ status: "occupied", currentOrderId: orderId as number })
          .where(eq(tables.id, input.tableId));
      }

      await createAuditLog(
        input.restaurantId,
        ctx.user.id,
        "CREATE_ORDER",
        "order",
        orderId as number,
        null,
        { orderNumber, type: input.type }
      );

      return { orderId, orderNumber };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum([
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "served",
          "completed",
          "cancelled",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(orders)
        .set({ status: input.status })
        .where(eq(orders.id, input.orderId));

      await createAuditLog(
        0,
        ctx.user.id,
        "UPDATE_ORDER_STATUS",
        "order",
        input.orderId,
        null,
        { status: input.status }
      );

      return { success: true };
    }),
});

/**
 * Customer Router
 */
const customerRouter = router({
  list: protectedProcedure
    .input(z.object({ restaurantId: z.number() }))
    .query(async ({ input }) => {
      return await getCustomersByRestaurant(input.restaurantId);
    }),
});

/**
 * Cash Register Router
 */
const cashRegisterRouter = router({
  getOpen: protectedProcedure
    .input(z.object({ restaurantId: z.number() }))
    .query(async ({ input }) => {
      return await getOpenCashRegister(input.restaurantId);
    }),

  open: protectedProcedure
    .input(
      z.object({
        restaurantId: z.number(),
        initialAmount: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(cashRegisters).values({
        restaurantId: input.restaurantId,
        userId: ctx.user.id,
        openTime: new Date(),
        initialAmount: input.initialAmount,
      });

      await createAuditLog(
        input.restaurantId,
        ctx.user.id,
        "OPEN_CASH_REGISTER",
        "cashRegister",
        result[0].insertId as number,
        null,
        { initialAmount: input.initialAmount }
      );

      return { cashRegisterId: result[0].insertId };
    }),

  close: protectedProcedure
    .input(
      z.object({
        cashRegisterId: z.number(),
        finalAmount: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(cashRegisters)
        .set({
          closeTime: new Date(),
          finalAmount: input.finalAmount,
          status: "closed",
        })
        .where(eq(cashRegisters.id, input.cashRegisterId));

      await createAuditLog(
        0,
        ctx.user.id,
        "CLOSE_CASH_REGISTER",
        "cashRegister",
        input.cashRegisterId,
        null,
        { finalAmount: input.finalAmount }
      );

      return { success: true };
    }),
});

/**
 * Inventory Router
 */
const inventoryRouter = router({
  getMovements: protectedProcedure
    .input(
      z.object({
        restaurantId: z.number(),
        productId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getInventoryMovements(
        input.restaurantId,
        input.productId
      );
    }),
});

/**
 * Supplier Router
 */
const supplierRouter = router({
  list: protectedProcedure
    .input(z.object({ restaurantId: z.number() }))
    .query(async ({ input }) => {
      return await getSuppliersByRestaurant(input.restaurantId);
    }),
});

/**
 * iFood Integration Router
 */
const ifoodRouter = router({
  getIntegration: protectedProcedure
    .input(z.object({ restaurantId: z.number() }))
    .query(async ({ input }) => {
      return await getIfoodIntegration(input.restaurantId);
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  restaurant: restaurantRouter,
  table: tableRouter,
  product: productRouter,
  order: orderRouter,
  customer: customerRouter,
  cashRegister: cashRegisterRouter,
  inventory: inventoryRouter,
  supplier: supplierRouter,
  ifood: ifoodRouter,
});

export type AppRouter = typeof appRouter;
