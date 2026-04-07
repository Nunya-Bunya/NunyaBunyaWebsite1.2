// Admin API: Voice Memo
// POST — receive already-processed voice memo data (from n8n) → store in Supabase
// GET — list voice memos
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  // GET: List voice memos (optionally with their items)
  if (req.method === 'GET') {
    const { client_id, limit, id } = req.query;

    try {
      // Single memo detail with items
      if (id) {
        const memos = await supabaseFetch(`voice_memos?id=eq.${encodeURIComponent(id)}`);
        if (!memos || memos.length === 0) return res.status(404).json({ error: 'Not found' });
        const memo = memos[0];
        const memoItems = await supabaseFetch(`voice_memo_items?memo_id=eq.${id}&order=created_at.asc`);
        return res.status(200).json({ memo, items: memoItems || [] });
      }

      // List memos
      let query = 'voice_memos?order=created_at.desc';
      if (client_id) query += `&client_id=eq.${encodeURIComponent(client_id)}`;
      query += `&limit=${limit || 50}`;
      const memos = await supabaseFetch(query);
      return res.status(200).json({ memos: memos || [] });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch voice memos.' });
    }
  }

  // POST: Store a processed voice memo (called by n8n after AI expansion)
  if (req.method === 'POST') {
    const { transcript, client_id, client_name, duration_ms, recorded_at, summary, items } = req.body || {};

    if (!transcript) {
      return res.status(400).json({ error: 'transcript is required.' });
    }

    try {
      // Store the voice memo in Supabase
      const memo = {
        client_id: client_id || null,
        client_name: client_name || 'Unknown',
        transcript,
        summary: summary || '',
        items: JSON.stringify(items || []),
        item_count: (items || []).length,
        duration_ms: duration_ms ? parseInt(duration_ms) : null,
        recorded_at: recorded_at || new Date().toISOString(),
        status: 'pending_review',
      };

      const savedMemo = await supabaseFetch('voice_memos', {
        method: 'POST',
        body: JSON.stringify(memo),
        prefer: 'return=representation',
      });

      const memoId = savedMemo?.[0]?.id;

      // Push items to voice_memo_items table
      const memoItems = (items || []).map(item => ({
        memo_id: memoId,
        client_id: client_id || null,
        client_name: client_name || 'Unknown',
        item_type: mapItemType(item.type),
        title: item.title,
        content: item.content || '',
        platform: item.platform || 'general',
        hashtags: item.hashtags || '',
        image_suggestion: item.image_suggestion || '',
        reasoning: item.reasoning || '',
        priority: item.priority || 'medium',
        status: 'pending',
      }));

      if (memoItems.length > 0) {
        await supabaseFetch('voice_memo_items', {
          method: 'POST',
          body: JSON.stringify(memoItems),
          prefer: 'return=minimal',
        });
      }

      return res.status(200).json({
        success: true,
        memo_id: memoId,
        tasks_created: (items || []).length,
        summary: summary,
      });

    } catch (err) {
      console.error('Voice memo storage error:', err);
      return res.status(500).json({ error: 'Storage failed: ' + err.message });
    }
  }

  // PATCH: Approve or reject a voice memo item
  if (req.method === 'PATCH') {
    const { item_id, action } = req.body || {};
    if (!item_id || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'item_id and action (approve/reject) required.' });
    }

    const now = new Date().toISOString();
    const updates = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approved_at: action === 'approve' ? now : null,
      approved_by: action === 'approve' ? 'admin' : null,
    };

    try {
      await supabaseFetch(`voice_memo_items?id=eq.${encodeURIComponent(item_id)}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        prefer: 'return=minimal',
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update item.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}

function mapItemType(type) {
  const map = {
    social_post: 'social_post',
    blog_post: 'content_campaign',
    email: 'email_draft',
    task: 'task',
    ad_idea: 'social_post',
  };
  return map[type] || 'task';
}
