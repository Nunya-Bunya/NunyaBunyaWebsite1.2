// Admin API: Playbook — templates, runs, steps, metrics, launch
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { action } = req.query;

  try {
    // ═══ GET ═══
    if (req.method === 'GET') {

      // GET /playbook?action=templates — list all play templates
      if (action === 'templates') {
        const templates = await supabaseFetch('play_templates?active=eq.true&order=name.asc');
        return res.status(200).json({ templates: templates || [] });
      }

      // GET /playbook?action=template&slug=first-dollar — single template detail
      if (action === 'template') {
        const { slug } = req.query;
        if (!slug) return res.status(400).json({ error: 'slug required' });
        const templates = await supabaseFetch(`play_templates?slug=eq.${encodeURIComponent(slug)}`);
        if (!templates || !templates.length) return res.status(404).json({ error: 'Template not found' });
        return res.status(200).json({ template: templates[0] });
      }

      // GET /playbook?action=runs — list play runs with optional filters
      if (action === 'runs') {
        const { client_id, status, play_slug, limit } = req.query;
        let query = 'play_runs?order=created_at.desc';
        if (client_id) query += `&client_id=eq.${encodeURIComponent(client_id)}`;
        if (status) query += `&status=eq.${encodeURIComponent(status)}`;
        if (play_slug) query += `&play_slug=eq.${encodeURIComponent(play_slug)}`;
        query += `&limit=${limit || 50}`;
        const runs = await supabaseFetch(query);
        return res.status(200).json({ total: (runs || []).length, runs: runs || [] });
      }

      // GET /playbook?action=run&id=xxx — single run with steps
      if (action === 'run') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'id required' });
        const runs = await supabaseFetch(`play_runs?id=eq.${encodeURIComponent(id)}`);
        if (!runs || !runs.length) return res.status(404).json({ error: 'Run not found' });
        const steps = await supabaseFetch(`play_steps?play_run_id=eq.${encodeURIComponent(id)}&order=sort_order.asc`);
        const metrics = await supabaseFetch(`play_metrics?play_run_id=eq.${encodeURIComponent(id)}&order=day_number.desc&limit=7`);
        return res.status(200).json({ run: runs[0], steps: steps || [], metrics: metrics || [] });
      }

      // GET /playbook?action=metrics&run_id=xxx — metrics for a run
      if (action === 'metrics') {
        const { run_id } = req.query;
        if (!run_id) return res.status(400).json({ error: 'run_id required' });
        const metrics = await supabaseFetch(`play_metrics?play_run_id=eq.${encodeURIComponent(run_id)}&order=day_number.asc`);
        return res.status(200).json({ metrics: metrics || [] });
      }

      return res.status(400).json({ error: 'Unknown action. Use: templates, template, runs, run, metrics' });
    }

    // ═══ POST ═══
    if (req.method === 'POST') {
      const body = req.body || {};

      // POST /playbook?action=launch — launch a play for a client
      if (action === 'launch') {
        const { play_slug, client_id, client_name, inputs } = body;
        if (!play_slug || !client_id) return res.status(400).json({ error: 'play_slug and client_id required' });

        // Get the template
        const templates = await supabaseFetch(`play_templates?slug=eq.${encodeURIComponent(play_slug)}`);
        if (!templates || !templates.length) return res.status(404).json({ error: 'Play template not found' });
        const template = templates[0];

        // Create the run
        const now = new Date().toISOString();
        const runData = {
          play_template_id: template.id,
          play_slug: template.slug,
          client_id,
          client_name: client_name || client_id,
          status: 'active',
          inputs: inputs || {},
          total_steps: template.steps.length,
          completed_steps: 0,
          current_day: 1,
          started_at: now,
        };

        const runs = await supabaseFetch('play_runs', {
          method: 'POST',
          body: JSON.stringify(runData),
          headers: { 'Prefer': 'return=representation' },
        });

        if (!runs || !runs.length) return res.status(500).json({ error: 'Failed to create play run' });
        const run = runs[0];

        // Create step instances from template
        const stepInserts = template.steps.map((step, i) => ({
          play_run_id: run.id,
          step_key: step.key,
          name: step.name,
          agent: step.agent || null,
          step_type: step.type,
          status: step.depends_on && step.depends_on.length > 0 ? 'pending' : 'queued',
          schedule: step.schedule || null,
          input_data: {},
          sort_order: i,
          depends_on: step.depends_on || [],
        }));

        await supabaseFetch('play_steps', {
          method: 'POST',
          body: JSON.stringify(stepInserts),
        });

        // Create initial metrics row
        await supabaseFetch('play_metrics', {
          method: 'POST',
          body: JSON.stringify({
            play_run_id: run.id,
            day_number: 1,
            metrics: {},
            notes: 'Play launched',
          }),
        });

        // Create approval items for human-review steps
        const approvalSteps = template.steps.filter(s => s.type === 'approval' || s.type === 'human');
        for (const step of approvalSteps) {
          if (step.type === 'human') {
            // Create a daily task instead
            await supabaseFetch('daily_tasks', {
              method: 'POST',
              body: JSON.stringify({
                task_date: now.split('T')[0],
                title: `[${template.name}] ${step.name}`,
                description: step.description,
                status: 'pending',
                client_id,
                source: 'playbook',
                source_id: run.id,
              }),
            });
          }
        }

        return res.status(201).json({ run, message: `${template.name} launched for ${client_name || client_id}` });
      }

      // POST /playbook?action=record_metrics — record daily metrics
      if (action === 'record_metrics') {
        const { run_id, day_number, metrics, notes } = body;
        if (!run_id || !metrics) return res.status(400).json({ error: 'run_id and metrics required' });

        const result = await supabaseFetch('play_metrics', {
          method: 'POST',
          body: JSON.stringify({
            play_run_id: run_id,
            day_number: day_number || 0,
            metrics,
            notes: notes || null,
          }),
          headers: { 'Prefer': 'return=representation' },
        });

        return res.status(201).json({ metric: result?.[0] || null });
      }

      return res.status(400).json({ error: 'Unknown action. Use: launch, record_metrics' });
    }

    // ═══ PATCH ═══
    if (req.method === 'PATCH') {

      // PATCH /playbook?action=run — update a run (pause, resume, complete, cancel)
      if (action === 'run') {
        const { id, status, notes } = req.body || {};
        if (!id) return res.status(400).json({ error: 'id required' });

        const updates = { updated_at: new Date().toISOString() };
        if (status) {
          updates.status = status;
          if (status === 'paused') updates.paused_at = new Date().toISOString();
          if (status === 'completed') updates.completed_at = new Date().toISOString();
          if (status === 'active') updates.paused_at = null;
        }
        if (notes !== undefined) updates.notes = notes;

        const result = await supabaseFetch(
          `play_runs?id=eq.${encodeURIComponent(id)}`,
          { method: 'PATCH', body: JSON.stringify(updates), headers: { 'Prefer': 'return=representation' } }
        );

        return res.status(200).json({ run: result?.[0] || null });
      }

      // PATCH /playbook?action=step — update a step status
      if (action === 'step') {
        const { id, status, output_data, error } = req.body || {};
        if (!id) return res.status(400).json({ error: 'id required' });

        const updates = {};
        if (status) {
          updates.status = status;
          if (status === 'running') updates.started_at = new Date().toISOString();
          if (status === 'completed') {
            updates.completed_at = new Date().toISOString();
            updates.run_count = 'run_count + 1'; // Note: needs RPC for increment
          }
        }
        if (output_data) updates.output_data = output_data;
        if (error) updates.error = error;

        const result = await supabaseFetch(
          `play_steps?id=eq.${encodeURIComponent(id)}`,
          { method: 'PATCH', body: JSON.stringify(updates), headers: { 'Prefer': 'return=representation' } }
        );

        // Update parent run's completed_steps count
        if (status === 'completed') {
          const step = result?.[0];
          if (step) {
            const allSteps = await supabaseFetch(`play_steps?play_run_id=eq.${encodeURIComponent(step.play_run_id)}`);
            const completedCount = (allSteps || []).filter(s => s.status === 'completed').length;
            await supabaseFetch(
              `play_runs?id=eq.${encodeURIComponent(step.play_run_id)}`,
              { method: 'PATCH', body: JSON.stringify({ completed_steps: completedCount, updated_at: new Date().toISOString() }) }
            );
          }
        }

        return res.status(200).json({ step: result?.[0] || null });
      }

      return res.status(400).json({ error: 'Unknown action. Use: run, step' });
    }

  } catch (err) {
    console.error('Playbook error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
