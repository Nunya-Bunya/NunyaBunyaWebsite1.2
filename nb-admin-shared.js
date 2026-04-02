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
    const pages = [
      { id: 'my-day', label: 'My Day', icon: '&#9728;', href: '/nb-admin-my-day' },
      { id: 'dashboard', label: 'Dashboard', icon: '&#9670;', href: '/nb-admin-dashboard' },
      { id: 'clients', label: 'Clients', icon: '&#9632;', href: '/nb-admin-clients' },
      { id: 'calendar', label: 'Calendar', icon: '&#9783;', href: '/nb-admin-calendar' },
      { id: 'calendar-edit', label: 'Calendar Editor', icon: '&#128197;', href: '/nb-admin-calendar-edit' },
      { id: 'week', label: 'This Week', icon: '&#9776;', href: '/nb-admin-week' },
      { id: 'tasks', label: "Today's Tasks", icon: '&#10003;', href: '/nb-admin-tasks' },
      { id: 'approval', label: 'Approval Queue', icon: '&#9998;', href: '/nb-admin-approval' },
      { id: 'pipelines', label: 'Pipelines', icon: '&#9881;', href: '/nb-admin-pipelines' },
      { id: 'onboard', label: 'Onboard Client', icon: '&#10010;', href: '/nb-admin-onboard' },
      { id: 'reports', label: 'Reports', icon: '&#9776;', href: '/nb-admin-reports' },
      { id: 'leads', label: 'Leads', icon: '&#9993;', href: '/nb-admin-leads' },
      { id: 'analytics', label: 'Analytics', icon: '&#9636;', href: '/nb-admin-analytics' },
      { id: 'email-campaigns', label: 'Email Campaigns', icon: '&#9993;', href: '/nb-admin-email-campaigns' },
      { id: 'social-feed', label: 'Social Feed', icon: '&#128172;', href: '/nb-admin-social-feed' },
      { id: 'activity', label: 'Activity Log', icon: '&#9200;', href: '/nb-admin-activity' },
      { id: 'benchmark', label: 'Benchmark', icon: '&#9201;', href: '/nb-admin-benchmark' },
      { id: 'landing-pages', label: 'Landing Pages', icon: '&#9873;', href: '/nb-admin-landing-pages' },
      { id: 'lead-magnets', label: 'Lead Magnets', icon: '&#9883;', href: '/nb-admin-lead-magnets' },
      { id: 'brand-docs', label: 'Brand Docs', icon: '&#9997;', href: '/nb-admin-brand-docs' },
      { id: 'client-portal', label: 'Client Portal', icon: '&#128101;', href: '/nb-admin-client-portal' },
      { id: 'settings', label: 'Settings', icon: '&#9881;', href: '/nb-admin-settings' },
    ];

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <img src="/images/logo-icon-white.png" alt="NB">
      </div>
      <div class="sidebar-label">NBHQ</div>
      <nav class="sidebar-nav">
        ${pages.map(p => `
          <a href="${p.href}" class="sidebar-link ${p.id === activePage ? 'active' : ''}">
            <span class="icon">${p.icon}</span> ${p.label}
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <button onclick="NB_ADMIN.logout()">Logout</button>
      </div>
    `;
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
