import { api, initNavbar, setSkeleton, statusBadge, formatDate, formatMoney, toast } from './core.js';

const listEl = document.getElementById('tournamentList');
const gameFilter = document.getElementById('filterGame');
const searchFilter = document.getElementById('filterSearch');
const statusFilter = document.getElementById('filterStatus');
const applyBtn = document.getElementById('applyFilters');

const renderTournaments = (items) => {
  if (!items.length) {
    listEl.innerHTML = '<p>No tournaments found for current filters.</p>';
    return;
  }

  listEl.innerHTML = items
    .map(
      (item) => `
      <article class="card tournament-card">
        <img class="tournament-image" src="${item.bannerImage}" alt="${item.title}" loading="lazy" />
        <div class="card-body">
          <h3>${item.title}</h3>
          <div class="meta-row">
            <span>${item.game}</span>
            ${statusBadge(item.status)}
          </div>
          <p class="mt-1 small">Prize: ${formatMoney(item.prizePool)} | Entry: ${formatMoney(item.entryFee)}</p>
          <p class="mt-1 small">${item.teamsRegistered}/${item.maxTeams} teams</p>
          <p class="mt-1">${item.description}</p>
          <div class="mt-2"><a class="btn secondary" href="tournament.html?id=${item.id}">Open Tournament</a></div>
          <p class="small mt-1">Starts: ${formatDate(item.startDate)}</p>
        </div>
      </article>
    `
    )
    .join('');
};

const loadGames = async () => {
  try {
    const data = await api('/users/games', { auth: false });
    (data.games || []).forEach((game) => {
      const option = document.createElement('option');
      option.value = game;
      option.textContent = game;
      gameFilter.appendChild(option);
    });
  } catch (_error) {
    return;
  }
};

const loadTournaments = async () => {
  setSkeleton(listEl, 6, 280);

  const query = new URLSearchParams();
  if (searchFilter.value.trim()) {
    query.set('q', searchFilter.value.trim());
  }
  if (gameFilter.value) {
    query.set('game', gameFilter.value);
  }
  if (statusFilter.value) {
    query.set('status', statusFilter.value);
  }

  try {
    const data = await api(`/tournaments?${query.toString()}`, { auth: false });
    renderTournaments(data.tournaments || []);
  } catch (error) {
    listEl.innerHTML = '<p>Failed to load tournaments.</p>';
    toast(error.message, 'error');
  }
};

initNavbar();
await loadGames();
await loadTournaments();

applyBtn.addEventListener('click', loadTournaments);
