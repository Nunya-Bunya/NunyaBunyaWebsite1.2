#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────
// GitHub Resource Sync — Fetches awesome + public-apis repos,
// parses Markdown, upserts into Supabase tables.
//
// Usage:  node scripts/sync-github-resources.js
// Env:    SUPABASE_URL, SUPABASE_KEY (service role)
//
// Tables required in Supabase:
//   public_apis   — columns: id (uuid), name, description, auth, https, cors, category, url, synced_at
//   awesome_lists — columns: id (uuid), name, description, url, category, parent_name, synced_at
// ─────────────────────────────────────────────────────────────────
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

// ── Supabase helper ──
async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=minimal,resolution=merge-duplicates',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('json') ? res.json() : null;
}

// ── Fetch raw file from GitHub ──
async function fetchGitHub(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${url}`);
  return res.text();
}

// ─────────────────────────────────────────────────────────────────
// PARSER: public-apis/public-apis
// ─────────────────────────────────────────────────────────────────
function parsePublicApis(md) {
  const lines = md.split('\n');
  const entries = [];
  let category = '';

  for (const line of lines) {
    // Category heading: ### Animals
    if (line.startsWith('### ')) {
      category = line.replace('### ', '').trim();
      continue;
    }

    // Data row: | [Name](url) | Description | Auth | HTTPS | CORS |
    const match = line.match(
      /^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|?\s*$/
    );
    if (match) {
      entries.push({
        name: match[1].trim(),
        url: match[2].trim(),
        description: match[3].trim(),
        auth: match[4].trim().replace(/`/g, ''),
        https: match[5].trim(),
        cors: match[6].trim(),
        category,
        synced_at: new Date().toISOString(),
      });
    }
  }

  return entries;
}

// ─────────────────────────────────────────────────────────────────
// PARSER: sindresorhus/awesome
// ─────────────────────────────────────────────────────────────────
function parseAwesome(md) {
  const lines = md.split('\n');
  const entries = [];
  let category = '';

  for (const line of lines) {
    // Category heading: ## Platforms
    if (/^## /.test(line) && !line.includes('Contents')) {
      category = line.replace('## ', '').trim();
      continue;
    }

    // Top-level entry: - [Name](url) - Description.
    const topMatch = line.match(/^- \[([^\]]+)\]\(([^)]+)\)\s*(?:-\s*(.*))?$/);
    if (topMatch) {
      entries.push({
        name: topMatch[1].trim(),
        url: topMatch[2].trim(),
        description: (topMatch[3] || '').trim().replace(/\.$/, ''),
        category,
        parent_name: null,
        synced_at: new Date().toISOString(),
      });
      continue;
    }

    // Sub-entry (tab-indented): \t- [Name](url) - Description.
    const subMatch = line.match(/^\t- \[([^\]]+)\]\(([^)]+)\)\s*(?:-\s*(.*))?$/);
    if (subMatch && entries.length > 0) {
      const parent = entries[entries.length - 1];
      // Only use parent if it's in the same category (safety check)
      const parentName = parent.category === category ? parent.name : null;
      entries.push({
        name: subMatch[1].trim(),
        url: subMatch[2].trim(),
        description: (subMatch[3] || '').trim().replace(/\.$/, ''),
        category,
        parent_name: parentName,
        synced_at: new Date().toISOString(),
      });
    }
  }

  return entries;
}

// ─────────────────────────────────────────────────────────────────
// UPSERT in batches
// ─────────────────────────────────────────────────────────────────
async function upsertBatch(table, rows, onConflict) {
  const BATCH = 200;
  let total = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await supabaseFetch(`${table}?on_conflict=${onConflict}`, {
      method: 'POST',
      body: JSON.stringify(batch),
    });
    total += batch.length;
    process.stdout.write(`  ${table}: ${total}/${rows.length}\r`);
  }
  console.log(`  ${table}: ${total}/${rows.length} ✓`);
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('── GitHub Resource Sync ──\n');

  // 1. Fetch both READMEs in parallel
  console.log('Fetching READMEs...');
  const [publicApisMd, awesomeMd] = await Promise.all([
    fetchGitHub('https://raw.githubusercontent.com/public-apis/public-apis/master/README.md'),
    fetchGitHub('https://raw.githubusercontent.com/sindresorhus/awesome/main/readme.md'),
  ]);

  // 2. Parse
  console.log('Parsing...');
  const apis = parsePublicApis(publicApisMd);
  const lists = parseAwesome(awesomeMd);
  console.log(`  public_apis: ${apis.length} entries parsed`);
  console.log(`  awesome_lists: ${lists.length} entries parsed`);

  // 3. Upsert into Supabase
  console.log('\nUpserting to Supabase...');
  await upsertBatch('public_apis', apis, 'name,category');
  await upsertBatch('awesome_lists', lists, 'name,category');

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
