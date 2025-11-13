/**
 * iFood Integration Module
 * Handles authentication, webhook processing, and order synchronization with iFood API
 */

import { getDb, getIfoodIntegration, createAuditLog } from "./db";
import { ifoodIntegrations, orders, orderItems, products, tables } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const IFOOD_API_BASE_URL = "https://api.ifood.com.br";
const IFOOD_AUTH_URL = "https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token";

/**
 * OAuth Token Response from iFood
 */
interface IfoodTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

/**
 * iFood Order from webhook
 */
interface IfoodOrder {
  id: string;
  reference: string;
  createdAt: string;
  status: string;
  total: number;
  items: IfoodOrderItem[];
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  delivery?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface IfoodOrderItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

/**
 * Get authorization URL for iFood OAuth
 */
export function getIfoodAuthUrl(restaurantId: number, redirectUri: string): string {
  const clientId = process.env.IFOOD_CLIENT_ID || "";
  const scope = "orders:read orders:write restaurants:read";

  const url = new URL(`${IFOOD_API_BASE_URL}/oauth/authorization`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", Buffer.from(restaurantId.toString()).toString("base64"));

  return url.toString();
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  restaurantId: number,
  code: string
): Promise<IfoodTokenResponse> {
  const clientId = process.env.IFOOD_CLIENT_ID || "";
  const clientSecret = process.env.IFOOD_CLIENT_SECRET || "";

  const response = await fetch(IFOOD_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${process.env.APP_URL}/api/ifood/callback`,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }

  const data = (await response.json()) as IfoodTokenResponse;

  // Save integration to database
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await db
    .insert(ifoodIntegrations)
    .values({
      restaurantId,
      ifoodRestaurantId: code, // This should be the actual iFood restaurant ID from the API
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: expiresAt,
      isActive: true,
    })
    .onDuplicateKeyUpdate({
      set: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: expiresAt,
      },
    });

  return data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(restaurantId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const integration = await getIfoodIntegration(restaurantId);
  if (!integration || !integration.refreshToken) {
    throw new Error("No refresh token available");
  }

  const clientId = process.env.IFOOD_CLIENT_ID || "";
  const clientSecret = process.env.IFOOD_CLIENT_SECRET || "";

  const response = await fetch(IFOOD_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: integration.refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }

  const data = (await response.json()) as IfoodTokenResponse;
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await db
    .update(ifoodIntegrations)
    .set({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: expiresAt,
    })
    .where(eq(ifoodIntegrations.restaurantId, restaurantId));

  return data.access_token;
}

/**
 * Get valid access token, refreshing if necessary
 */
export async function getValidAccessToken(restaurantId: number): Promise<string> {
  const integration = await getIfoodIntegration(restaurantId);
  if (!integration) {
    throw new Error("iFood integration not found");
  }

  if (!integration.tokenExpiresAt || new Date() >= integration.tokenExpiresAt) {
    return await refreshAccessToken(restaurantId);
  }

  return integration.accessToken;
}

/**
 * Process incoming iFood webhook order
 */
export async function processIfoodOrder(
  restaurantId: number,
  ifoodOrder: IfoodOrder,
  userId: number
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate totals
  let subtotal = 0;
  const itemsData = [];

  for (const item of ifoodOrder.items) {
    subtotal += item.total_price;
    itemsData.push({
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      notes: item.notes,
    });
  }

  // Create order
  const orderNumber = `IFOOD-${ifoodOrder.id}`;
  const result = await db.insert(orders).values({
    restaurantId,
    orderNumber,
    type: "ifood",
    status: "pending",
    subtotal: subtotal.toString(),
    tax: "0.00",
    total: ifoodOrder.total.toString(),
    paymentStatus: "pending",
    notes: `iFood Order: ${ifoodOrder.id}`,
    ifoodOrderId: ifoodOrder.id,
  });

  const orderId = result[0].insertId as number;

  // Create order items
  for (const item of itemsData) {
    // Try to find matching product by name
    const product = await db
      .select()
      .from(products)
      .where(eq(products.name, item.productName))
      .limit(1);

    await db.insert(orderItems).values({
      orderId,
      productId: product.length > 0 ? product[0].id : 0,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      notes: item.notes,
    });
  }

  // Create audit log
  await createAuditLog(
    restaurantId,
    userId,
    "CREATE_IFOOD_ORDER",
    "order",
    orderId,
    null,
    {
      ifoodOrderId: ifoodOrder.id,
      customerName: ifoodOrder.customer.name,
      total: ifoodOrder.total,
    }
  );

  return orderId;
}

/**
 * Update iFood order status
 */
export async function updateIfoodOrderStatus(
  restaurantId: number,
  ifoodOrderId: string,
  status: "CONFIRMED" | "PREPARING" | "READY" | "DISPATCHED" | "DELIVERED" | "CANCELLED"
): Promise<void> {
  const accessToken = await getValidAccessToken(restaurantId);

  const response = await fetch(
    `${IFOOD_API_BASE_URL}/orders/v1.0/${ifoodOrderId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update iFood order status: ${response.statusText}`);
  }
}

/**
 * Fetch orders from iFood API
 */
export async function fetchIfoodOrders(
  restaurantId: number,
  status?: string
): Promise<IfoodOrder[]> {
  const accessToken = await getValidAccessToken(restaurantId);
  const integration = await getIfoodIntegration(restaurantId);

  if (!integration) {
    throw new Error("iFood integration not found");
  }

  let url = `${IFOOD_API_BASE_URL}/orders/v1.0?restaurantId=${integration.ifoodRestaurantId}`;
  if (status) {
    url += `&status=${status}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch iFood orders: ${response.statusText}`);
  }

  const data = await response.json();
  return data.orders || [];
}

/**
 * Validate iFood webhook signature
 */
export function validateIfoodWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require("crypto");
  const secret = process.env.IFOOD_WEBHOOK_SECRET || "";

  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return hash === signature;
}

/**
 * Sync menu with iFood
 */
export async function syncMenuWithIfood(
  restaurantId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const accessToken = await getValidAccessToken(restaurantId);
  const integration = await getIfoodIntegration(restaurantId);

  if (!integration) {
    throw new Error("iFood integration not found");
  }

  // Get all active products
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.restaurantId, restaurantId));

  // Send products to iFood
  for (const product of allProducts) {
    const response = await fetch(
      `${IFOOD_API_BASE_URL}/catalog/v1.0/restaurants/${integration.ifoodRestaurantId}/items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.salePrice,
          available: product.stockQty > 0,
        }),
      }
    );

    if (!response.ok) {
      console.error(`Failed to sync product ${product.id}:`, response.statusText);
    }
  }

  // Update last sync time
  await db
    .update(ifoodIntegrations)
    .set({ lastSyncAt: new Date() })
    .where(eq(ifoodIntegrations.restaurantId, restaurantId));
}
