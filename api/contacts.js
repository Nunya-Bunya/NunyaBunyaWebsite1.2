// Vercel serverless function — handles contacts (admin) + blog posts (public)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return res.status(500).json({ error: 'Server configuration error.' });

  const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };

  // Blog endpoint: /api/contacts?blog=1 or /api/contacts?blog=1&id=UUID
  if (req.query.blog) {
    try {
      if (req.query.id) {
        // Single post
        const r = await fetch(`${SUPABASE_URL}/rest/v1/content_campaigns?id=eq.${req.query.id}&status=eq.approved`, { headers });
        if (!r.ok) return res.status(200).json({ post: null });
        const posts = await r.json();
        return res.status(200).json({ post: posts[0] || null });
      }
      // List published posts — filter by client if specified (default: Nunya Bunya)
      const client = req.query.client || 'Nunya Bunya';
      const clientFilter = client === 'all' ? '' : `&client_name=eq.${encodeURIComponent(client)}`;
      const r = await fetch(`${SUPABASE_URL}/rest/v1/content_campaigns?status=eq.approved${clientFilter}&order=created_at.desc&limit=50&select=id,topic,client_name,blog_post,image_prompt,created_at,status`, { headers });
      if (!r.ok) return res.status(200).json({ posts: [] });
      const posts = await r.json();
      return res.status(200).json({ posts });
    } catch { return res.status(200).json({ posts: [] }); }
  }

  // Original contacts endpoint (admin auth required)
  const ADMIN_KEY = process.env.ADMIN_KEY;
  const { key } = req.query;
  if (!ADMIN_KEY || key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/contacts?select=*&order=created_at.desc`, { headers });
    if (!response.ok) return res.status(500).json({ error: 'Failed to fetch contacts.' });
    const contacts = await response.json();
    return res.status(200).json({ total: contacts.length, contacts });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
}
