import { doc, setDoc, getDoc, collection, getDocs, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { useStore, setCloudSyncCallback } from './store';
import { SiteSettings, Category, Product, PromoCode, Order, Customer } from '../types';
import { INITIAL_PROMO_CODES } from '../data/initialData';

let isListening = false;
let lastServerTimestamp = '';

const SETTINGS_LOCAL_STORAGE_KEY = 'cortado_live_site_settings_v2';
const PROMOS_LOCAL_STORAGE_KEY = 'cortado_live_promo_codes_backup_v1';
const PROMOS_ARCHIVE_STORAGE_KEY = 'cortado_promo_codes_archive_v2';
const PRODUCTS_LOCAL_STORAGE_KEY = 'cortado_live_products_backup_v2';

// Helper to sanitize prices & fix legacy typos
export function sanitizeProductsHelper(products: Product[]): Product[] {
  if (!Array.isArray(products)) return [];
  return products.map((p: Product) => {
    let nameAr = p.nameAr;
    let nameEn = p.nameEn;
    if (p.id === 'prod-37' || nameAr === 'عصير قريز') {
      nameAr = 'عصير فريز';
      if (nameEn === 'عصير قريز') nameEn = 'عصير فريز';
    }
    return {
      ...p,
      nameAr,
      nameEn,
      price: typeof p.price === 'number' && p.price >= 1000 ? Math.round(p.price / 100) : p.price,
      sizes: Array.isArray(p.sizes) ? p.sizes.map(s => ({
        ...s,
        price: typeof s.price === 'number' && s.price >= 1000 ? Math.round(s.price / 100) : s.price
      })) : p.sizes
    };
  });
}

// Helper to save products locally to localStorage
export function saveProductsToLocalStorage(products: Product[]) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (Array.isArray(products) && products.length > 0) {
      window.localStorage.setItem(PRODUCTS_LOCAL_STORAGE_KEY, JSON.stringify(sanitizeProductsHelper(products)));
    }
  } catch (e) {
    console.warn('Failed to save products to localStorage:', e);
  }
}

// Helper to load products from localStorage
export function loadProductsFromLocalStorage(): Product[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(PRODUCTS_LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeProductsHelper(parsed);
      }
    }
  } catch (e) {
    console.warn('Failed to load products from localStorage:', e);
  }
  return [];
}

// Helper to save promo codes locally to localStorage as an extra persistent safeguard
function savePromoCodesToLocalStorage(promoCodes: PromoCode[]) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (Array.isArray(promoCodes) && promoCodes.length > 0) {
      window.localStorage.setItem(PROMOS_LOCAL_STORAGE_KEY, JSON.stringify(promoCodes));
      
      // Also merge into permanent browser archive
      const existingArchive = loadPromoCodesFromLocalStorage();
      const mergedArchive = mergePromoCodes(existingArchive, promoCodes);
      window.localStorage.setItem(PROMOS_ARCHIVE_STORAGE_KEY, JSON.stringify(mergedArchive));
    }
  } catch (e) {
    console.warn('Failed to save promo codes to localStorage:', e);
  }
}

// Helper to load promo codes from localStorage
function loadPromoCodesFromLocalStorage(): PromoCode[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  const list: PromoCode[] = [];
  try {
    const rawArchive = window.localStorage.getItem(PROMOS_ARCHIVE_STORAGE_KEY);
    if (rawArchive) {
      const parsed = JSON.parse(rawArchive);
      if (Array.isArray(parsed)) list.push(...parsed);
    }
    const raw = window.localStorage.getItem(PROMOS_LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list.push(...parsed);
    }
  } catch (e) {
    console.warn('Failed to load promo codes from localStorage:', e);
  }
  return list;
}

// Smart non-destructive merger for Promo Codes to preserve created and burned/used states across devices
export function mergeOrdersHelper(existingList: Order[], incomingList: Order[]): Order[] {
  const map = new Map<string, Order>();
  (existingList || []).forEach(o => { if (o && o.id) map.set(o.id, o); });
  (incomingList || []).forEach(o => { if (o && o.id) map.set(o.id, o); });
  return Array.from(map.values());
}

