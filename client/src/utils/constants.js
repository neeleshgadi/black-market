// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PROFILE: "/auth/profile",

  // Aliens
  ALIENS: "/aliens",
  ALIEN_DETAIL: (id) => `/aliens/${id}`,
  RELATED_ALIENS: (id) => `/aliens/${id}/related`,

  // Cart
  CART: "/cart",
  ADD_TO_CART: "/cart/add",
  UPDATE_CART: "/cart/update",
  REMOVE_FROM_CART: (id) => `/cart/remove/${id}`,

  // Orders
  ORDERS: "/orders",
  ORDER_DETAIL: (id) => `/orders/${id}`,

  // Wishlist
  WISHLIST: "/wishlist",
  ADD_TO_WISHLIST: "/wishlist/add",
  REMOVE_FROM_WISHLIST: (id) => `/wishlist/remove/${id}`,

  // Admin
  ADMIN_ALIENS: "/admin/aliens",
  ADMIN_ORDERS: "/admin/orders",
};

// App Constants
export const APP_NAME = "Black Market - Alien Collectibles";

// Alien Rarities
export const ALIEN_RARITIES = ["Common", "Rare", "Epic", "Legendary"];

// Order Status
export const ORDER_STATUS = {
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  CART: "cart",
  USER: "user",
};
