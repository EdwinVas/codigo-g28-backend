export type Role = "ADMIN" | "CUSTOMER";
export type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  createdAt: string;
  categoryId?: number | null;
  categories?: Category | null;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  products: Product;
}

export interface OrderUser {
  id: number;
  username: string;
  email: string;
}

export interface Order {
  id: number;
  userId: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  deletedAt?: string | null;
  users: OrderUser;
  order_items: OrderItem[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  rol: Role;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// API response wrappers
export interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

export interface ApiError {
  ok: false;
  message?: string;
  error?: string;
}
