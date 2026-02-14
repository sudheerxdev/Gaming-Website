const API_BASE = window.GAMEHUB_API_BASE || localStorage.getItem('gamehub_api_base') || 'http://localhost:5000/api';
const TOKEN_KEY = 'gamehub_token';
const USER_KEY = 'gamehub_user';

const toastWrapId = 'toast-wrap';

const ensureToastWrap = () => {
  let wrap = document.getElementById(toastWrapId);
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = toastWrapId;
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }

  return wrap;
};

export const toast = (message, type = '') => {
  const wrap = ensureToastWrap();
  const el = document.createElement('div');
  el.className = `toast ${type}`.trim();
  el.textContent = message;
  wrap.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    setTimeout(() => el.remove(), 200);
  }, 3200);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
};

export const setSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const api = async (path, options = {}) => {
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  };

  if (options.auth !== false && getToken()) {
    config.headers.Authorization = `Bearer ${getToken()}`;
  }

  if (options.body !== undefined) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${path}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return data;
};

export const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const formatMoney = (value) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);

export const getStatusClass = (status) => String(status || '').toLowerCase();

export const statusBadge = (status) => `<span class="badge ${getStatusClass(status)}">${status}</span>`;

export const initNavbar = () => {
  const navLinks = document.querySelector('.nav-links');
  const toggle = document.querySelector('.mobile-toggle');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  const authSlot = document.querySelector('[data-auth-slot]');
  if (authSlot) {
    const user = getUser();
    if (user) {
      authSlot.innerHTML = `
        <a class="nav-link" href="dashboard.html">Dashboard</a>
        <button class="btn ghost" id="logout-btn">Logout</button>
      `;

      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          clearSession();
          toast('Logged out');
          window.location.href = 'index.html';
        });
      }
    } else {
      authSlot.innerHTML = `
        <a class="nav-link" href="login.html">Login</a>
        <a class="btn" href="register.html">Sign Up</a>
      `;
    }
  }

  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach((link) => {
    if (link.getAttribute('data-page') === current) {
      link.classList.add('active');
    }
  });
};

export const requireAuth = () => {
  if (!getToken()) {
    window.location.href = 'login.html';
    throw new Error('Unauthorized');
  }
};

export const hydrateUser = async () => {
  if (!getToken()) {
    return null;
  }

  try {
    const data = await api('/auth/me');
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    }
  } catch (_error) {
    clearSession();
  }

  return null;
};

export const setSkeleton = (container, count = 3, height = 120) => {
  container.innerHTML = Array.from({ length: count })
    .map(() => `<div class="skeleton" style="height:${height}px"></div>`)
    .join('');
};

export const parseQuery = () => {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
};

export const countdown = (container, targetDate) => {
  const target = new Date(targetDate).getTime();
  if (!container) {
    return () => null;
  }

  const render = () => {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      container.innerHTML = '<span>00d</span><span>00h</span><span>00m</span><span>00s</span>';
      return false;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    container.innerHTML = `<span>${String(days).padStart(2, '0')}d</span><span>${String(hours).padStart(2, '0')}h</span><span>${String(mins).padStart(2, '0')}m</span><span>${String(secs).padStart(2, '0')}s</span>`;
    return true;
  };

  render();
  const timer = setInterval(() => {
    const active = render();
    if (!active) {
      clearInterval(timer);
    }
  }, 1000);

  return () => clearInterval(timer);
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
    } catch (_error) {
      return null;
    }
  }

  return null;
};