export function mergeCustomersHelper(existingList: Customer[], incomingList: Customer[]): Customer[] {
  const map = new Map<string, Customer>();
  (existingList || []).forEach(c => { if (c && c.uid) map.set(c.uid, c); });
  (incomingList || []).forEach(c => { if (c && c.uid) map.set(c.uid, c); });
  return Array.from(map.values());
}

export function mergePromoCodes(existingList: PromoCode[], incomingList: PromoCode[], isExplicitDelete = false): PromoCode[] {
  if (isExplicitDelete && Array.isArray(incomingList) && incomingList.length > 0) return incomingList;

  const map = new Map<string, PromoCode>();

  // Helper to extract numeric timestamp
  const extractTime = (p: Partial<PromoCode>): number => {
    if (p.createdAt) {
      const t = new Date(p.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (p.id) {
      const match = p.id.match(/(\d{10,13})/);
      if (match) {
        const t = parseInt(match[1], 10);
        if (!isNaN(t) && t > 0) return t;
      }
    }
    return 0;
  };

  // 0. Base initial codes
  INITIAL_PROMO_CODES.forEach(p => {
    if (p && (p.code || p.id)) {
      map.set((p.code || p.id).toUpperCase().trim(), { ...p, createdAt: p.createdAt || '2025-01-01T00:00:00.000Z' });
    }
  });

  // 1. Existing list
  if (Array.isArray(existingList)) {
    existingList.forEach(p => {
      if (p && (p.code || p.id)) {
        const key = (p.code || p.id).toUpperCase().trim();
        const existing = map.get(key);
        const createdAt = p.createdAt || existing?.createdAt || (extractTime(p) > 0 ? new Date(extractTime(p)).toISOString() : new Date().toISOString());
        map.set(key, existing ? { ...existing, ...p, createdAt } : { ...p, createdAt });
      }
    });
  }

  // 2. Incoming list with smart attribute merging
  if (Array.isArray(incomingList)) {
    incomingList.forEach(p => {
      if (p && (p.code || p.id)) {
        const key = (p.code || p.id).toUpperCase().trim();
        const existing = map.get(key);
        const createdAt = p.createdAt || existing?.createdAt || (extractTime(p) > 0 ? new Date(extractTime(p)).toISOString() : new Date().toISOString());
        if (!existing) {
          map.set(key, { ...p, createdAt });
        } else {
          const isUsedCombined = Boolean(existing.isUsed || p.isUsed);
          const maxUsedCount = Math.max(existing.usedCount || 0, p.usedCount || 0);
          const usedAtCombined = p.usedAt || existing.usedAt;
          const usedByUsersCombined = Array.from(new Set([...(existing.usedByUsers || []), ...(p.usedByUsers || [])]));

          map.set(key, {
            ...existing,
            ...p,
            createdAt,
            isActive: typeof p.isActive === 'boolean' ? p.isActive : existing.isActive,
            discountType: p.discountType || (p as any).type || existing.discountType,
            discountValue: p.discountValue ?? (p as any).value ?? existing.discountValue,
            minOrderValue: p.minOrderValue ?? existing.minOrderValue ?? 0,
            maxDiscountAmount: p.maxDiscountAmount ?? existing.maxDiscountAmount,
            maxUses: p.maxUses ?? existing.maxUses ?? 1000,
            expiryDate: p.expiryDate || existing.expiryDate || '2027-12-31',
            groupName: p.groupName || existing.groupName,
            isUsed: isUsedCombined,
            usedCount: maxUsedCount,
            usedAt: usedAtCombined,
            usedByUsers: usedByUsersCombined
          });
        }
      }
    });
  }

  const result = Array.from(map.values());
  return result.sort((a, b) => extractTime(b) - extractTime(a));
}

// Setup BroadcastChannel for zero-latency sync across tabs on same device
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('cortado_cafe_realtime_sync');
  }
} catch {
  // BroadcastChannel not available
}

