import {
  api,
  initNavbar,
  parseQuery,
  formatDate,
  formatMoney,
  statusBadge,
  countdown,
  toast,
  getToken
} from './core.js';

initNavbar();

const { id } = parseQuery();
const detailEl = document.getElementById('tournamentDetail');
const commentList = document.getElementById('commentList');
const resultEl = document.getElementById('registrationResult');

if (!id) {
  detailEl.innerHTML = '<p>Invalid tournament id.</p>';
  throw new Error('Missing id');
}

const renderDetail = (item) => {
  detailEl.innerHTML = `
    <article class="card tournament-card">
      <img class="tournament-image" src="${item.bannerImage}" alt="${item.title}" />
      <div class="card-body">
        <h1>${item.title}</h1>
        <div class="meta-row">
          <span>${item.game}</span>
          ${statusBadge(item.status)}
        </div>
        <p class="mt-1">${item.description}</p>
        <p class="small mt-1">Prize Pool: ${formatMoney(item.prizePool)}</p>
        <p class="small">Entry Fee: ${formatMoney(item.entryFee)}</p>
        <p class="small">Teams Registered: ${item.teamsRegistered}/${item.maxTeams}</p>
        <p class="small">Start: ${formatDate(item.startDate)}</p>
        <p class="small">End: ${formatDate(item.endDate)}</p>
        <div class="countdown" id="tournamentCountdown"></div>
      </div>
    </article>
  `;

  countdown(document.getElementById('tournamentCountdown'), item.startDate);
};

const renderComments = (items) => {
  if (!items.length) {
    commentList.innerHTML = '<p>No comments yet. Be the first to comment.</p>';
    return;
  }

  commentList.innerHTML = items
    .map(
      (item) => `
      <div class="comment">
        <div class="comment-top">
          <span>${item.user?.gamerTag || item.user?.name || 'Player'}</span>
          <span>${formatDate(item.createdAt)}</span>
        </div>
        <p>${item.content}</p>
      </div>
    `
    )
    .join('');
};

const loadComments = async () => {
  try {
    const data = await api(`/tournaments/${id}/comments`, { auth: false });
    renderComments(data.comments || []);
  } catch (_error) {
    commentList.innerHTML = '<p>Unable to load comments.</p>';
  }
};

const loadTournament = async () => {
  try {
    const data = await api(`/tournaments/${id}`, { auth: false });
    renderDetail(data.tournament);
  } catch (error) {
    detailEl.innerHTML = `<p>${error.message}</p>`;
  }
};

await loadTournament();
await loadComments();

const registrationForm = document.getElementById('registrationForm');
registrationForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!getToken()) {
    toast('Please login to register your team', 'error');
    window.location.href = 'login.html';
    return;
  }

  const teamName = document.getElementById('teamName').value.trim();
  const players = document
    .getElementById('players')
    .value.split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  try {
    const data = await api(`/tournaments/${id}/register`, {
      method: 'POST',
      body: { teamName, players }
    });

    resultEl.innerHTML = `
      <div class="comment">
        <strong>Entry Confirmed</strong>
        <p>Team: ${data.registration.teamName}</p>
        <p>Status: ${data.registration.status}</p>
      </div>
    `;

    registrationForm.reset();
    await loadTournament();
    toast('Registration submitted');
  } catch (error) {
    toast(error.message, 'error');
  }
});

const commentForm = document.getElementById('commentForm');
commentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!getToken()) {
    toast('Please login to comment', 'error');
    window.location.href = 'login.html';
    return;
  }

  const content = document.getElementById('commentContent').value.trim();

  try {
    await api(`/tournaments/${id}/comments`, {
      method: 'POST',
      body: { content }
    });

    document.getElementById('commentContent').value = '';
    await loadComments();
    toast('Comment posted');
  } catch (error) {
    toast(error.message, 'error');
  }
});
