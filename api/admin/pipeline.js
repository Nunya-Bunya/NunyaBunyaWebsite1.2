// Admin API: Pipeline management — trigger, status, resume, definitions (consolidated)
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { action } = req.query;
  const agentUrl = process.env.AGENT_SERVER_URL || 'http://localhost:8000';

  try {
    // GET: status or definitions
    if (req.method === 'GET') {
      if (action === 'definitions') {
        const response = await fetch(`${agentUrl}/pipeline/definitions`);
        return res.status(200).json(await response.json());
      }

      // Status — single run or list
      const { run_id, client_id, status, limit } = req.query;
      if (run_id) {
        const runs = await supabaseFetch(`pipeline_runs?id=eq.${encodeURIComponent(run_id)}`);
        if (!runs || runs.length === 0) return res.status(404).json({ error: 'Run not found.' });
        return res.status(200).json(runs[0]);
      }
      let query = 'pipeline_runs?order=started_at.desc';
      if (client_id) query += `&client_id=eq.${encodeURIComponent(client_id)}`;
      if (status) query += `&status=eq.${encodeURIComponent(status)}`;
      query += `&limit=${limit || 50}`;
      const runs = await supabaseFetch(query);
      return res.status(200).json({ total: (runs || []).length, runs: runs || [] });
    }

    // POST: trigger or resume
    if (req.method === 'POST') {
      const body = req.body || {};

      if (action === 'resume') {
        if (!body.run_id) return res.status(400).json({ error: 'run_id required.' });
        const response = await fetch(`${agentUrl}/pipeline/resume/${encodeURIComponent(body.run_id)}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
        });
        return res.status(200).json(await response.json());
      }

      // Trigger
      const { pipeline_name, client_id, force_refresh } = body;
      if (!pipeline_name || !client_id) return res.status(400).json({ error: 'pipeline_name and client_id required.' });
      const response = await fetch(`${agentUrl}/pipeline/${encodeURIComponent(pipeline_name)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id, force_refresh: force_refresh || false }),
      });
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data.detail || 'Pipeline trigger failed', data });
      return res.status(202).json(data);
    }
  } catch (err) {
    console.error('Pipeline error:', err);
    return res.status(502).json({ error: 'Agent server unreachable or internal error.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
