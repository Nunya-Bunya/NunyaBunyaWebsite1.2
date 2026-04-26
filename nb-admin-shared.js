// Nunya Bunya Admin Dashboard — Shared JavaScript
// Auth check, sidebar rendering, utility functions

const NB_ADMIN = {
  // Auth check — call on every admin page load
  async checkAuth() {
    try {
      const res = await fetch('/api/auth');
      if (!res.ok) {
        window.location.href = '/nb-admin-login';
        return false;
      }
      return true;
    } catch {
      window.location.href = '/nb-admin-login';
      return false;
    }
  },

  // Logout
  async logout() {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.href = '/nb-admin-login';
  },

  // Render sidebar nav
  renderSidebar(activePage) {
    // ADHD-friendly sidebar: grouped + collapsible
    // Daily section always visible. Everything else collapsed by default.
    const sections = [
      {
        label: null, // No label = always visible, no header
        pages: [
          { id: 'my-day', label: 'My Day', icon: '&#9728;', href: '/nb-admin-my-day' },
          { id: 'approval', label: 'Approve Content', icon: '&#9998;', href: '/nb-admin-approval' },
          { id: 'bfk', label: 'BFK Submissions', icon: '&#128218;', href: '/nb-admin-bfk' },
          { id: 'dashboard', label: 'Dashboard', icon: '&#9670;', href: '/nb-admin-dashboard' },
          { id: 'inventory', label: 'Asset Inventory', icon: '&#128230;', href: '/nb-admin-inventory' },
          { id: 'playbook', label: 'Playbook', icon: '&#9889;', href: '/nb-admin-playbook' },
          { id: 'shipping-tracker', label: 'Shipping Tracker', icon: '&#128640;', href: '/nb-admin-shipping-tracker' },
        ]
      },
      {
        label: 'Clients',
        pages: [
          { id: 'clients', label: 'All Clients', icon: '&#9632;', href: '/nb-admin-clients' },
          { id: 'onboard', label: 'Onboard New', icon: '&#10010;', href: '/nb-admin-onboard' },
          { id: 'client-portal', label: 'Client Portal', icon: '&#128101;', href: '/nb-admin-client-portal' },
        ]
      },
      {
        label: 'Content',
        pages: [
          { id: 'calendar', label: 'Calendar', icon: '&#9783;', href: '/nb-admin-calendar' },
          { id: 'calendar-edit', label: 'Calendar Editor', icon: '&#128197;', href: '/nb-admin-calendar-edit' },
          { id: 'voice-memos', label: 'Voice Memos', icon: '&#127908;', href: '/nb-admin-voice-memos' },
          { id: 'content-tracker', label: 'Content Tracker', icon: '&#128203;', href: '/nb-admin-content-tracker' },
          { id: 'social-feed', label: 'Social Feed', icon: '&#128172;', href: '/nb-admin-social-feed' },
          { id: 'pipelines', label: 'Pipelines', icon: '&#9881;', href: '/nb-admin-pipelines' },
          { id: 'ad-factory', label: 'Ad Factory', icon: '&#127981;', href: '/nb-admin-ad-factory' },
          { id: 'swipe-file', label: 'Swipe File', icon: '&#128293;', href: '/nb-admin-swipe-file' },
        ]
      },
      {
        label: 'Marketing',
        pages: [
          { id: 'analytics', label: 'Analytics', icon: '&#9636;', href: '/nb-admin-analytics' },
          { id: 'email-hub', label: 'Email Hub', icon: '&#9993;', href: '/nb-admin-email-hub' },
          { id: 'email-campaigns', label: 'Email Campaigns', icon: '&#9993;', href: '/nb-admin-email-campaigns' },
          { id: 'leads', label: 'Leads', icon: '&#9993;', href: '/nb-admin-leads' },
          { id: 'job-outreach', label: 'Job Outreach', icon: '&#128231;', href: '/nb-admin-job-outreach' },
          { id: 'landing-pages', label: 'Landing Pages', icon: '&#9873;', href: '/nb-admin-landing-pages' },
          { id: 'lead-magnets', label: 'Lead Magnets', icon: '&#9883;', href: '/nb-admin-lead-magnets' },
        ]
      },
      {
        label: 'Reference',
        pages: [
          { id: 'docs', label: 'Documents', icon: '&#128218;', href: '/nb-admin-docs' },
          { id: 'ops-manual', label: 'Operations Manual', icon: '&#128214;', href: '/nb-admin-ops-manual' },
          { id: 'brand-docs', label: 'Brand Docs', icon: '&#9997;', href: '/nb-admin-brand-docs' },
          { id: 'design-library', label: 'Design Library', icon: '&#127912;', href: '/nb-admin-design-library' },
          { id: 'skills-library', label: 'Skills Library', icon: '&#129520;', href: '/nb-admin-skills-library' },
          { id: 'agent-registry', label: 'Agent Registry', icon: '&#129302;', href: '/nb-admin-agent-registry' },
          { id: 'reports', label: 'Reports', icon: '&#9776;', href: '/nb-admin-reports' },
          { id: 'integrations', label: 'Integrations', icon: '&#128268;', href: '/nb-admin-integrations' },
          { id: 'slack-routing', label: 'Slack Routing', icon: '&#128172;', href: '/nb-admin-slack-routing' },
          { id: 'cron-jobs', label: 'Cron Jobs', icon: '&#9201;', href: '/nb-admin-cron-jobs' },
          { id: 'deployments', label: 'Deployments', icon: '&#128640;', href: '/nb-admin-deployments' },
          { id: 'activity', label: 'Activity Log', icon: '&#9200;', href: '/nb-admin-activity' },
          { id: 'settings', label: 'Settings', icon: '&#9881;', href: '/nb-admin-settings' },
        ]
      },
    ];

    // Flatten for backward compatibility
    const pages = sections.flatMap(s => s.pages);

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Check which section the active page is in
    const activeSection = sections.find(s => s.pages.some(p => p.id === activePage));

    // Load collapsed state from localStorage
    const collapsed = JSON.parse(localStorage.getItem('nbhq_collapsed') || '{}');

    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <img src="/images/logo-icon-white.png" alt="NB">
      </div>
      <div class="sidebar-label">NBHQ</div>
      <nav class="sidebar-nav">
        ${sections.map((section, si) => {
          if (!section.label) {
            // Top-level pages — always visible
            return section.pages.map(p => `
              <a href="${p.href}" class="sidebar-link ${p.id === activePage ? 'active' : ''}">
                <span class="icon">${p.icon}</span> ${p.label}
              </a>
            `).join('');
          }

          // Collapsible section — open if active page is inside, or if user expanded it
          const hasActive = section.pages.some(p => p.id === activePage);
          const isCollapsed = hasActive ? false : (collapsed[section.label] !== false);

          return `
            <div class="sidebar-section ${isCollapsed ? 'collapsed' : ''}" data-section="${section.label}">
              <div class="sidebar-section-header" onclick="NB_ADMIN.toggleSection('${section.label}')">
                <span>${section.label}</span>
                <span class="sidebar-chevron">${isCollapsed ? '+' : '-'}</span>
              </div>
              <div class="sidebar-section-links" style="${isCollapsed ? 'display:none' : ''}">
                ${section.pages.map(p => `
                  <a href="${p.href}" class="sidebar-link ${p.id === activePage ? 'active' : ''}">
                    <span class="icon">${p.icon}</span> ${p.label}
                  </a>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </nav>
      <div class="sidebar-footer">
        <button onclick="NB_ADMIN.logout()">Logout</button>
      </div>
    `;
  },

  // Toggle sidebar sections
  toggleSection(label) {
    const collapsed = JSON.parse(localStorage.getItem('nbhq_collapsed') || '{}');
    collapsed[label] = collapsed[label] === false ? true : false;
    localStorage.setItem('nbhq_collapsed', JSON.stringify(collapsed));
    const section = document.querySelector(`[data-section="${label}"]`);
    if (section) {
      const links = section.querySelector('.sidebar-section-links');
      const chevron = section.querySelector('.sidebar-chevron');
      if (links.style.display === 'none') {
        links.style.display = '';
        chevron.textContent = '-';
        section.classList.remove('collapsed');
      } else {
        links.style.display = 'none';
        chevron.textContent = '+';
        section.classList.add('collapsed');
      }
    }
  },

  // Fetch from admin API with auth cookie
  async apiFetch(path) {
    const res = await fetch('/api/admin/' + path);
    if (res.status === 401) {
      window.location.href = '/nb-admin-login';
      return null;
    }
    if (!res.ok) {
      console.error(`API error ${res.status}:`, await res.text());
      return null;
    }
    return res.json();
  },

  // PATCH/PUT/POST to admin API
  async apiSend(path, method, body) {
    const res = await fetch('/api/admin/' + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      window.location.href = '/nb-admin-login';
      return null;
    }
    if (!res.ok) {
      console.error(`API error ${res.status}:`, await res.text());
      return null;
    }
    return res.json();
  },

  // Date utilities
  formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  formatDateFull(d) {
    return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  },

  getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  },

  toDateStr(d) {
    // Return YYYY-MM-DD
    const date = new Date(d);
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  },

  todayStr() {
    return this.toDateStr(new Date());
  },

  // Get platform CSS class
  platformClass(platform) {
    const p = (platform || '').toLowerCase();
    if (p.includes('instagram')) return 'instagram';
    if (p.includes('linkedin')) return 'linkedin';
    if (p.includes('facebook')) return 'facebook';
    if (p.includes('tiktok')) return 'tiktok';
    if (p.includes('blog')) return 'blog';
    return '';
  },

  // Tier badge
  tierBadge(tier) {
    const t = (tier || 'client').toLowerCase();
    return `<span class="badge-tier ${t}">${tier || 'Client'}</span>`;
  },

  // Status badge
  statusBadge(status) {
    const s = (status || 'planned').toLowerCase();
    return `<span class="badge-status ${s}">${status || 'Planned'}</span>`;
  },

  // Platform badge
  platformBadge(platform) {
    const cls = this.platformClass(platform);
    return `<span class="badge-platform ${cls}">${platform}</span>`;
  },

  // HTML escape
  esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Greeting
  greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  },

  // Pipeline status badge
  pipelineBadge(status) {
    const s = (status || 'unknown').toLowerCase();
    const labels = {
      running: 'Running', completed: 'Completed', failed: 'Failed',
      paused_review: 'Paused', unknown: 'Unknown',
    };
    return `<span class="badge-pipeline ${s}">${labels[s] || s}</span>`;
  },

  // Content type badge
  typeBadge(type) {
    const t = (type || '').toLowerCase();
    const labels = {
      content_campaign: 'Blog', social_post: 'Social', review_response: 'Review',
      weekly_report: 'Report', blog_post: 'Blog', social: 'Social',
      voice_memo: 'Voice Memo', email_draft: 'Email', task: 'Task',
    };
    return `<span class="badge-type ${t.replace('_', '-')}">${labels[t] || type}</span>`;
  },

  // Item type icon
  typeIcon(type) {
    const icons = {
      content_campaign: '&#128221;', social_post: '&#128247;',
      review_response: '&#11088;', weekly_report: '&#128200;',
    };
    return icons[type] || '&#128196;';
  },

  // Poll pipeline status until complete
  async pollPipeline(runId, callback, intervalMs = 5000) {
    const poll = async () => {
      const data = await this.apiFetch(`pipeline?run_id=${runId}`);
      if (!data) return;
      callback(data);
      if (data.status === 'running' || data.status === 'paused_review') {
        setTimeout(poll, intervalMs);
      }
    };
    poll();
  },

  // Format duration in seconds to human-readable
  formatDuration(seconds) {
    if (!seconds && seconds !== 0) return '—';
    const s = Math.round(seconds);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    if (m < 60) return `${m}m ${rem}s`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  },

  // Relative time (e.g. "2 hours ago")
  timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  },
};
