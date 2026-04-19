// NBHQ Admin API — Repurpose engine (trigger + poll)
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';
import { spawn } from 'child_process';

const PYTHON = '/Users/benalekconner/.pyenv/versions/3.12.11/bin/python3';
const AGENT_SCRIPT = '/Users/benalekconner/Desktop/MASTER WORKSPACE/00-Ben HQ/NunyaBunyaAgents/Execution/repurpose_agent.py';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = requireAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  // POST — trigger a repurpose job
  if (req.method === 'POST') {
    try {
      const { swipe_entry_id, target_brand } = req.body || {};
      if (!swipe_entry_id || !target_brand) {
        return res.status(400).json({ error: 'swipe_entry_id and target_brand required' });
      }

      // Create job row
      const jobs = await supabaseFetch('repurpose_jobs', {
        method: 'POST',
        body: JSON.stringify({
          swipe_entry_id,
          target_brand,
          status: 'pending',
          progress_message: 'Starting...',
        }),
        prefer: 'return=representation',
      });

      const job = Array.isArray(jobs) ? jobs[0] : jobs;
      const jobId = job.id;

      // Spawn Python agent as detached child process
      const child = spawn(PYTHON, [
        AGENT_SCRIPT,
        '--job-id', jobId,
        '--swipe-id', swipe_entry_id,
        '--brand', target_brand,
      ], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();

      return res.status(201).json({ job_id: jobId, status: 'pending' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // GET — poll job status
  if (req.method === 'GET') {
    try {
      const { job_id } = req.query || {};
      if (!job_id) return res.status(400).json({ error: 'job_id required' });

      const jobs = await supabaseFetch(`repurpose_jobs?id=eq.${job_id}`);
      if (!jobs || jobs.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const job = jobs[0];

      // If complete, also fetch the generated ad
      let result_ad = null;
      if (job.status === 'complete' && job.result_ad_id) {
        const ads = await supabaseFetch(`ad_factory_entries?id=eq.${job.result_ad_id}`);
        if (ads && ads.length > 0) result_ad = ads[0];
      }

      return res.status(200).json({
        job_id: job.id,
        status: job.status,
        progress_message: job.progress_message,
        analysis: job.analysis,
        result_ad_id: job.result_ad_id,
        result_ad,
        error: job.error,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
