import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useStore, setCloudSyncCallback } from './store';
import { SiteSettings, Category, Product, PromoCode, Order, Customer } from '../types';

let isListening = false;
let lastServerTimestamp = '';

const SETTINGS_LOCAL_STORAGE_KEY = 'cortado_live_site_settings_v2';
const PROMOS_LOCAL_STORAGE_KEY = 'cortado_live_promo_codes_backup_v1';

// Helper to save promo codes locally to localStorage as an extra persistent safeguard
function savePromoCodesToLocalStorage(promoCodes: PromoCode[]) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (Array.isArray(promoCodes) && promoCodes.length > 0) {
      window.localStorage.setItem(PROMOS_LOCAL_STORAGE_KEY, JSON.stringify(promoCodes));
    }
  } catch (e) {
    console.warn('Failed to save promo codes to localStorage:', e);
  }
}

// Helper to load promo codes from localStorage
function loadPromoCodesFromLocalStorage(): PromoCode[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(PROMOS_LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load promo codes from localStorage:', e);
  }
  return [];
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

// Helper to save settings locally to localStorage for instant load on refresh
function saveSettingsToLocalStorage(settings: SiteSettings) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify({
      ...settings,
      updatedAt: new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
}

// Helpers to push state changes (called when Admin makes updates)
export async function pushSettingsToCloud(settings: SiteSettings) {
  const payload: SiteSettings = {
    ...settings,
    updatedAt: new Date().toISOString()
  };

  // 1. Immediately save locally for zero delay
  saveSettingsToLocalStorage(payload);

  // 2. Sync with server memory/disk
  syncWithServer({ settings: payload });

  // 3. Broadcast to other tabs on same browser
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

  // 4. Update local store state with the new timestamped payload
  useStore.setState({ settings: payload });

  // 5. Write to Firestore as global cloud single source of truth concurrently in background
  if (!db) return;
  Promise.allSettled([
    setDoc(doc(db, 'site_data', 'settings'), payload, { merge: true }),
    setDoc(doc(db, 'siteSettings', 'main'), payload, { merge: true }),
    setDoc(doc(db, 'settings', 'store_config'), payload, { merge: true })
  ]).then((results) => {
    results.forEach((res, idx) => {
      if (res.status === 'rejected') {
        console.warn(`Firestore settings doc ${idx} sync notice:`, res.reason);
      }
    });
  });
}

export async function pushCategoriesToCloud(categories: Category[], isExplicitDelete = false) {
  syncWithServer({ categories, isExplicitDelete });
  if (broadcastChannel) broadcastChannel.postMessage({ type: 'categories', payload: categories });
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'categories'), { items: categories, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push categories to Firestore:', error);
  }
}

export async function pushProductsToCloud(products: Product[], isExplicitDelete = false) {
  syncWithServer({ products, isExplicitDelete });
  if (broadcastChannel) broadcastChannel.postMessage({ type: 'products', payload: products });
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'products'), { items: products, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push products to Firestore:', error);
  }
}

export async function pushPromoCodesToCloud(promoCodes: PromoCode[], isExplicitDelete = false) {
  savePromoCodesToLocalStorage(promoCodes);
  syncWithServer({ promoCodes, isExplicitDelete });
  if (broadcastChannel) broadcastChannel.postMessage({ type: 'promoCodes', payload: promoCodes });
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'promoCodes'), { items: promoCodes, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push promo codes to Firestore:', error);
  }
}

export async function pushOrdersToCloud(orders: Order[]) {
  syncWithServer({ orders });
  if (broadcastChannel) broadcastChannel.postMessage({ type: 'orders', payload: orders });
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'orders'), { items: orders, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push orders to Firestore:', error);
  }
}

export async function pushCustomersToCloud(customers: Customer[]) {
  syncWithServer({ customers });
  if (broadcastChannel) broadcastChannel.postMessage({ type: 'customers', payload: customers });
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'customers'), { items: customers, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push customers to Firestore:', error);
  }
}

