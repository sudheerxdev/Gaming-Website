import { api, initNavbar, requireAuth, formatDate, statusBadge, toast } from './core.js';

initNavbar();
requireAuth();

const titleEl = document.getElementById('dashboardTitle');
const kpiEl = document.getElementById('dashboardKpi');
const registrationsEl = document.getElementById('registeredTournaments');
const matchesEl = document.getElementById('upcomingMatches');
const notificationsEl = document.getElementById('notifications');
const actionsEl = document.getElementById('quickActions');

const renderList = (container, items, mapper, emptyText) => {
  if (!items.length) {
    container.innerHTML = `<p>${emptyText}</p>`;
    return;
  }

  container.innerHTML = items.map(mapper).join('');
};

const loadDashboard = async () => {
  try {
    const data = await api('/dashboard');
    titleEl.textContent = `${data.user.name}'s Dashboard`;

    kpiEl.innerHTML = `
      <div class="card kpi-card"><span>Registered Tournaments</span><strong>${data.registeredTournaments.length}</strong></div>
      <div class="card kpi-card"><span>Upcoming Matches</span><strong>${data.upcomingMatches.length}</strong></div>
      <div class="card kpi-card"><span>Notifications</span><strong>${data.notifications.length}</strong></div>
      <div class="card kpi-card"><span>Favorite Teams</span><strong>${data.user.favoriteTeams.length}</strong></div>
    `;

    renderList(
      registrationsEl,
      data.registeredTournaments,
      (item) => `
        <article class="comment">
          <strong>${item.tournament.title}</strong>
          <p class="small">${item.tournament.game} | ${statusBadge(item.tournament.status)}</p>
          <p class="small">Team: ${item.teamName}</p>
          <p class="small">Start: ${formatDate(item.tournament.startDate)}</p>
        </article>
      `,
      'No tournament registrations yet.'
    );

    renderList(
      matchesEl,
      data.upcomingMatches,
      (item) => `
        <article class="comment">
          <strong>${item.teamA} vs ${item.teamB}</strong>
          <p class="small">${item.game} | ${item.status}</p>
          <p class="small">${formatDate(item.scheduledAt)}</p>
        </article>
      `,
      'No upcoming matches for your registered games.'
    );

    renderList(
      notificationsEl,
      data.notifications,
      (item) => `
        <article class="comment">
          <strong>${item.title}</strong>
          <p>${item.message}</p>
          <p class="small">${formatDate(item.createdAt)}</p>
        </article>
      `,
      'No notifications right now.'
    );

    renderList(
      actionsEl,
      data.quickActions,
      (item) => `<a class="btn ghost" href="${item.href}">${item.label}</a>`,
      'No quick actions available.'
    );
  } catch (error) {
    toast(error.message, 'error');
  }
};

await loadDashboard();

setInterval(async () => {
  try {
    const data = await api('/users/me/notifications');
    const latest = data.notifications?.find((item) => !item.read);
    if (latest) {
      toast(latest.title);
    }
  } catch (_error) {
    return;
  }
}, 18000);
