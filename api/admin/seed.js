// Admin API: POST seed data into dashboard tables
import { requireAuth, supabaseFetch } from '../auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { clients, content } = req.body || {};
  const results = { clients_upserted: 0, content_inserted: 0, errors: [] };

  try {
    // Upsert clients
    if (clients && Array.isArray(clients)) {
      for (const client of clients) {
        try {
          await supabaseFetch('dashboard_clients', {
            method: 'POST',
            body: JSON.stringify(client),
            headers: { 'Prefer': 'resolution=merge-duplicates' },
            prefer: 'resolution=merge-duplicates',
          });
          results.clients_upserted++;
        } catch (err) {
          results.errors.push(`Client ${client.client_id}: ${err.message}`);
        }
      }
    }

    // Insert content items
    if (content && content.items && Array.isArray(content.items)) {
      // Delete existing items for this client+month to avoid duplicates
      if (content.client_id && content.month_key) {
        try {
          await supabaseFetch(
            `dashboard_content_items?client_id=eq.${encodeURIComponent(content.client_id)}&month_key=eq.${encodeURIComponent(content.month_key)}`,
            { method: 'DELETE', prefer: 'return=minimal' }
          );
        } catch {
          // Ignore delete errors (table might be empty)
        }
      }

      // Insert in batches of 50
      for (let i = 0; i < content.items.length; i += 50) {
        const batch = content.items.slice(i, i + 50);
        try {
          await supabaseFetch('dashboard_content_items', {
            method: 'POST',
            body: JSON.stringify(batch),
          });
          results.content_inserted += batch.length;
        } catch (err) {
          results.errors.push(`Content batch ${i}: ${err.message}`);
        }
      }
    }

    return res.status(200).json({ success: true, ...results });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ error: 'Seed failed.', details: err.message });
  }
}
