// Admin API: Voice Memo
// POST — receive already-processed voice memo data (from n8n) → store in Supabase
// GET — list voice memos
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  // GET: List voice memos
  if (req.method === 'GET') {
    const { client_id, limit } = req.query;
    let query = 'voice_memos?order=created_at.desc';
    if (client_id) query += `&client_id=eq.${encodeURIComponent(client_id)}`;
    query += `&limit=${limit || 50}`;

    try {
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

      // Push items to approval queue
      const approvalItems = (items || []).map(item => ({
        client_id: client_id || null,
        client_name: client_name || 'Unknown',
        item_type: mapItemType(item.type),
        title: item.title,
        status: 'pending',
        source: 'voice_memo',
        source_id: memoId,
        metadata: JSON.stringify({
          content: item.content,
          platform: item.platform,
          hashtags: item.hashtags,
          image_suggestion: item.image_suggestion,
          reasoning: item.reasoning,
          priority: item.priority,
          original_type: item.type,
        }),
      }));

      if (approvalItems.length > 0) {
        await supabaseFetch('approval_queue', {
          method: 'POST',
          body: JSON.stringify(approvalItems),
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
