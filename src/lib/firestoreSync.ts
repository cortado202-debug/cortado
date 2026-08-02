import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useStore } from './store';
import { SiteSettings, Category, Product, PromoCode, Order, Customer } from '../types';

let isListening = false;
let isSavingToCloud = false;

// Helpers to push state changes to Firestore
export async function pushSettingsToCloud(settings: SiteSettings) {
  if (!db) return;
  try {
    isSavingToCloud = true;
    await setDoc(doc(db, 'site_data', 'settings'), { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
    // Also save to siteSettings/main for backup
    await setDoc(doc(db, 'siteSettings', 'main'), { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Failed to push settings to Firestore:', error);
  } finally {
    setTimeout(() => { isSavingToCloud = false; }, 500);
  }
}

export async function pushCategoriesToCloud(categories: Category[]) {
  if (!db) return;
  try {
    isSavingToCloud = true;
    await setDoc(doc(db, 'site_data', 'categories'), { items: categories, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push categories to Firestore:', error);
  } finally {
    setTimeout(() => { isSavingToCloud = false; }, 500);
  }
}

export async function pushProductsToCloud(products: Product[]) {
  if (!db) return;
  try {
    isSavingToCloud = true;
    await setDoc(doc(db, 'site_data', 'products'), { items: products, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push products to Firestore:', error);
  } finally {
    setTimeout(() => { isSavingToCloud = false; }, 500);
  }
}

export async function pushPromoCodesToCloud(promoCodes: PromoCode[]) {
  if (!db) return;
  try {
    isSavingToCloud = true;
    await setDoc(doc(db, 'site_data', 'promoCodes'), { items: promoCodes, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push promo codes to Firestore:', error);
  } finally {
    setTimeout(() => { isSavingToCloud = false; }, 500);
  }
}

export async function pushOrdersToCloud(orders: Order[]) {
  if (!db) return;
  try {
    isSavingToCloud = true;
    await setDoc(doc(db, 'site_data', 'orders'), { items: orders, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push orders to Firestore:', error);
  } finally {
    setTimeout(() => { isSavingToCloud = false; }, 500);
  }
}

export async function pushCustomersToCloud(customers: Customer[]) {
  if (!db) return;
  try {
    isSavingToCloud = true;
    await setDoc(doc(db, 'site_data', 'customers'), { items: customers, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to push customers to Firestore:', error);
  } finally {
    setTimeout(() => { isSavingToCloud = false; }, 500);
  }
}

// Function to initialize real-time Firestore synchronization for all clients
export function initFirestoreSync() {
  if (!db || isListening) return;
  isListening = true;

  // 1. Listen to Settings changes from Firestore
  try {
    onSnapshot(doc(db, 'site_data', 'settings'), (snapshot) => {
      if (snapshot.exists() && !isSavingToCloud) {
        const cloudSettings = snapshot.data() as SiteSettings;
        if (cloudSettings && cloudSettings.branches) {
          useStore.setState((state) => ({
            settings: {
              ...state.settings,
              ...cloudSettings,
              socials: { ...state.settings.socials, ...(cloudSettings.socials || {}) },
              branches: cloudSettings.branches || state.settings.branches,
              paymentMethods: cloudSettings.paymentMethods || state.settings.paymentMethods
            }
          }));
        }
      } else if (!snapshot.exists()) {
        // Initialize cloud settings if empty
        const currentSettings = useStore.getState().settings;
        pushSettingsToCloud(currentSettings);
      }
    }, (err) => {
      console.warn('Firestore settings listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup settings listener:', e);
  }

  // 2. Listen to Categories
  try {
    onSnapshot(doc(db, 'site_data', 'categories'), (snapshot) => {
      if (snapshot.exists() && !isSavingToCloud) {
        const data = snapshot.data();
        if (Array.isArray(data.items) && data.items.length > 0) {
          useStore.setState({ categories: data.items });
        }
      } else if (!snapshot.exists()) {
        pushCategoriesToCloud(useStore.getState().categories);
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
      if (snapshot.exists() && !isSavingToCloud) {
        const data = snapshot.data();
        if (Array.isArray(data.items) && data.items.length > 0) {
          useStore.setState({ products: data.items });
        }
      } else if (!snapshot.exists()) {
        pushProductsToCloud(useStore.getState().products);
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
      if (snapshot.exists() && !isSavingToCloud) {
        const data = snapshot.data();
        if (Array.isArray(data.items)) {
          useStore.setState({ promoCodes: data.items });
        }
      } else if (!snapshot.exists()) {
        pushPromoCodesToCloud(useStore.getState().promoCodes);
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
      if (snapshot.exists() && !isSavingToCloud) {
        const data = snapshot.data();
        if (Array.isArray(data.items)) {
          useStore.setState({ orders: data.items });
        }
      } else if (!snapshot.exists()) {
        pushOrdersToCloud(useStore.getState().orders);
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
      if (snapshot.exists() && !isSavingToCloud) {
        const data = snapshot.data();
        if (Array.isArray(data.items)) {
          useStore.setState({ customers: data.items });
        }
      } else if (!snapshot.exists()) {
        pushCustomersToCloud(useStore.getState().customers);
      }
    }, (err) => {
      console.warn('Firestore customers listener error:', err.message);
    });
  } catch (e) {
    console.warn('Could not setup customers listener:', e);
  }
}