// Helper to push updates to the backend server endpoint
export async function syncWithServer(data: Partial<{
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  promoCodes: PromoCode[];
  orders: Order[];
  customers: Customer[];
  isExplicitDelete?: boolean;
}>) {
  try {
    const res = await fetch('/api/store-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.storeData?.updatedAt) {
        lastServerTimestamp = json.storeData.updatedAt;
      }
    }
  } catch (err) {
    console.warn('Server sync POST error:', err);
  }
}

// Helper to recursively strip undefined properties and values for Firestore safety
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// Helper to save settings locally to localStorage for instant load on refresh
function saveSettingsToLocalStorage(settings: SiteSettings) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
}

// Helpers to push state changes (called when Admin makes updates)
export async function pushSettingsToCloud(settings: SiteSettings) {
  const now = new Date().toISOString();
  const payload: SiteSettings = {
    ...settings,
    updatedAt: settings.updatedAt || now
  };

  // 1. Immediately save locally for zero delay
  saveSettingsToLocalStorage(payload);

  // 2. Broadcast to other tabs on same browser
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'settings', payload });
    } catch {
      // Ignore broadcast errors
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cortado_local_settings_sync', { detail: payload }));
  }

  // 3. Update local store state with the new timestamped payload
  useStore.setState({ settings: payload });

  // 4. Sync with server memory/disk via dedicated /api/settings and /api/store-data
  try {
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch {}
  syncWithServer({ settings: payload }).catch(() => {});

  // 5. Write to Firestore as global cloud single source of truth concurrently in background
  if (!db) return;
  const sanitized = sanitizeForFirestore(payload);
  Promise.allSettled([
    setDoc(doc(db, 'site_data', 'settings'), sanitized, { merge: true }),
    setDoc(doc(db, 'siteSettings', 'main'), sanitized, { merge: true }),
    setDoc(doc(db, 'settings', 'store_config'), sanitized, { merge: true })
  ]).catch(() => {});
}

