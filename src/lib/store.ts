import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  CartItem, 
  CategoryId, 
  Customer, 
  Order, 
  OrderStatus, 
  Product, 
  ProductSize,
  PromoCode, 
  SiteSettings, 
  UserSession 
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_PROMO_CODES, 
  INITIAL_SETTINGS 
} from '../data/initialData';
import {
  pushSettingsToCloud,
  pushCategoriesToCloud,
  pushProductsToCloud,
  pushPromoCodesToCloud,
  pushOrdersToCloud,
  pushCustomersToCloud
} from './firestoreSync';

interface StoreState {
  // Navigation & Category State
  activeCategoryId: CategoryId;
  active3DIndex: number;
  
  // Products & Menu Data
  categories: typeof INITIAL_CATEGORIES;
  products: Product[];
  
  // Cart & Checkout
  cart: CartItem[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  appliedPromo: { promo: PromoCode; discountAmount: number } | null;
  promoCodes: PromoCode[];
  
  // Orders & Admin
  orders: Order[];
  customers: Customer[];
  settings: SiteSettings;
  userSession: UserSession | null;
  
  // UI Controls
  isAdminModalOpen: boolean;
  isCouponModalOpen: boolean;
  isProfileModalOpen: boolean;
  isAuthModalOpen: boolean;
  activeAdminTab: 'overview' | 'settings' | 'products' | 'orders' | 'customers' | 'promos';
  
  // Actions
  setActiveCategory: (catId: CategoryId) => void;
  setActive3DIndex: (index: number) => void;
  next3DItem: () => void;
  prev3DItem: () => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number, selectedSize?: ProductSize) => void;
  removeFromCart: (productId: string, sizeName?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, sizeName?: string) => void;
  clearCart: () => void;
  toggleCart: (isOpen?: boolean) => void;
  toggleCheckout: (isOpen?: boolean) => void;
  
