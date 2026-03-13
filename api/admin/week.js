// Admin API: GET weekly view data, PUT weekly notes
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

function toDateStr(d) {
  const date = new Date(d);
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function addDays(d, n) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  // PUT: Save weekly notes
  if (req.method === 'PUT') {
    const { client_id, week_start, accomplished, in_progress, upcoming, notes } = req.body || {};
    if (!client_id || !week_start) return res.status(400).json({ error: 'client_id and week_start required.' });

    try {
      // Upsert using Supabase on-conflict
      const result = await supabaseFetch(
        'dashboard_weekly_notes',
        {
          method: 'POST',
          body: JSON.stringify({
            client_id, week_start, accomplished, in_progress, upcoming, notes,
            updated_at: new Date().toISOString(),
          }),
          headers: { 'Prefer': 'resolution=merge-duplicates' },
          prefer: 'resolution=merge-duplicates',
        }
      );
      return res.status(200).json({ success: true, note: result?.[0] || null });
    } catch (err) {
      console.error('Weekly notes save error:', err);
      return res.status(500).json({ error: 'Failed to save weekly notes.' });
    }
  }

  // GET: Fetch three weeks of data
  if (req.method === 'GET') {
    const refDate = req.query.date || new Date().toISOString().slice(0, 10);
    const client = req.query.client;

    const thisMon = getMonday(refDate);
    const lastMon = addDays(thisMon, -7);
    const nextMon = addDays(thisMon, 7);
    const nextSunEnd = addDays(nextMon, 6);

    const lastStart = toDateStr(lastMon);
    const nextEnd = toDateStr(nextSunEnd);

    try {
      let contentQuery = `dashboard_content_items?date=gte.${lastStart}&date=lte.${nextEnd}&order=date.asc,platform.asc`;
      let notesQuery = `dashboard_weekly_notes?week_start=in.(${toDateStr(lastMon)},${toDateStr(thisMon)},${toDateStr(nextMon)})&order=week_start.asc`;

      if (client && client !== 'all') {
        contentQuery += `&client_id=eq.${encodeURIComponent(client)}`;
        notesQuery += `&client_id=eq.${encodeURIComponent(client)}`;
      }

      const [items, weekNotes] = await Promise.all([
        supabaseFetch(contentQuery),
        supabaseFetch(notesQuery),
      ]);

      // Group content by week
      const lastSun = toDateStr(addDays(thisMon, -1));
      const thisSun = toDateStr(addDays(thisMon, 6));

      const lastWeekItems = items.filter(i => i.date >= lastStart && i.date <= lastSun);
      const thisWeekItems = items.filter(i => i.date >= toDateStr(thisMon) && i.date <= thisSun);
      const nextWeekItems = items.filter(i => i.date >= toDateStr(nextMon) && i.date <= nextEnd);

      // Map notes by week_start
      const notesByWeek = {};
      (weekNotes || []).forEach(n => { notesByWeek[n.week_start] = n; });

      return res.status(200).json({
        last_week: {
          start: lastStart,
          end: lastSun,
          items: lastWeekItems,
          notes: notesByWeek[toDateStr(lastMon)] || null,
        },
        this_week: {
          start: toDateStr(thisMon),
          end: thisSun,
          items: thisWeekItems,
          notes: notesByWeek[toDateStr(thisMon)] || null,
        },
        next_week: {
          start: toDateStr(nextMon),
          end: nextEnd,
          items: nextWeekItems,
          notes: notesByWeek[toDateStr(nextMon)] || null,
        },
      });
    } catch (err) {
      console.error('Week view error:', err);
      return res.status(500).json({ error: 'Failed to fetch week data.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