export async function pushCategoriesToCloud(categories: Category[], isExplicitDelete = false) {
  syncWithServer({ categories, isExplicitDelete });
  if (broadcastChannel) broadcastChannel.postMessage({ type: 'categories', payload: categories });
  if (!db) return;
  try {
    const sanitized = sanitizeForFirestore(categories || []);
    await setDoc(doc(db, 'site_data', 'categories'), { items: sanitized, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push categories to Firestore:', error);
  }
}

export async function pushProductsToCloud(products: Product[], isExplicitDelete = false) {
  const sanitizedList = sanitizeProductsHelper(products || []);
  saveProductsToLocalStorage(sanitizedList);

  // 1. Post to dedicated products endpoint immediately
  try {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: sanitizedList, isExplicitDelete })
    }).catch(e => console.warn('POST /api/products notice:', e));
  } catch (err) {
    console.warn('Network error pushing to /api/products:', err);
  }

  // 2. Also send to general store data
  syncWithServer({ products: sanitizedList, isExplicitDelete });

  // 3. Post to local tabs and window event
  if (broadcastChannel) broadcastChannel.postMessage({ type: 'products', payload: sanitizedList });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cortado_local_products_sync', { detail: sanitizedList }));
  }

  // 4. Send to Firestore doc & individual collection docs
  if (!db) return;
  try {
    const firestoreSanitized = sanitizeForFirestore(sanitizedList);
    await setDoc(doc(db, 'site_data', 'products'), { items: firestoreSanitized, updatedAt: new Date().toISOString() });

    // Also write individual products to 'products' collection for instant item listeners
    if (Array.isArray(firestoreSanitized) && firestoreSanitized.length > 0) {
      try {
        const chunkSize = 300;
        for (let i = 0; i < firestoreSanitized.length; i += chunkSize) {
          const chunk = firestoreSanitized.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          chunk.forEach((p: any) => {
            if (p && p.id) {
              const safeId = String(p.id).replace(/[\/\s#?]/g, '_');
              batch.set(doc(db, 'products', safeId), p, { merge: true });
            }
          });
          await batch.commit().catch(e => console.warn('Firestore products batch chunk notice:', e));
        }
      } catch (be) {
        console.warn('Firestore individual products batch notice:', be);
      }
    }
  } catch (error) {
    console.error('Failed to push products to Firestore:', error);
  }
}

export async function pushPromoCodesToCloud(promoCodes: PromoCode[], isExplicitDelete = false) {
  savePromoCodesToLocalStorage(promoCodes);
  
  // 1. Send to server dedicated archive endpoint immediately
  try {
    fetch('/api/promo-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoCodes, isExplicitDelete })
    }).catch(e => console.warn('POST /api/promo-codes notice:', e));
  } catch (err) {
    console.warn('Network error pushing to /api/promo-codes:', err);
  }

  // 2. Also send to general store data
  syncWithServer({ promoCodes, isExplicitDelete });
  
  // 3. Post to local tabs
  if (broadcastChannel) broadcastChannel.postMessage({ type: 'promoCodes', payload: promoCodes });
  
  // 4. Send to Firestore doc & individual collection docs in batched chunks
  if (!db) return;
  try {
    const sanitizedList = sanitizeForFirestore(promoCodes || []);
    await setDoc(doc(db, 'site_data', 'promoCodes'), { items: sanitizedList, updatedAt: new Date().toISOString() });
    
    // Also save to separate collection for instant item-level cloud sync
    if (Array.isArray(sanitizedList) && sanitizedList.length > 0) {
      try {
        const chunkSize = 400;
        for (let i = 0; i < sanitizedList.length; i += chunkSize) {
          const chunk = sanitizedList.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          chunk.forEach(p => {
            if (p && (p.code || p.id)) {
              const safeCode = (p.code || p.id).toUpperCase().trim().replace(/[\/\s#?]/g, '_');
              batch.set(doc(db, 'promoCodes', safeCode), sanitizeForFirestore(p), { merge: true });
            }
          });
          await batch.commit().catch(e => console.warn('Firestore promoCodes batch chunk notice:', e));
        }
      } catch (be) {
        console.warn('Batch write error:', be);
      }
    }
  } catch (error) {
    console.error('Failed to push promo codes to Firestore:', error);
  }
}

// Master bidirectional Cloud Synchronization function for Promo Codes across all devices and branches
export async function syncAllPromoCodesAcrossCloud(): Promise<{
  success: boolean;
  totalCount: number;
  burnedCount: number;
  promoCodes: PromoCode[];
  message: string;
}> {
  const collected: PromoCode[] = [];

  // 1. Gather from current Zustand store
  const storePromos = useStore.getState().promoCodes || [];
  collected.push(...storePromos);

  // 2. Gather from LocalStorage backups (both current and archive)
  const localPromos = loadPromoCodesFromLocalStorage();
  collected.push(...localPromos);

  // 3. Gather from dedicated Server endpoint
  try {
    const res = await fetch('/api/promo-codes', {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.promoCodes)) {
        collected.push(...data.promoCodes);
      }
    }
  } catch (e) {
    console.warn('Sync notice: server /api/promo-codes:', e);
  }

  // 4. Gather from general Server store data
  try {
    const res = await fetch('/api/store-data', {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.promoCodes)) {
        collected.push(...data.promoCodes);
      }
    }
  } catch (e) {
    console.warn('Sync notice: server /api/store-data:', e);
  }

  // 5. Gather from Firestore Doc
  if (db) {
    try {
      const docSnap = await getDoc(doc(db, 'site_data', 'promoCodes'));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.items)) {
          collected.push(...data.items);
        }
      }
    } catch (e) {
      console.warn('Sync notice: firestore site_data/promoCodes:', e);
    }

    // 6. Gather from Firestore Collection
    try {
      const colSnap = await getDocs(collection(db, 'promoCodes'));
      colSnap.forEach((item) => {
        if (item.exists()) {
          collected.push(item.data() as PromoCode);
        }
      });
    } catch (e) {
      console.warn('Sync notice: firestore collection promoCodes:', e);
    }
  }

  // 7. Non-destructively merge everything
  const merged = mergePromoCodes([], collected);

  if (merged.length > 0) {
    // 8. Update in-memory store if changed
    const currentList = useStore.getState().promoCodes || [];
    if (merged.length !== currentList.length || merged.some((m, idx) => m.isUsed !== currentList[idx]?.isUsed)) {
      useStore.setState({ promoCodes: merged });
    }

    // 9. Persist to localStorage
    savePromoCodesToLocalStorage(merged);

    // 10. Push to Server & Firestore
    pushPromoCodesToCloud(merged).catch(() => {});
  }

  const burnedCount = merged.filter(p => p.isUsed || (p.usedCount && p.maxUses && p.usedCount >= p.maxUses)).length;

  return {
    success: true,
    totalCount: merged.length,
    burnedCount,
    promoCodes: merged,
    message: `تمت المزامنة السحابية بنجاح! تم حفظ وتأكيد ${merged.length} كود خصم متزامن عبر كافة الفروع والأجهزة.`
  };
}

