import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_PROMO_CODES } from './src/data/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store_db.json');

// Ensure data directory exists if possible
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Read-only filesystem detected, using in-memory store:', err);
}

// Helper to sanitize prices (remove two zeroes if legacy price >= 1000)
function sanitizeProductPrices(products: any[]) {
  if (!Array.isArray(products)) return [];
  return products.map((p: any) => ({
    ...p,
    price: typeof p.price === 'number' && p.price >= 1000 ? Math.round(p.price / 100) : p.price,
    sizes: Array.isArray(p.sizes) ? p.sizes.map((s: any) => ({
      ...s,
      price: typeof s.price === 'number' && s.price >= 1000 ? Math.round(s.price / 100) : s.price
    })) : p.sizes
  }));
}

// Default initial store state fallback loaded from full store initial data
const defaultStoreData = {
  settings: INITIAL_SETTINGS,
  categories: INITIAL_CATEGORIES,
  products: sanitizeProductPrices(INITIAL_PRODUCTS),
  promoCodes: INITIAL_PROMO_CODES,
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
      return {
        settings: parsed.settings ? { ...INITIAL_SETTINGS, ...parsed.settings } : INITIAL_SETTINGS,
        categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : INITIAL_CATEGORIES,
        products: Array.isArray(parsed.products) && parsed.products.length > 0 ? sanitizeProductPrices(parsed.products) : sanitizeProductPrices(INITIAL_PRODUCTS),
        promoCodes: Array.isArray(parsed.promoCodes) ? parsed.promoCodes : INITIAL_PROMO_CODES,
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        customers: Array.isArray(parsed.customers) ? parsed.customers : [],
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    }
  } catch (err) {
    console.error('Error reading store_db.json, using defaults:', err);
  }
  return defaultStoreData;
}

// Save store data to disk
function saveStoreDb(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
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
      
      // 1. Settings (merge so no settings field is lost)
      const settings = incoming.settings 
        ? { ...inMemoryStore.settings, ...incoming.settings } 
        : inMemoryStore.settings;

      // 2. Categories (non-destructive merge by id)
      let categories = inMemoryStore.categories;
      if (Array.isArray(incoming.categories)) {
        if (incoming.isExplicitDelete) {
          categories = incoming.categories;
        } else if (incoming.categories.length > 0) {
          const map = new Map<string, any>();
          categories.forEach((c: any) => { if (c && c.id) map.set(c.id, c); });
          incoming.categories.forEach((c: any) => { if (c && c.id) map.set(c.id, { ...(map.get(c.id) || {}), ...c }); });
          categories = Array.from(map.values());
        }
      }

      // 3. Products (non-destructive merge by id)
      let products = inMemoryStore.products;
      if (Array.isArray(incoming.products)) {
        if (incoming.isExplicitDelete) {
          products = incoming.products;
        } else if (incoming.products.length > 0) {
          const map = new Map<string, any>();
          products.forEach((p: any) => { if (p && p.id) map.set(p.id, p); });
          incoming.products.forEach((p: any) => { if (p && p.id) map.set(p.id, { ...(map.get(p.id) || {}), ...p }); });
          products = Array.from(map.values());
        }
      }
      products = sanitizeProductPrices(products);

      // 4. PromoCodes (smart non-destructive merge by code or id)
      let promoCodes = inMemoryStore.promoCodes && inMemoryStore.promoCodes.length > 0 ? inMemoryStore.promoCodes : INITIAL_PROMO_CODES;
      if (Array.isArray(incoming.promoCodes)) {
        if (incoming.isExplicitDelete && incoming.promoCodes.length > 0) {
          promoCodes = incoming.promoCodes;
        } else {
          const map = new Map<string, any>();
          const getPTime = (p: any): number => {
            if (p.createdAt) {
              const t = new Date(p.createdAt).getTime();
              if (!isNaN(t) && t > 0) return t;
            }
            if (p.id) {
              const m = p.id.match(/(\d{10,13})/);
              if (m) {
                const t = parseInt(m[1], 10);
                if (!isNaN(t) && t > 0) return t;
              }
            }
            return 0;
          };

          INITIAL_PROMO_CODES.forEach((p: any) => {
            if (p && (p.code || p.id)) map.set((p.code || p.id).toUpperCase().trim(), { ...p, createdAt: p.createdAt || '2025-01-01T00:00:00.000Z' });
          });
          promoCodes.forEach((p: any) => {
            if (p && (p.code || p.id)) {
              const key = (p.code || p.id).toUpperCase().trim();
              const existing = map.get(key);
              const createdAt = p.createdAt || existing?.createdAt || (getPTime(p) > 0 ? new Date(getPTime(p)).toISOString() : new Date().toISOString());
              map.set(key, existing ? { ...existing, ...p, createdAt } : { ...p, createdAt });
            }
          });
          incoming.promoCodes.forEach((p: any) => {
            if (p && (p.code || p.id)) {
              const key = (p.code || p.id).toUpperCase().trim();
              const existing = map.get(key);
              const createdAt = p.createdAt || existing?.createdAt || (getPTime(p) > 0 ? new Date(getPTime(p)).toISOString() : new Date().toISOString());
              if (!existing) {
                map.set(key, { ...p, createdAt });
              } else {
                map.set(key, {
                  ...existing,
                  ...p,
                  createdAt,
                  isUsed: Boolean(existing.isUsed || p.isUsed),
                  usedCount: Math.max(existing.usedCount || 0, p.usedCount || 0),
                  usedAt: p.usedAt || existing.usedAt,
                  usedByUsers: Array.from(new Set([...(existing.usedByUsers || []), ...(p.usedByUsers || [])]))
                });
              }
            }
          });
          const list = Array.from(map.values());
          promoCodes = list.sort((a, b) => getPTime(b) - getPTime(a));
        }
      }

      // 5. Orders (non-destructive merge by id)
      let orders = inMemoryStore.orders || [];
      if (Array.isArray(incoming.orders)) {
        const orderMap = new Map<string, any>();
        orders.forEach((o: any) => { if (o && o.id) orderMap.set(o.id, o); });
        incoming.orders.forEach((o: any) => { if (o && o.id) orderMap.set(o.id, { ...(orderMap.get(o.id) || {}), ...o }); });
        orders = Array.from(orderMap.values()).sort((a: any, b: any) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      }

      // 6. Customers (non-destructive merge by uid or id or phone)
      let customers = inMemoryStore.customers || [];
      if (Array.isArray(incoming.customers)) {
        const custMap = new Map<string, any>();
        const getKey = (c: any) => c.uid || c.id || c.phone || c.email;
        customers.forEach((c: any) => { if (c && getKey(c)) custMap.set(getKey(c), c); });
        incoming.customers.forEach((c: any) => { 
          if (c && getKey(c)) {
            custMap.set(getKey(c), { ...(custMap.get(getKey(c)) || {}), ...c });
          }
        });
        customers = Array.from(custMap.values());
      }

      inMemoryStore = saveStoreDb({
        settings,
        categories,
        products,
        promoCodes,
        orders,
        customers
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
    app.use(express.static(distPath, { maxAge: '1d' }));
    app.get('*all', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');
        // Dynamic protocol & host resolution for WhatsApp & Social Media crawlers
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.cortadocafe.online';
        const currentDomain = `${protocol}://${host}`;

        // Ensure absolute URLs for og:image, og:url and canonical
        html = html
          .replace(/https:\/\/www\.cortadocafe\.online/g, currentDomain)
          .replace(/content="og-image\.jpg"/g, `content="${currentDomain}/og-image.jpg"`);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
      } else {
        res.sendFile(indexPath);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
