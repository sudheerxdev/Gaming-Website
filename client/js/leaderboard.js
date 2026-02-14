import { api, initNavbar, toast } from './core.js';

initNavbar();

const typeEl = document.getElementById('boardType');
const gameEl = document.getElementById('boardGame');
const sortEl = document.getElementById('boardSort');
const bodyEl = document.getElementById('leaderboardBody');

const renderBoard = (entries) => {
  if (!entries.length) {
    bodyEl.innerHTML = '<tr><td colspan="6">No ranking data found.</td></tr>';
    return;
  }

  bodyEl.innerHTML = entries
    .map(
      (entry) => `
      <tr>
        <td>#${entry.rank}</td>
        <td>${entry.name}</td>
        <td>${entry.game}</td>
        <td>${entry.points}</td>
        <td>${entry.wins}</td>
        <td>${entry.losses}</td>
      </tr>
    `
    )
    .join('');
};

const loadBoard = async () => {
  const query = new URLSearchParams({
    type: typeEl.value,
    sort: sortEl.value
  });

  if (gameEl.value) {
    query.set('game', gameEl.value);
  }

  try {
    const data = await api(`/leaderboard?${query.toString()}`, { auth: false });
    renderBoard(data.entries || []);

    const games = data.games || [];
    const current = gameEl.value;

    gameEl.innerHTML = '<option value="">All Games</option>';
    games.forEach((game) => {
      const option = document.createElement('option');
      option.value = game;
      option.textContent = game;
      if (current === game) {
        option.selected = true;
      }
      gameEl.appendChild(option);
    });
  } catch (error) {
    toast(error.message, 'error');
  }
};

await loadBoard();

document.getElementById('refreshBoard').addEventListener('click', loadBoard);
[typeEl, gameEl, sortEl].forEach((el) => el.addEventListener('change', loadBoard));