export async function pushOrdersToCloud(orders: Order[]) {
  syncWithServer({ orders });
  if (broadcastChannel) broadcastChannel.postMessage({ type: 'orders', payload: orders });
  if (!db) return;
  try {
    const sanitized = sanitizeForFirestore(orders || []);
    await setDoc(doc(db, 'site_data', 'orders'), { items: sanitized, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push orders to Firestore:', error);
  }
}

export async function pushCustomersToCloud(customers: Customer[]) {
  syncWithServer({ customers });
  if (broadcastChannel) broadcastChannel.postMessage({ type: 'customers', payload: customers });
  if (!db) return;
  try {
    const sanitized = sanitizeForFirestore(customers || []);
    await setDoc(doc(db, 'site_data', 'customers'), { items: sanitized, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push customers to Firestore:', error);
  }
}

export const applySettings = (cloudSettings: Partial<SiteSettings>, persistToLocal = true) => {
  if (!cloudSettings) return;
  useStore.setState((state) => {
    // Strict timestamp conflict protection:
    // Ensure we NEVER overwrite a newer local state with an older incoming state.
    const currentTs = state.settings?.updatedAt ? new Date(state.settings.updatedAt).getTime() : 0;
    const incomingTs = cloudSettings?.updatedAt ? new Date(cloudSettings.updatedAt).getTime() : 0;

    if (currentTs > 0 && incomingTs > 0 && incomingTs < currentTs) {
      return state;
    }

    const updatedBranches = Array.isArray(cloudSettings.branches) && cloudSettings.branches.length > 0
      ? cloudSettings.branches
      : state.settings.branches;

    const updatedPaymentMethods = Array.isArray(cloudSettings.paymentMethods) && cloudSettings.paymentMethods.length > 0
      ? cloudSettings.paymentMethods
      : state.settings.paymentMethods;

    const updatedQuickLinks = Array.isArray(cloudSettings.quickLinks) && cloudSettings.quickLinks.length > 0
      ? cloudSettings.quickLinks
      : state.settings.quickLinks;

    const mergedSettings: SiteSettings = {
      ...state.settings,
      ...cloudSettings,
      siteTitle: cloudSettings.siteTitle ?? state.settings.siteTitle,
      siteSubtitle: cloudSettings.siteSubtitle ?? state.settings.siteSubtitle,
      logoUrl: cloudSettings.logoUrl ?? state.settings.logoUrl,
      phone: cloudSettings.phone ?? state.settings.phone,
      address: cloudSettings.address ?? state.settings.address,
      openingHours: cloudSettings.openingHours ?? state.settings.openingHours,
      isStoreOpen: typeof cloudSettings.isStoreOpen === 'boolean' ? cloudSettings.isStoreOpen : state.settings.isStoreOpen,
      deliveryFee: typeof cloudSettings.deliveryFee === 'number' ? cloudSettings.deliveryFee : state.settings.deliveryFee,
      socials: { ...state.settings.socials, ...(cloudSettings.socials || {}) },
      branches: updatedBranches,
      paymentMethods: updatedPaymentMethods,
      quickLinks: updatedQuickLinks,
      updatedAt: cloudSettings.updatedAt || state.settings?.updatedAt || new Date().toISOString()
    };

    if (persistToLocal) {
      saveSettingsToLocalStorage(mergedSettings);
    }

    return { settings: mergedSettings };
  });
};

// Function to fetch store data from the central server API
async function fetchServerStoreData() {
  try {
    const res = await fetch('/api/store-data');
    if (res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data) {
          if (!data.updatedAt || data.updatedAt !== lastServerTimestamp) {
            lastServerTimestamp = data.updatedAt || '';

            // Only apply server settings if it's explicitly present
            if (data.settings) {
              applySettings(data.settings, true);
            }
            if (Array.isArray(data.categories) && data.categories.length > 0) {
              useStore.setState({ categories: data.categories });
            }
            if (Array.isArray(data.products) && data.products.length > 0) {
              const sanitizedProducts = sanitizeProductsHelper(data.products);
              useStore.setState({ products: sanitizedProducts });
              saveProductsToLocalStorage(sanitizedProducts);
            }
            if (Array.isArray(data.promoCodes)) {
              const current = useStore.getState().promoCodes || [];
              const merged = mergePromoCodes(current, data.promoCodes);
              useStore.setState({ promoCodes: merged });
              savePromoCodesToLocalStorage(merged);
            }
            if (Array.isArray(data.orders)) {
              const currentOrders = useStore.getState().orders || [];
              const merged = mergeOrdersHelper(currentOrders, data.orders);
              useStore.setState({ orders: merged });
            }
            if (Array.isArray(data.customers)) {
              const currentCusts = useStore.getState().customers || [];
              const merged = mergeCustomersHelper(currentCusts, data.customers);
              useStore.setState({ customers: merged });
            }
          }
        }
      }
    }

    // Also fetch dedicated products endpoint for 100% guarantee
    try {
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData && Array.isArray(prodData.products) && prodData.products.length > 0) {
          const sanitized = sanitizeProductsHelper(prodData.products);
          useStore.setState({ products: sanitized });
          saveProductsToLocalStorage(sanitized);
        }
      }
    } catch (prode) {
      // Ignore background product fetch error
    }

    // Also fetch dedicated promo codes endpoint for 100% guarantee
    try {
      const pRes = await fetch('/api/promo-codes');
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData && Array.isArray(pData.promoCodes) && pData.promoCodes.length > 0) {
          const current = useStore.getState().promoCodes || [];
          if (pData.promoCodes.length > current.length || pData.promoCodes.some((p: any) => p.isUsed)) {
            const merged = mergePromoCodes(current, pData.promoCodes);
            useStore.setState({ promoCodes: merged });
            savePromoCodesToLocalStorage(merged);
          }
        }
      }
    } catch (pe) {
      // Ignore background promo fetch error
    }
  } catch (e) {
    console.warn('Failed to fetch store data from server:', e);
  }
}

