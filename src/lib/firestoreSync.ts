import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useStore } from './store';
import { SiteSettings, Category, Product, PromoCode, Order, Customer } from '../types';

let isListening = false;
let lastServerTimestamp = '';

// Helper to push updates to the backend server endpoint
export async function syncWithServer(data: Partial<{
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  promoCodes: PromoCode[];
  orders: Order[];
  customers: Customer[];
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

// Helpers to push state changes (called when Admin makes updates)
export async function pushSettingsToCloud(settings: SiteSettings) {
  syncWithServer({ settings });
  if (!db) return;
  try {
    const payload = { ...settings, updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'site_data', 'settings'), payload, { merge: true });
    await setDoc(doc(db, 'siteSettings', 'main'), payload, { merge: true });
  } catch (error) {
    console.error('Failed to push settings to Firestore:', error);
  }
}

export async function pushCategoriesToCloud(categories: Category[]) {
  syncWithServer({ categories });
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'categories'), { items: categories, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push categories to Firestore:', error);
  }
}

export async function pushProductsToCloud(products: Product[]) {
  syncWithServer({ products });
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'products'), { items: products, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push products to Firestore:', error);
  }
}

export async function pushPromoCodesToCloud(promoCodes: PromoCode[]) {
  syncWithServer({ promoCodes });
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'promoCodes'), { items: promoCodes, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push promo codes to Firestore:', error);
  }
}

export async function pushOrdersToCloud(orders: Order[]) {
  syncWithServer({ orders });
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'orders'), { items: orders, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push orders to Firestore:', error);
  }
}

export async function pushCustomersToCloud(customers: Customer[]) {
  syncWithServer({ customers });
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'customers'), { items: customers, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push customers to Firestore:', error);
  }
}

const applySettings = (cloudSettings: Partial<SiteSettings>) => {
  if (!cloudSettings) return;
  useStore.setState((state) => ({
    settings: {
      ...state.settings,
      ...cloudSettings,
      isStoreOpen: typeof cloudSettings.isStoreOpen === 'boolean' ? cloudSettings.isStoreOpen : state.settings.isStoreOpen,
      socials: { ...state.settings.socials, ...(cloudSettings.socials || {}) },
      branches: Array.isArray(cloudSettings.branches) ? cloudSettings.branches : state.settings.branches,
      paymentMethods: Array.isArray(cloudSettings.paymentMethods) ? cloudSettings.paymentMethods : state.settings.paymentMethods
    }
  }));
};

// Function to fetch store data from the central server API
async function fetchServerStoreData() {
  try {
    const res = await fetch('/api/store-data');
    if (!res.ok) return;
    const data = await res.json();
    if (!data) return;

    if (data.updatedAt && data.updatedAt === lastServerTimestamp) {
      return; // No new changes
    }
    lastServerTimestamp = data.updatedAt || '';

    if (data.settings) {
      applySettings(data.settings);
    }
    if (Array.isArray(data.categories) && data.categories.length > 0) {
      useStore.setState({ categories: data.categories });
    }
    if (Array.isArray(data.products) && data.products.length > 0) {
      useStore.setState({ products: data.products });
    }
    if (Array.isArray(data.promoCodes)) {
      useStore.setState({ promoCodes: data.promoCodes });
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
  if (isListening) return;
  isListening = true;

  // 1. Fetch immediately from central server API
  fetchServerStoreData();

  // 2. Poll server every 2.5 seconds for instant update across all client browsers/devices
  setInterval(() => {
    fetchServerStoreData();
  }, 2500);

  if (!db) return;

  // 3. Listen to Firestore Realtime Updates as secondary real-time layer
  try {
    onSnapshot(doc(db, 'site_data', 'settings'), (snapshot) => {
      if (snapshot.exists()) {
        applySettings(snapshot.data() as SiteSettings);
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
        applySettings(snapshot.data() as SiteSettings);
      }
    }, (err) => {
      console.warn('Firestore backup settings listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup backup settings listener:', e);
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
          useStore.setState({ promoCodes: data.items });
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
