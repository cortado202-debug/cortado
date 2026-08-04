import type { Request, Response } from 'express';

let memoryStore: any = null;

export default function handler(req: any, res: any) {
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    memoryStore = {
      ...(memoryStore || {}),
      settings: body.settings ? { ...memoryStore?.settings, ...body.settings } : memoryStore?.settings,
      categories: Array.isArray(body.categories) ? body.categories : memoryStore?.categories,
      products: Array.isArray(body.products) ? body.products : memoryStore?.products,
      promoCodes: Array.isArray(body.promoCodes) ? body.promoCodes : memoryStore?.promoCodes,
      orders: Array.isArray(body.orders) ? body.orders : memoryStore?.orders,
      customers: Array.isArray(body.customers) ? body.customers : memoryStore?.customers,
      updatedAt: new Date().toISOString()
    };
    return res.status(200).json({ success: true, storeData: memoryStore });
  }

  return res.status(200).json(memoryStore || {
    settings: { isStoreOpen: true },
    updatedAt: '2020-01-01T00:00:00.000Z'
  });
}
