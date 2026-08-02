import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial store state fallback
const defaultStoreData = {
  settings: {
    siteTitle: 'كورتادو كافيه',
    siteSubtitle: 'CORTADO SPECIALTY COFFEE',
    logoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80',
    phone: '+963 933 123 456',
    address: 'سوريا - حماة - الشريعة',
    openingHours: 'يومياً: من 6:00 صباحاً حتى 12:00 منتصف الليل',
    isStoreOpen: true,
    deliveryFee: 3000,
    adminEmail: 'admin@cortado.com',
    socials: {
      instagram: 'https://instagram.com/cortado_cafe',
      facebook: 'https://facebook.com/cortadocafe',
      whatsapp: 'https://wa.me/963933123456',
      locationMap: 'https://maps.google.com'
    },
    paymentMethods: [
      { id: 'pm-1', nameAr: 'دفع نقدي عند الاستلام', nameEn: 'Cash on Delivery', isEnabled: true, iconName: 'Banknote', descriptionAr: 'الدفع مباشرة للسائق عند وصول الطلب' },
      { id: 'pm-2', nameAr: 'سيرياتيل كاش (Syriatel Cash)', nameEn: 'Syriatel Cash', isEnabled: true, iconName: 'Smartphone', descriptionAr: 'حساب رقم: 0933123456' },
      { id: 'pm-3', nameAr: 'بامبو كاش (Bambo Cash)', nameEn: 'Bambo Cash', isEnabled: true, iconName: 'CreditCard', descriptionAr: 'حساب رقم: 884920' },
      { id: 'pm-4', nameAr: 'الهرم / الفؤاد للحوالات', nameEn: 'Al-Haram Transfer', isEnabled: true, iconName: 'Building2', descriptionAr: 'تحويل مباشر باسم المحل' }
    ],
    branches: [
      { id: 'br-1', nameAr: 'فرع حماة الرئيسي', nameEn: 'Hama Main Branch', addressAr: 'سوريا - حماة - الشريعة', addressEn: 'Hama - Al-Sharea', phone: '+963 33 222 1111', isMain: true, isActive: true },
      { id: 'br-2', nameAr: 'فرع الشام الجديد', nameEn: 'Damascus New Branch', addressAr: 'سوريا - دمشق - المزة', addressEn: 'Damascus - Mazzeh', phone: '+963 11 333 4444', isMain: false, isActive: true }
    ]
  },
  categories: [],
  products: [],
  promoCodes: [],
  orders: [],
  customers: [],
  updatedAt: new Date().toISOString()
};

// Load store data from disk or fallback
function loadStoreDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...defaultStoreData, ...parsed };
    }
  } catch (err) {
    console.error('Error reading store_db.json, using defaults:', err);
  }
  return defaultStoreData;
}

// Save store data to disk
function saveStoreDb(data: any) {
  try {
    const payload = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return payload;
  } catch (err) {
    console.error('Error writing store_db.json:', err);
    return data;
  }
}

let inMemoryStore = loadStoreDb();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API endpoints FIRST
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get current global store data
  app.get('/api/store-data', (_req, res) => {
    res.json(inMemoryStore);
  });

  // Save/Update global store data (called by Admin or sync handlers)
  app.post('/api/store-data', (req, res) => {
    try {
      const incoming = req.body || {};
      
      inMemoryStore = saveStoreDb({
        settings: incoming.settings ? { ...inMemoryStore.settings, ...incoming.settings } : inMemoryStore.settings,
        categories: Array.isArray(incoming.categories) ? incoming.categories : inMemoryStore.categories,
        products: Array.isArray(incoming.products) ? incoming.products : inMemoryStore.products,
        promoCodes: Array.isArray(incoming.promoCodes) ? incoming.promoCodes : inMemoryStore.promoCodes,
        orders: Array.isArray(incoming.orders) ? incoming.orders : inMemoryStore.orders,
        customers: Array.isArray(incoming.customers) ? incoming.customers : inMemoryStore.customers,
      });

      res.json({ success: true, storeData: inMemoryStore });
    } catch (err: any) {
      console.error('Failed to update store data:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
