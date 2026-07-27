// Admin API: Tool Discovery + Resource Library endpoints
// GET /api/admin/tools?action=apis         — public_apis (filterable)
// GET /api/admin/tools?action=awesome      — awesome_lists (filterable)
// GET /api/admin/tools?action=categories   — distinct categories from both tables
// GET /api/admin/tools?action=suggest      — suggest APIs for a business type (used by BFK agents)
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { action, q, category, auth, cors, limit } = req.query;
  const lim = Math.min(parseInt(limit) || 100, 500);

  try {
    // ── Public APIs (Tool Discovery) ──
    if (action === 'apis') {
      let query = `public_apis?order=name.asc&limit=${lim}`;
      if (category) query += `&category=eq.${encodeURIComponent(category)}`;
      if (auth && auth !== 'all') query += `&auth=eq.${encodeURIComponent(auth)}`;
      if (cors && cors !== 'all') query += `&cors=eq.${encodeURIComponent(cors)}`;
      if (q) query += `&or=(name.ilike.*${encodeURIComponent(q)}*,description.ilike.*${encodeURIComponent(q)}*)`;

      const data = await supabaseFetch(query);
      return res.status(200).json({ total: (data || []).length, items: data || [] });
    }

    // ── Awesome Lists (Resource Library) ──
    if (action === 'awesome') {
      let query = `awesome_lists?order=name.asc&limit=${lim}`;
      if (category) query += `&category=eq.${encodeURIComponent(category)}`;
      if (q) query += `&or=(name.ilike.*${encodeURIComponent(q)}*,description.ilike.*${encodeURIComponent(q)}*)`;

      const data = await supabaseFetch(query);
      return res.status(200).json({ total: (data || []).length, items: data || [] });
    }

    // ── Categories (for filter dropdowns) ──
    if (action === 'categories') {
      const [apiCats, awesomeCats] = await Promise.all([
        supabaseFetch('public_apis?select=category&order=category.asc', { headers: { 'Prefer': 'return=representation' } }),
        supabaseFetch('awesome_lists?select=category&order=category.asc', { headers: { 'Prefer': 'return=representation' } }),
      ]);
      const uniqueApiCats = [...new Set((apiCats || []).map(r => r.category))];
      const uniqueAwesomeCats = [...new Set((awesomeCats || []).map(r => r.category))];
      return res.status(200).json({ api_categories: uniqueApiCats, awesome_categories: uniqueAwesomeCats });
    }

    // ── Suggest APIs for a business type (agent integration) ──
    if (action === 'suggest') {
      const { business_type } = req.query;
      if (!business_type) return res.status(400).json({ error: 'business_type required' });

      // Map business types to relevant API categories
      const categoryMap = {
        'restaurant': ['Food & Drink', 'Geocoding', 'Social', 'Photography'],
        'ecommerce': ['Shopping', 'Currency Exchange', 'Tracking', 'Finance'],
        'fitness': ['Sports & Fitness', 'Health', 'Social', 'Calendar'],
        'photography': ['Photography', 'Social', 'Art & Design', 'Cloud Storage & File Sharing'],
        'law': ['Government', 'Documents & Productivity', 'Email', 'Data Validation'],
        'agency': ['Development', 'Social', 'Email', 'Analytics', 'Machine Learning'],
        'pet': ['Animals', 'Geocoding', 'Social', 'Weather'],
        'beauty': ['Health', 'Social', 'Calendar', 'Photography'],
        'realestate': ['Geocoding', 'Finance', 'Government', 'Weather'],
        'education': ['Books', 'Science & Math', 'Dictionaries', 'Open Data'],
        'music': ['Music', 'Entertainment', 'Social', 'Video'],
        'film': ['Video', 'Entertainment', 'News', 'Social'],
      };

      const key = business_type.toLowerCase().replace(/\s+/g, '');
      const cats = categoryMap[key] || ['Social', 'Email', 'Development'];

      // Fetch APIs from matched categories
      const catFilter = cats.map(c => `category.eq.${c}`).join(',');
      const data = await supabaseFetch(
        `public_apis?or=(${catFilter})&order=name.asc&limit=50`
      );

      return res.status(200).json({
        business_type,
        matched_categories: cats,
        total: (data || []).length,
        suggestions: data || [],
      });
    }

    return res.status(400).json({ error: 'Unknown action. Use: apis, awesome, categories, suggest' });
  } catch (err) {
    console.error('Tools API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
