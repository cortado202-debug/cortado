import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useStore } from './store';
import { SiteSettings, Category, Product, PromoCode, Order, Customer } from '../types';

let isListening = false;

// Helpers to push state changes to Firestore (called when Admin makes updates)
export async function pushSettingsToCloud(settings: SiteSettings) {
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
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'categories'), { items: categories, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push categories to Firestore:', error);
  }
}

export async function pushProductsToCloud(products: Product[]) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'products'), { items: products, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push products to Firestore:', error);
  }
}

export async function pushPromoCodesToCloud(promoCodes: PromoCode[]) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'promoCodes'), { items: promoCodes, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push promo codes to Firestore:', error);
  }
}

export async function pushOrdersToCloud(orders: Order[]) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'orders'), { items: orders, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push orders to Firestore:', error);
  }
}

export async function pushCustomersToCloud(customers: Customer[]) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'site_data', 'customers'), { items: customers, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push customers to Firestore:', error);
  }
}

// Function to initialize real-time Firestore synchronization for all clients
export function initFirestoreSync() {
  if (!db || isListening) return;
  isListening = true;

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

  // 1. Listen to Settings changes from site_data/settings
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

  // 1b. Backup settings listener
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

  // 2. Listen to Categories
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

  // 3. Listen to Products
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

  // 4. Listen to Promo Codes
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

  // 5. Listen to Orders
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

  // 6. Listen to Customers
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