export const applySettings = (cloudSettings: Partial<SiteSettings>, persistToLocal = true, isFromFirestore = false) => {
  if (!cloudSettings) return;
  useStore.setState((state) => {
    // Timestamp conflict protection:
    // If not from Firestore, check timestamps. If from live Firestore, honor it as authoritative cloud truth.
    const currentTs = state.settings?.updatedAt ? new Date(state.settings.updatedAt).getTime() : 0;
    const incomingTs = cloudSettings?.updatedAt ? new Date(cloudSettings.updatedAt).getTime() : 0;

    if (!isFromFirestore && currentTs > 0 && incomingTs > 0 && incomingTs < currentTs) {
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
    if (!res.ok) return;

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return;

    const data = await res.json();
    if (!data) return;

    if (data.updatedAt && data.updatedAt === lastServerTimestamp) {
      return; // No new changes
    }
    lastServerTimestamp = data.updatedAt || '';

    // Only apply server settings if it's updated
    if (data.settings && data.updatedAt) {
      applySettings({ ...data.settings, updatedAt: data.updatedAt }, true);
    }
    if (Array.isArray(data.categories) && data.categories.length > 0) {
      useStore.setState({ categories: data.categories });
    }
    if (Array.isArray(data.products) && data.products.length > 0) {
      useStore.setState({ products: data.products });
    }
    if (Array.isArray(data.promoCodes)) {
      const current = useStore.getState().promoCodes || [];
      const map = new Map<string, any>();
      // Keep existing local promos
      current.forEach(p => {
        if (p && (p.code || p.id)) map.set(p.code || p.id, p);
      });
      // Merge with server promos
      data.promoCodes.forEach((p: any) => {
        if (p && (p.code || p.id)) {
          const key = p.code || p.id;
          map.set(key, { ...(map.get(key) || {}), ...p });
        }
      });
      const merged = Array.from(map.values());
      useStore.setState({ promoCodes: merged });
      savePromoCodesToLocalStorage(merged);
    }
    if (Array.isArray(data.orders)) {
      useStore.setState({ orders: data.orders });
    }
    if (Array.isArray(data.customers)) {
      useStore.setState({ customers: data.customers });
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
        const map = new Map<string, any>();
        current.forEach(p => {
          if (p && (p.code || p.id)) map.set(p.code || p.id, p);
        });
        localPromos.forEach(p => {
          if (p && (p.code || p.id)) {
            const key = p.code || p.id;
            map.set(key, { ...(map.get(key) || {}), ...p });
          }
        });
        useStore.setState({ promoCodes: Array.from(map.values()) });
      }
    } catch (e) {
      console.warn('Error reading cached settings/promos from localStorage:', e);
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
      else if (type === 'products' && Array.isArray(payload)) useStore.setState({ products: payload });
      else if (type === 'promoCodes' && Array.isArray(payload)) useStore.setState({ promoCodes: payload });
      else if (type === 'orders' && Array.isArray(payload)) useStore.setState({ orders: payload });
      else if (type === 'customers' && Array.isArray(payload)) useStore.setState({ customers: payload });
    };
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('cortado_local_settings_sync', (e: any) => {
      if (e.detail) applySettings(e.detail, true);
    });
  }

  // 2. Fetch immediately from central server API
  fetchServerStoreData();

  // 3. Direct fetch from Firestore on startup
  if (db) {
    getDoc(doc(db, 'site_data', 'settings')).then((snap) => {
      if (snap.exists()) {
        applySettings(snap.data() as SiteSettings, true, true);
      }
    }).catch((e) => {
      console.warn('Initial Firestore settings fetch error:', e);
    });

    getDoc(doc(db, 'siteSettings', 'main')).then((snap) => {
      if (snap.exists()) {
        applySettings(snap.data() as SiteSettings, true, true);
      }
    }).catch((e) => {
      console.warn('Initial Firestore main settings fetch error:', e);
    });

    getDoc(doc(db, 'settings', 'store_config')).then((snap) => {
      if (snap.exists()) {
        applySettings(snap.data() as SiteSettings, true, true);
      }
    }).catch((e) => {
      console.warn('Initial Firestore store_config fetch error:', e);
    });

    getDoc(doc(db, 'site_data', 'promoCodes')).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const currentPromos = useStore.getState().promoCodes || [];
          const map = new Map<string, any>();
          currentPromos.forEach(p => map.set(p.code, p));
          data.items.forEach((p: any) => map.set(p.code, { ...(map.get(p.code) || {}), ...p }));
          const merged = Array.from(map.values());
          useStore.setState({ promoCodes: merged });
          savePromoCodesToLocalStorage(merged);
        }
      }
    }).catch((e) => console.warn('Initial Firestore promoCodes fetch error:', e));

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
          useStore.setState({ products: data.items });
        }
      }
    }).catch((e) => console.warn('Initial Firestore products fetch error:', e));
  }

  // 4. Poll server every 3 seconds for updates
  setInterval(() => {
    fetchServerStoreData();
  }, 3000);

  if (!db) return;

  // 5. Listen to Firestore Realtime Updates as real-time sync layer across devices
  try {
    onSnapshot(doc(db, 'site_data', 'settings'), (snapshot) => {
      if (snapshot.exists()) {
        applySettings(snapshot.data() as SiteSettings, true, true);
      }
    }, (err) => {
      console.warn('Firestore settings listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup settings listener:', e);
  }

  try {
    onSnapshot(doc(db, 'siteSettings', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        applySettings(snapshot.data() as SiteSettings, true, true);
      }
    }, (err) => {
      console.warn('Firestore backup settings listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup backup settings listener:', e);
  }

  try {
    onSnapshot(doc(db, 'settings', 'store_config'), (snapshot) => {
      if (snapshot.exists()) {
        applySettings(snapshot.data() as SiteSettings, true, true);
      }
    }, (err) => {
      console.warn('Firestore store_config listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup store_config listener:', e);
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
          useStore.setState({ products: data.items });
        }
      }
    }, (err) => {
      console.warn('Firestore products listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup products listener:', e);
  }

  try {
    onSnapshot(doc(db, 'site_data', 'promoCodes'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          const currentPromos = useStore.getState().promoCodes || [];
          const map = new Map<string, any>();
          currentPromos.forEach(p => map.set(p.code, p));
          data.items.forEach((p: any) => map.set(p.code, { ...(map.get(p.code) || {}), ...p }));
          const merged = Array.from(map.values());
          useStore.setState({ promoCodes: merged });
        }
      }
    }, (err) => {
      console.warn('Firestore promoCodes listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup promoCodes listener:', e);
  }

  try {
    onSnapshot(doc(db, 'site_data', 'orders'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          useStore.setState({ orders: data.items });
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
          useStore.setState({ customers: data.items });
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
