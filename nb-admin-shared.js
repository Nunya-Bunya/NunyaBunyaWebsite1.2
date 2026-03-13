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
      { id: 'dashboard', label: 'Dashboard', icon: '&#9670;', href: '/nb-admin-dashboard' },
      { id: 'clients', label: 'Clients', icon: '&#9632;', href: '/nb-admin-clients' },
      { id: 'calendar', label: 'Calendar', icon: '&#9783;', href: '/nb-admin-calendar' },
      { id: 'week', label: 'This Week', icon: '&#9776;', href: '/nb-admin-week' },
      { id: 'tasks', label: "Today's Tasks", icon: '&#10003;', href: '/nb-admin-tasks' },
      { id: 'leads', label: 'Leads', icon: '&#9993;', href: '/nb-admin-leads' },
    ];

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <img src="/images/logo-icon-white.png" alt="NB">
      </div>
      <div class="sidebar-label">Admin Panel</div>
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
};