  // Coupon Validation
  applyPromoCode: (codeStr: string) => { success: boolean; message: string; discount?: number };
  burnPromoCode: (codeStr: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  
  // Order Actions
  createOrder: (customerDetails: { 
    name: string; 
    phone: string; 
    email?: string; 
    deliveryType: 'table' | 'takeaway' | 'delivery'; 
    paymentMethodName?: string;
    notes?: string 
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  reorderPastOrder: (order: Order) => void;
  
  // Category Management Actions
  addCategory: (category: { id?: string; nameAr: string; nameEn: string; iconName?: string; descriptionAr?: string }) => void;
  updateCategory: (category: { id: string; nameAr: string; nameEn: string; iconName?: string; descriptionAr?: string; isHidden?: boolean }) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryHidden: (id: string) => void;

  // Admin Management Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  addProductsBulk: (productsData: Omit<Product, 'id'>[]) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  resetToInitialData: () => void;
  
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'usedCount' | 'usedByUsers'>) => void;
  addPromoCodesBulk: (promos: Omit<PromoCode, 'id' | 'usedCount' | 'usedByUsers'>[]) => void;
  updatePromoCode: (promo: PromoCode) => void;
  deletePromoCode: (id: string) => void;
  
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  setUserSession: (session: UserSession | null) => void;
  toggleAdminModal: (isOpen?: boolean) => void;
  toggleCouponModal: (isOpen?: boolean) => void;
  toggleProfileModal: (isOpen?: boolean) => void;
  toggleAuthModal: (isOpen?: boolean) => void;
  setActiveAdminTab: (tab: StoreState['activeAdminTab']) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
  activeCategoryId: INITIAL_CATEGORIES[0]?.id || 'cat-1',
  active3DIndex: 0,
  categories: INITIAL_CATEGORIES,
  products: INITIAL_PRODUCTS,
  cart: [],
  isCartOpen: false,
  isCheckoutOpen: false,
  appliedPromo: null,
  promoCodes: [],
  orders: [],
  customers: [],
  settings: INITIAL_SETTINGS,
  userSession: null,
  isAdminModalOpen: false,
  isCouponModalOpen: false,
  isProfileModalOpen: false,
  isAuthModalOpen: false,
  activeAdminTab: 'overview',

  setActiveCategory: (catId) => {
    set({ activeCategoryId: catId, active3DIndex: 0 });
  },

  setActive3DIndex: (index) => {
    set({ active3DIndex: index });
  },

  next3DItem: () => {
    const state = get();
    const currentCategoryProducts = state.products.filter(p => p.categoryId === state.activeCategoryId);
    if (currentCategoryProducts.length === 0) return;
    const nextIdx = (state.active3DIndex + 1) % currentCategoryProducts.length;
    set({ active3DIndex: nextIdx });
  },

  prev3DItem: () => {
    const state = get();
    const currentCategoryProducts = state.products.filter(p => p.categoryId === state.activeCategoryId);
    if (currentCategoryProducts.length === 0) return;
    const prevIdx = (state.active3DIndex - 1 + currentCategoryProducts.length) % currentCategoryProducts.length;
    set({ active3DIndex: prevIdx });
  },

  addToCart: (product, quantity = 1, selectedSize?: ProductSize) => {
    const { cart, settings } = get();

    // Prevent adding to cart if store is closed by admin
    if (settings.isStoreOpen === false) {
      window.dispatchEvent(new CustomEvent('show-closed-store-modal'));
      return;
    }

    const activeSize = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    
    const effectiveProduct = activeSize 
      ? { ...product, price: activeSize.price } 
      : product;

    const existingIndex = cart.findIndex(
      item => item.product.id === product.id && (item.selectedSize?.name || '') === (activeSize?.name || '')
    );
    
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
      set({ cart: updatedCart });
    } else {
      set({ 
        cart: [...cart, { product: effectiveProduct, quantity, selectedSize: activeSize }]
      });
    }
    
    // Recalculate promo discount if promo applied
    const state = get();
    if (state.appliedPromo) {
      state.applyPromoCode(state.appliedPromo.promo.code);
    }
  },

  removeFromCart: (productId, sizeName) => {
    set({ 
      cart: get().cart.filter(item => !(item.product.id === productId && (sizeName !== undefined ? item.selectedSize?.name === sizeName : true))) 
    });
    const state = get();
    if (state.appliedPromo) {
      state.applyPromoCode(state.appliedPromo.promo.code);
    }
  },

  updateCartQuantity: (productId, quantity, sizeName) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, sizeName);
      return;
    }
    const updatedCart = get().cart.map(item => {
      if (item.product.id === productId && (sizeName !== undefined ? item.selectedSize?.name === sizeName : true)) {
        return { ...item, quantity };
      }
      return item;
    });
    set({ cart: updatedCart });
    const state = get();
    if (state.appliedPromo) {
      state.applyPromoCode(state.appliedPromo.promo.code);
    }
  },

  clearCart: () => {
    set({ cart: [], appliedPromo: null });
  },

  toggleCart: (isOpen) => {
    set({ isCartOpen: isOpen !== undefined ? isOpen : !get().isCartOpen });
  },

  toggleCheckout: (isOpen) => {
    set({ isCheckoutOpen: isOpen !== undefined ? isOpen : !get().isCheckoutOpen });
  },

  applyPromoCode: (codeStr) => {
    const { promoCodes, cart, userSession } = get();
    const cleanCode = codeStr.trim().toUpperCase();
    const promo = promoCodes.find(p => p.code === cleanCode && p.isActive);

    if (!promo) {
      set({ appliedPromo: null });
      return { success: false, message: 'كود الخصم غير صحيح أو غير مفعل' };
    }

    // Check if code was already burned/used
    if (promo.isUsed) {
      set({ appliedPromo: null });
      return { success: false, message: 'عذراً، هذا الكود تم استخدامه من قبل وغير صالح للاستعمال مرة أخرى.' };
    }

    // Check expiry
    if (new Date(promo.expiryDate) < new Date()) {
      return { success: false, message: 'عذراً، انتهت صلاحية هذا الكود' };
    }

    // Check max uses limit
    if (promo.usedCount >= promo.maxUses) {
      return { success: false, message: 'وصل هذا الكود للحد الأقصى من الاستخدام' };
    }

    // Check single-use per user
    const userIdentifier = userSession?.email || 'guest';
    if (promo.usedByUsers && promo.usedByUsers.includes(userIdentifier)) {
      return { success: false, message: 'لقد قمت باستخدام هذا الكود من قبل (استخدام مرة واحدة فقط)' };
    }

    // Calculate subtotal
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    if (subtotal <= 0) {
      return { success: false, message: 'أضف منتجات للسلة أولاً للتحقق من الكود' };
    }

    let discountAmount = 0;
    if (promo.type === 'percentage') {
      discountAmount = (subtotal * promo.value) / 100;
    } else {
      discountAmount = Math.min(promo.value, subtotal);
    }

    set({ appliedPromo: { promo, discountAmount } });
    return { 
      success: true, 
      message: `تم تطبيق الخصم بنجاح! خصم ${promo.type === 'percentage' ? `${promo.value}%` : `${promo.value} ر.س`}`, 
      discount: discountAmount 
    };
  },

  burnPromoCode: (codeStr) => {
    const { promoCodes } = get();
    const cleanCode = codeStr.trim().toUpperCase();
    const promo = promoCodes.find(p => p.code === cleanCode);

    if (!promo) {
      return { success: false, message: 'رمز الكود غير موجود في النظام' };
    }

    if (promo.isUsed) {
      return { success: false, message: `الكود مستخدم من قبل بتاريخ (${promo.usedAt || 'غير متاح'})` };
    }

    const updated = promoCodes.map(p => {
      if (p.code === cleanCode) {
        return {
          ...p,
          isUsed: true,
          usedCount: p.usedCount + 1,
          usedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })
        };
      }
      return p;
    });

    set({ promoCodes: updated });
    return { success: true, message: 'تم حرق/استخدام الكود بنجاح!' };
  },

  removePromoCode: () => {
    set({ appliedPromo: null });
  },

  createOrder: ({ name, phone, email, deliveryType, paymentMethodName, notes }) => {
    const { cart, appliedPromo, userSession, settings } = get();
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
    const deliveryFee = (deliveryType === 'delivery' && settings.deliveryFee) ? settings.deliveryFee : 0;
    const total = Math.max(0, subtotal - discountAmount + deliveryFee);

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: name,
      customerPhone: phone,
      customerEmail: email || userSession?.email,
      items: cart.map(item => ({
        productId: item.product.id,
        nameAr: item.product.nameAr,
        price: item.product.price,
        quantity: item.quantity
      })),
      subtotal,
      discountAmount,
      deliveryFee,
      paymentMethodName,
      promoCodeUsed: appliedPromo ? appliedPromo.promo.code : undefined,
      total,
      status: 'pending',
      deliveryType,
      notes,
      createdAt: new Date().toISOString()
    };

    // Increment promo usage and mark as used (burned)
    if (appliedPromo) {
      const userIdent = email || userSession?.email || 'guest';
      const nowStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' });
      const updatedPromos = get().promoCodes.map(p => {
        if (p.code === appliedPromo.promo.code) {
          return {
            ...p,
            usedCount: p.usedCount + 1,
            isUsed: true,
            usedAt: nowStr,
            usedByUsers: [...(p.usedByUsers || []), userIdent]
          };
        }
        return p;
      });
      set({ promoCodes: updatedPromos });
    }

    // Record customer if new
    const existingCust = get().customers.find(c => c.email === email || (userSession && c.email === userSession.email));
    if (!existingCust && (email || userSession?.email)) {
      const newCust: Customer = {
        uid: `cust-${Date.now()}`,
        name: name,
        email: email || userSession?.email || '',
        photoURL: userSession?.photoURL,
        joinedAt: new Date().toISOString().split('T')[0],
        totalOrdersCount: 1
      };
      set({ customers: [newCust, ...get().customers] });
    } else if (existingCust) {
      set({
        customers: get().customers.map(c => 
          c.uid === existingCust.uid ? { ...c, totalOrdersCount: (c.totalOrdersCount || 0) + 1 } : c
        )
      });
    }

    set({ 
      orders: [newOrder, ...get().orders],
      cart: [],
      appliedPromo: null,
      isCheckoutOpen: false,
      isCartOpen: false
    });

    pushOrdersToCloud(get().orders);
    pushCustomersToCloud(get().customers);

    return newOrder;
  },

  updateOrderStatus: (orderId, status) => {
    const updated = get().orders.map(ord => ord.id === orderId ? { ...ord, status } : ord);
    set({ orders: updated });
    pushOrdersToCloud(updated);
  },

  reorderPastOrder: (order) => {
    const { products, addToCart, toggleCheckout, toggleProfileModal } = get();
    order.items.forEach(item => {
      const matchedProduct = products.find(p => p.id === item.productId) || {
        id: item.productId,
        categoryId: 'cold' as const,
        nameAr: item.nameAr,
        nameEn: item.nameAr,
        price: item.price,
        descriptionAr: 'منتج من طلب سابق',
        ingredients: [],
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
      };
      addToCart(matchedProduct, item.quantity);
    });
    toggleProfileModal(false);
    toggleCheckout(true);
  },

  addCategory: (catData) => {
    const newCat = {
      id: catData.id || `cat-${Date.now()}`,
      nameAr: catData.nameAr,
      nameEn: catData.nameEn || catData.nameAr,
      iconName: catData.iconName || 'Coffee',
      descriptionAr: catData.descriptionAr || '',
      isHidden: false
    };
    const updated = [...get().categories, newCat];
    set({ categories: updated });
    pushCategoriesToCloud(updated);
  },

  updateCategory: (catData) => {
    const updated = get().categories.map(c => c.id === catData.id ? { ...c, ...catData } : c);
    set({ categories: updated });
    pushCategoriesToCloud(updated);
  },

  deleteCategory: (id) => {
    const updated = get().categories.filter(c => c.id !== id);
    set({ categories: updated });
    pushCategoriesToCloud(updated);
  },

  toggleCategoryHidden: (id) => {
    const updated = get().categories.map(c => c.id === id ? { ...c, isHidden: !c.isHidden } : c);
    set({ categories: updated });
    pushCategoriesToCloud(updated);
  },

  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    const updated = [newProduct, ...get().products];
    set({ products: updated });
    pushProductsToCloud(updated);
  },

  addProductsBulk: (productsData) => {
    const newProducts: Product[] = productsData.map((p, i) => ({
      ...p,
      id: `prod-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`
    }));
    const updated = [...newProducts, ...get().products];
    set({ products: updated });
    pushProductsToCloud(updated);
  },

  updateProduct: (product) => {
    const updated = get().products.map(p => p.id === product.id ? product : p);
    set({ products: updated });
    pushProductsToCloud(updated);
  },

  deleteProduct: (id) => {
    const updated = get().products.filter(p => p.id !== id);
    set({ products: updated });
    pushProductsToCloud(updated);
  },

  resetToInitialData: () => {
    set({
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      promoCodes: INITIAL_PROMO_CODES,
      settings: INITIAL_SETTINGS
    });
    pushProductsToCloud(INITIAL_PRODUCTS);
    pushCategoriesToCloud(INITIAL_CATEGORIES);
    pushPromoCodesToCloud(INITIAL_PROMO_CODES);
    pushSettingsToCloud(INITIAL_SETTINGS);
  },

  addPromoCode: (promoData) => {
    const newPromo: PromoCode = {
      ...promoData,
      id: `promo-${Date.now()}`,
      usedCount: 0,
      usedByUsers: []
    };
    const updated = [newPromo, ...get().promoCodes];
    set({ promoCodes: updated });
    pushPromoCodesToCloud(updated);
  },

  addPromoCodesBulk: (promosData) => {
    const newPromos: PromoCode[] = promosData.map((promoData, idx) => ({
      ...promoData,
      id: `promo-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
      usedCount: 0,
      usedByUsers: []
    }));
    const updated = [...newPromos, ...get().promoCodes];
    set({ promoCodes: updated });
    pushPromoCodesToCloud(updated);
  },

  updatePromoCode: (promo) => {
    const updated = get().promoCodes.map(p => p.id === promo.id ? promo : p);
    set({ promoCodes: updated });
    pushPromoCodesToCloud(updated);
  },

  deletePromoCode: (id) => {
    const updated = get().promoCodes.filter(p => p.id !== id);
    set({ promoCodes: updated });
    pushPromoCodesToCloud(updated);
  },

  updateSettings: (newSettings) => {
    const updatedSettings = { ...get().settings, ...newSettings };
    set({ settings: updatedSettings });
    pushSettingsToCloud(updatedSettings);
  },

  setUserSession: (session) => {
    set({ userSession: session });
  },

  toggleAdminModal: (isOpen) => {
    set({ isAdminModalOpen: isOpen !== undefined ? isOpen : !get().isAdminModalOpen });
  },

  toggleCouponModal: (isOpen) => {
    set({ isCouponModalOpen: isOpen !== undefined ? isOpen : !get().isCouponModalOpen });
  },

  toggleProfileModal: (isOpen) => {
    set({ isProfileModalOpen: isOpen !== undefined ? isOpen : !get().isProfileModalOpen });
  },

  toggleAuthModal: (isOpen) => {
    set({ isAuthModalOpen: isOpen !== undefined ? isOpen : !get().isAuthModalOpen });
  },

  setActiveAdminTab: (tab) => {
    set({ activeAdminTab: tab });
  }
}),
    {
      name: 'cortado_cafe_store_v4',
      partialize: (state) => ({
        categories: state.categories,
        products: state.products,
        promoCodes: state.promoCodes,
        orders: state.orders,
        customers: state.customers,
        settings: state.settings,
        userSession: state.userSession,
        cart: state.cart,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Fallback to initial defaults ONLY if state slices are missing/empty
          if (!state.categories || state.categories.length === 0) {
            state.categories = INITIAL_CATEGORIES;
          }
          if (!state.products || state.products.length === 0) {
            state.products = INITIAL_PRODUCTS;
          }
          if (!state.settings) {
            state.settings = INITIAL_SETTINGS;
          } else {
            // Merge defaults for missing properties while strictly preserving admin modifications
            state.settings = {
              ...INITIAL_SETTINGS,
              ...state.settings,
              socials: {
                ...INITIAL_SETTINGS.socials,
                ...(state.settings.socials || {})
              },
              branches: (state.settings.branches && state.settings.branches.length > 0)
                ? state.settings.branches
                : INITIAL_SETTINGS.branches,
              paymentMethods: (state.settings.paymentMethods && state.settings.paymentMethods.length > 0)
                ? state.settings.paymentMethods
                : INITIAL_SETTINGS.paymentMethods
            };
          }
          if (!state.categories.some(c => c.id === state.activeCategoryId)) {
            state.activeCategoryId = state.categories[0]?.id || 'cat-1';
          }
        }
      },
    }
  )
);