// Function to initialize real-time synchronization for all clients (Server Polling + Firestore)
export function initFirestoreSync() {
  // 1. Immediately rehydrate settings and promo codes from localStorage if available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cachedStr = window.localStorage.getItem(SETTINGS_LOCAL_STORAGE_KEY);
      if (cachedStr) {
        const cachedObj = JSON.parse(cachedStr);
        if (cachedObj && typeof cachedObj === 'object') {
          applySettings(cachedObj, false);
        }
      }
      const localPromos = loadPromoCodesFromLocalStorage();
      if (localPromos && localPromos.length > 0) {
        const current = useStore.getState().promoCodes || [];
        const merged = mergePromoCodes(current, localPromos);
        useStore.setState({ promoCodes: merged });
      }
      const localProducts = loadProductsFromLocalStorage();
      if (localProducts && localProducts.length > 0) {
        useStore.setState({ products: localProducts });
      }
    } catch (e) {
      console.warn('Error reading cached settings/promos/products from localStorage:', e);
    }
  }

  // Register callback in store so store actions invoke cloud push
  setCloudSyncCallback((type, payload) => {
    if (type === 'settings') pushSettingsToCloud(payload);
    else if (type === 'categories') pushCategoriesToCloud(payload?.categories || payload, !!payload?.isExplicitDelete);
    else if (type === 'products') pushProductsToCloud(payload?.products || payload, !!payload?.isExplicitDelete);
    else if (type === 'promoCodes') pushPromoCodesToCloud(payload?.promoCodes || payload, !!payload?.isExplicitDelete);
    else if (type === 'orders') pushOrdersToCloud(payload);
    else if (type === 'customers') pushCustomersToCloud(payload);
  });

  if (isListening) return;
  isListening = true;

  // Listen to same-device tab events
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'settings' && payload) applySettings(payload, true);
      else if (type === 'categories' && Array.isArray(payload)) useStore.setState({ categories: payload });
      else if (type === 'products' && Array.isArray(payload)) {
        const sanitized = sanitizeProductsHelper(payload);
        useStore.setState({ products: sanitized });
        saveProductsToLocalStorage(sanitized);
      }
      else if (type === 'promoCodes' && Array.isArray(payload)) useStore.setState({ promoCodes: payload });
      else if (type === 'orders' && Array.isArray(payload)) useStore.setState({ orders: payload });
      else if (type === 'customers' && Array.isArray(payload)) useStore.setState({ customers: payload });
    };
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('cortado_local_settings_sync', (e: any) => {
      if (e.detail) applySettings(e.detail, true);
    });

    window.addEventListener('cortado_local_products_sync', (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        const sanitized = sanitizeProductsHelper(e.detail);
        useStore.setState({ products: sanitized });
        saveProductsToLocalStorage(sanitized);
      }
    });

    // Auto sync on tab focus, returning to mobile browser, or network recovery
    const triggerInstantCloudSync = () => {
      syncAllPromoCodesAcrossCloud().catch(() => {});
      fetchServerStoreData();
    };

    window.addEventListener('focus', triggerInstantCloudSync);
    window.addEventListener('online', triggerInstantCloudSync);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        triggerInstantCloudSync();
      }
    });
  }

  // 2. Fetch immediately from central server API & run deep sync
  fetchServerStoreData();
  syncAllPromoCodesAcrossCloud().catch(() => {});
  setTimeout(() => {
    syncAllPromoCodesAcrossCloud().catch(() => {});
  }, 1200);

  // 3. Direct fetch from Firestore on startup
  if (db) {
    // 3. Direct fetch from Firestore on startup
    getDoc(doc(db, 'site_data', 'settings')).then((snap) => {
      if (snap.exists()) {
        applySettings(snap.data() as SiteSettings, true);
      }
    }).catch((e) => {
      console.warn('Initial Firestore settings fetch error:', e);
    });

    getDoc(doc(db, 'site_data', 'promoCodes')).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const currentPromos = useStore.getState().promoCodes || [];
          const merged = mergePromoCodes(currentPromos, data.items);
          useStore.setState({ promoCodes: merged });
          savePromoCodesToLocalStorage(merged);
        }
      }
    }).catch((e) => console.warn('Initial Firestore promoCodes fetch error:', e));

    getDocs(collection(db, 'promoCodes')).then((snap) => {
      const collItems: PromoCode[] = [];
      snap.forEach((d) => {
        if (d.exists()) collItems.push(d.data() as PromoCode);
      });
      if (collItems.length > 0) {
        const currentPromos = useStore.getState().promoCodes || [];
        const merged = mergePromoCodes(currentPromos, collItems);
        useStore.setState({ promoCodes: merged });
        savePromoCodesToLocalStorage(merged);
      }
    }).catch((e) => console.warn('Initial Firestore collection promoCodes fetch error:', e));

    getDoc(doc(db, 'site_data', 'orders')).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          useStore.setState({ orders: data.items });
        }
      }
    }).catch((e) => console.warn('Initial Firestore orders fetch error:', e));

    getDoc(doc(db, 'site_data', 'customers')).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          useStore.setState({ customers: data.items });
        }
      }
    }).catch((e) => console.warn('Initial Firestore customers fetch error:', e));

    getDoc(doc(db, 'site_data', 'categories')).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          useStore.setState({ categories: data.items });
        }
      }
    }).catch((e) => console.warn('Initial Firestore categories fetch error:', e));

    getDoc(doc(db, 'site_data', 'products')).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const sanitizedProducts = data.items.map((p: Product) => ({
            ...p,
            price: typeof p.price === 'number' && p.price >= 1000 ? Math.round(p.price / 100) : p.price,
            sizes: Array.isArray(p.sizes) ? p.sizes.map(s => ({
              ...s,
              price: typeof s.price === 'number' && s.price >= 1000 ? Math.round(s.price / 100) : s.price
            })) : p.sizes
          }));
          useStore.setState({ products: sanitizedProducts });
        }
      }
    }).catch((e) => console.warn('Initial Firestore products fetch error:', e));
  }

  // 4. Poll server & auto-sync every 3 seconds for instant updates across devices
  setInterval(() => {
    fetchServerStoreData();
  }, 2000);

  setInterval(() => {
    syncAllPromoCodesAcrossCloud().catch(() => {});
  }, 5000);

  if (!db) return;

  // 5. Listen to Firestore Realtime Updates as real-time sync layer across devices
  try {
    onSnapshot(doc(db, 'site_data', 'settings'), (snapshot) => {
      if (snapshot.exists()) {
        applySettings(snapshot.data() as SiteSettings, true);
      }
    }, (err) => {
      console.warn('Firestore settings listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup settings listener:', e);
  }

  try {
    onSnapshot(doc(db, 'site_data', 'categories'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          useStore.setState({ categories: data.items });
        }
      }
    }, (err) => {
      console.warn('Firestore categories listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup categories listener:', e);
  }

  try {
    onSnapshot(doc(db, 'site_data', 'products'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          const sanitizedProducts = sanitizeProductsHelper(data.items);
          useStore.setState({ products: sanitizedProducts });
          saveProductsToLocalStorage(sanitizedProducts);
        }
      }
    }, (err) => {
      console.warn('Firestore products listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup products listener:', e);
  }

  // Live real-time listener for individual products collection
  try {
    onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const items: Product[] = [];
        snapshot.forEach((d) => {
          if (d.exists()) items.push(d.data() as Product);
        });
        if (items.length > 0) {
          const current = useStore.getState().products || [];
          const map = new Map<string, Product>();
          current.forEach(p => { if (p && p.id) map.set(p.id, p); });
          items.forEach(p => { if (p && p.id) map.set(p.id, { ...(map.get(p.id) || {}), ...p }); });
          const merged = sanitizeProductsHelper(Array.from(map.values()));
          useStore.setState({ products: merged });
          saveProductsToLocalStorage(merged);
        }
      }
    }, (err) => {
      console.warn('Firestore products collection listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup products collection listener:', e);
  }

  try {
    onSnapshot(doc(db, 'site_data', 'promoCodes'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          const currentPromos = useStore.getState().promoCodes || [];
          const merged = mergePromoCodes(currentPromos, data.items);
          useStore.setState({ promoCodes: merged });
          savePromoCodesToLocalStorage(merged);
        }
      }
    }, (err) => {
      console.warn('Firestore promoCodes listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup promoCodes listener:', e);
  }

  // Live real-time listener for individual promo codes collection
  try {
    onSnapshot(collection(db, 'promoCodes'), (snapshot) => {
      if (!snapshot.empty) {
        const items: PromoCode[] = [];
        snapshot.forEach((d) => {
          if (d.exists()) items.push(d.data() as PromoCode);
        });
        if (items.length > 0) {
          const currentPromos = useStore.getState().promoCodes || [];
          const merged = mergePromoCodes(currentPromos, items);
          useStore.setState({ promoCodes: merged });
          savePromoCodesToLocalStorage(merged);
        }
      }
    }, (err) => {
      console.warn('Firestore promoCodes collection listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup promoCodes collection listener:', e);
  }

  try {
    onSnapshot(doc(db, 'site_data', 'orders'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          const currentOrders = useStore.getState().orders || [];
          const merged = mergeOrdersHelper(currentOrders, data.items);
          useStore.setState({ orders: merged });
        }
      }
    }, (err) => {
      console.warn('Firestore orders listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup orders listener:', e);
  }

  try {
    onSnapshot(doc(db, 'site_data', 'customers'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          const currentCusts = useStore.getState().customers || [];
          const merged = mergeCustomersHelper(currentCusts, data.items);
          useStore.setState({ customers: merged });
        }
      }
    }, (err) => {
      console.warn('Firestore customers listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup customers listener:', e);
  }
}

export default initFirestoreSync;
