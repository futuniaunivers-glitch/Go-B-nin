export interface WholesaleTier {
  minQuantity: number; // integer >= 2
  pricePerUnit: number; // integer > 0
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  imagePath: string | null;
  thumbPath: string | null;
  stock: number; // integer >= 0
  lowStockThreshold: number; // integer >= 0 (default 10)
  detailPrice: number; // integer > 0 (FCFA)
  wholesaleEnabled: boolean;
  wholesaleTiers: WholesaleTier[];
  isActive: boolean;
  isDemo?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string | null;
  isActive: boolean;
  order: number;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  priceMode: 'detail' | 'wholesale';
}

export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  area: string;
  deliveryNote: string;
  extraNote?: string;
  items: OrderItemSnapshot[];
  total: number;
  status: OrderStatus;
  stockDeducted: boolean;
  acceptedConditions: true;
  isDemo?: boolean;
  createdAt: any;
  updatedAt?: any;
}

export interface StoreSettings {
  businessName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string; // international digits without +
  whatsappChannelUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  mapsUrl: string;
  locationText: string;
  salesConditions: string[];
  deliveryInfo: string;
  updatedAt?: any;
}

export interface CartStoredItem {
  productId: string;
  quantity: number;
}

export interface CartResolvedItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  mode: 'detail' | 'wholesale';
  appliedTier: WholesaleTier | null;
  nextTier: WholesaleTier | null;
  savings: number;
}

export type StockStatus = 'Rupture' | 'Stock faible' | 'Disponible';
