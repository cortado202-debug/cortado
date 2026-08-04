export type CategoryId = string;

export interface ProductSize {
  id?: string;
  name: string;
  price: number;
}

export interface Category {
  id: CategoryId;
  nameAr: string;
  nameEn: string;
  iconName: string;
  descriptionAr?: string;
  isHidden?: boolean;
}

export interface Product {
  id: string;
  categoryId: CategoryId;
  nameAr: string;
  nameEn: string;
  price: number;
  descriptionAr: string;
  ingredients: string[];
  sizes?: ProductSize[];
  imageUrl: string;
  cupColor?: string; // 3D texture/color theme
  accentColor?: string;
  isPopular?: boolean;
  calories?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: ProductSize;
  selectedOptions?: string[];
}

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: {
    productId: string;
    nameAr: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discountAmount: number;
  promoCodeUsed?: string;
  total: number;
  status: OrderStatus;
  deliveryType: 'table' | 'takeaway' | 'delivery';
  deliveryFee?: number;
  paymentMethodName?: string;
  notes?: string;
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 20 for 20% or 15 for 15 SAR
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  isOneTime?: boolean;
  isUsed?: boolean;
  usedAt?: string;
  usedByUsers?: string[]; // user emails or IDs
  groupName?: string; // e.g. 'جامعة دمشق', 'مدرسة السلام'
}

export interface Customer {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  joinedAt: string;
  totalOrdersCount?: number;
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  whatsapp: string;
  locationMap: string;
}

export interface BranchLocation {
  id: string;
  name: string;
  address: string;
  phone?: string;
  mapUrl?: string;
  isMain?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string; // e.g. شام كاش, سيريتل كاش, تحويل بنكي
  details: string; // e.g. رقم الحساب: 0912345678 - اسم المستفيد: كافيه كورتادو
  imageUrl?: string; // QR code or logo URL
  isActive: boolean;
}

export interface SiteSettings {
  logoUrl: string;
  siteTitle: string;
  siteSubtitle: string;
  phone: string;
  address: string;
  openingHours?: string;
  branches?: BranchLocation[];
  socials: SocialLinks;
  adminEmail: string;
  deliveryFee?: number; // Delivery fee when customer chooses delivery
  paymentMethods?: PaymentMethod[]; // Configurable payment options
  isStoreOpen?: boolean; // Toggle store status (open/closed)
  closedStoreNotice?: string; // Custom message displayed when store is closed
  isAnimatedBackgroundEnabled?: boolean; // Toggle animated green gradient background
  updatedAt?: string; // Timestamp for sync resolution
}

export interface UserSession {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  isAdmin: boolean;
}
