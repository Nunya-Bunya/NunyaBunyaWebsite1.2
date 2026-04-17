// Vercel serverless function — handles contacts (admin) + blog posts (public)
const samplePosts = [
  {
    id: 'sample-1',
    topic: 'How AI-powered growth rewrites Brisbane marketing for local brands',
    client_name: 'Nunya Bunya',
    blog_post: '# How AI-powered growth rewrites Brisbane marketing for local brands\n\nBrisbane businesses don’t need another generic campaign. They need a marketing system that learns from customer behavior, scales without waste, and turns local attention into qualified leads.\n\n## Stop guessing and start optimizing\n\nMost small businesses still rely on gut feeling when choosing ad creative, landing pages, or email follow-ups. That’s why we build Test > Learn > Scale loops instead of one-off promotions.\n\n- Use AI to identify the highest-converting audience segments\n- Let the data guide your offers, not the other way around\n- Keep the customer journey simple and consistent\n\n## Make every touchpoint work harder\n\nWhen your website, social content, and email follow-up all speak the same message, your campaigns stop leaking leads. The secret is framing the same offer in three ways:\n\n1. Social posts that invite curiosity\n2. Landing pages that solve one problem clearly\n3. Email sequence that builds trust fast\n\n## Real results only matter if they’re repeatable\n\nThe difference between a good month and a great year is not one viral post. It’s a repeatable local launch cycle that gathers insight, optimises creative, and grows the pipeline predictably.\n\nIf you want to see how that looks for your Brisbane business, the next step is a simple strategy session.',
    image_prompt: 'Brisbane digital marketing, AI dashboard, local business growth, bright modern imagery',
    created_at: '2026-04-10T09:00:00Z',
    status: 'approved',
  },
  {
    id: 'sample-2',
    topic: 'Why your website needs a performance audit before launching every campaign',
    client_name: 'Nunya Bunya',
    blog_post: '# Why your website needs a performance audit before launching every campaign\n\nLaunching ads without auditing the website is one of the fastest ways to waste marketing spend. A strong campaign can give you leads, but a fast, clear website is what turns them into customers.\n\n## The 3-page conversion checklist\n\nBefore you send traffic, check that your website has:\n\n- A bold headline that clearly states the problem you solve\n- One clear action for the visitor to take next\n- Fast load speeds and a mobile-first layout\n\n## Avoid the common traffic trap\n\nWhen you increase spend, you also increase exposure to any friction on the site. The result is more clicks and fewer completed forms. An audit should reveal:\n\n- slow-loading sections\n- unclear messaging blocks\n- broken or hidden calls to action\n\n## Use the audit to unlock better campaigns\n\nA performance audit is not just a page review. It becomes the foundation for:\n\n1. better ad copy that matches the page\n2. fewer wasted clicks and lower cost per lead\n3. easier reporting on what actually moved the needle\n\nIf your site feels slow, confusing, or unfocused, an audit will tell you exactly what to fix before the next campaign launch.',
    image_prompt: 'marketing audit, website speed, conversion optimization, clean digital interface',
    created_at: '2026-04-12T08:30:00Z',
    status: 'approved',
  },
  {
    id: 'sample-3',
    topic: 'The simplest content strategy to attract high-value leads this quarter',
    client_name: 'Nunya Bunya',
    blog_post: '# The simplest content strategy to attract high-value leads this quarter\n\nA content strategy should not be a list of random ideas. It should be a short, repeatable plan that positions you as the trusted choice in your niche.\n\n## Focus on one high-value problem\n\nPick the one problem your best customers care about today, then create content that shows how you solve it. For example:\n\n- "How to stop wasting ad spend on unqualified enquiries"\n- "Why your website should speak to customers in plain language"\n- "What every Brisbane business needs in a booking funnel"\n\n## Publish with intention\n\nPublish one article and one social post each week that move the same message forward. Each piece should: \n\n- solve a single pain point\n- include one clear takeaway\n- invite the reader to book a strategy session\n\n## Measure what matters\n\nDon’t chase impressions. Track: \n\n- leads generated from the piece\n- quality of enquiries received\n- how many calls turned into next steps \n\nA simple content strategy is powerful because it makes your marketing predictable. Quality leads come from consistency, clarity, and a strong next-step offer.',
    image_prompt: 'high-value leads, simple content strategy, business growth, elegant marketing visuals',
    created_at: '2026-04-14T07:15:00Z',
    status: 'approved',
  },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const headers = SUPABASE_URL && SUPABASE_KEY ? { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } : null;

  // Blog endpoint: /api/contacts?blog=1 or /api/contacts?blog=1&id=UUID
  if (req.query.blog) {
    try {
      if (req.query.id) {
        if (headers) {
          const r = await fetch(`${SUPABASE_URL}/rest/v1/content_campaigns?id=eq.${req.query.id}&status=eq.approved`, { headers });
          if (r.ok) {
            const posts = await r.json();
            if (posts && posts[0]) return res.status(200).json({ post: posts[0] });
          }
        }

        const samplePost = samplePosts.find(p => p.id === req.query.id);
        return res.status(200).json({ post: samplePost || null });
      }

      if (headers) {
        const client = req.query.client || 'Nunya Bunya';
        const clientFilter = client === 'all' ? '' : `&client_name=eq.${encodeURIComponent(client)}`;
        const r = await fetch(`${SUPABASE_URL}/rest/v1/content_campaigns?status=eq.approved${clientFilter}&order=created_at.desc&limit=50&select=id,topic,client_name,blog_post,image_prompt,created_at,status`, { headers });
        if (r.ok) {
          const posts = await r.json();
          if (posts && posts.length) return res.status(200).json({ posts });
        }
      }
    } catch (err) {
      console.warn('Blog API fallback:', err?.message || err);
    }

    return res.status(200).json({ posts: samplePosts });
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
