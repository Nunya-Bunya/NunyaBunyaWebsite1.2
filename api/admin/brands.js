// NBHQ Admin API — Brand configs (reads brand.json from client directories)
import { requireAuth } from '../../lib/auth-utils.js';
import fs from 'fs';
import path from 'path';

const CLIENTS_DIR = '/Users/benalekconner/Desktop/MASTER WORKSPACE/01-Nunya Bunya/Clients';

const BRAND_SLUGS = [
  'nunya-bunya',
  'power-portraits',
  'conner-injury-law',
  'pawesome-dog-walkers',
  'orca-film-awards',
  'bella-rhyder',
  'ben-alek-conner',
];

function loadBrand(slug) {
  const jsonPath = path.join(CLIENTS_DIR, slug, '01-strategy', 'brand.json');
  if (!fs.existsSync(jsonPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = requireAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { brand } = req.query || {};

    if (brand) {
      const data = loadBrand(brand);
      if (!data) return res.status(404).json({ error: 'Brand not found' });
      return res.status(200).json(data);
    }

    // Return all brands
    const brands = BRAND_SLUGS.map(slug => loadBrand(slug)).filter(Boolean);
    return res.status(200).json(brands);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
