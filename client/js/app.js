import {
  api,
  initNavbar,
  formatDate,
  formatMoney,
  statusBadge,
  setSkeleton,
  toast,
  getToken,
  getUser,
  hydrateUser,
  registerServiceWorker
} from './core.js';

const featuredTrack = document.getElementById('featuredTrack');
const tickerTrack = document.getElementById('tickerTrack');
const trendingGames = document.getElementById('trendingGames');
const featuredNews = document.getElementById('featuredNews');
const topTeams = document.getElementById('topTeams');

const renderCarousel = (items) => {
  if (!items.length) {
    featuredTrack.innerHTML = '<p>No featured tournaments available.</p>';
    return;
  }

  featuredTrack.innerHTML = items
    .map(
      (item) => `
      <div class="carousel-item">
        <article class="card tournament-card">
          <img class="tournament-image" src="${item.bannerImage}" alt="${item.title}" loading="lazy" />
          <div class="card-body">
            <h3>${item.title}</h3>
            <div class="meta-row">
              <span>${item.game}</span>
              ${statusBadge(item.status)}
            </div>
            <div class="meta-row">
              <span>Prize Pool: ${formatMoney(item.prizePool)}</span>
              <span>${formatDate(item.startDate)}</span>
            </div>
            <div class="mt-2"><a class="btn secondary" href="tournament.html?id=${item.id}">View Details</a></div>
          </div>
        </article>
      </div>
    `
    )
    .join('');

  let index = 0;
  const max = items.length;
  const renderPos = () => {
    featuredTrack.style.transform = `translateX(-${index * 100}%)`;
  };

  document.getElementById('carouselPrev').onclick = () => {
    index = (index - 1 + max) % max;
    renderPos();
  };

  document.getElementById('carouselNext').onclick = () => {
    index = (index + 1) % max;
    renderPos();
  };

  setInterval(() => {
    index = (index + 1) % max;
    renderPos();
  }, 5500);
};

const renderTicker = (items) => {
  if (!items.length) {
    tickerTrack.innerHTML = '<div class="ticker-item">No upcoming events</div>';
    return;
  }

  const markup = items
    .map((item) => `<div class="ticker-item">${item.text}</div>`)
    .join('');

  tickerTrack.innerHTML = `${markup}${markup}`;
};

const renderTrending = (items) => {
  if (!items.length) {
    trendingGames.innerHTML = '<p>No data available.</p>';
    return;
  }

  trendingGames.innerHTML = items
    .map(
      (item) => `
      <article class="card trending-card">
        <h3>${item.game}</h3>
        <p>${item.activeTournaments} active tournaments</p>
        <p>Next event: ${formatDate(item.nextDate)}</p>
      </article>
    `
    )
    .join('');
};

const renderNews = (items) => {
  featuredNews.innerHTML = items
    .map(
      (item) => `
      <article class="card card-body">
        <h3>${item.title}</h3>
        <p class="small mt-1">${item.category} | ${formatDate(item.publishedAt)}</p>
        <p class="mt-1">${item.excerpt}</p>
        <a class="btn ghost mt-2" href="article.html?id=${item._id}">Read More</a>
      </article>
    `
    )
    .join('');
};

const renderTopTeams = (items) => {
  topTeams.innerHTML = items
    .map(
      (item, idx) => `
      <article class="card card-body item-row">
        <div>
          <strong>#${idx + 1} ${item.name}</strong>
          <p class="small">${item.game} | ${item.points} pts</p>
        </div>
      </article>
    `
    )
    .join('');
};

const initFeedback = () => {
  const form = document.getElementById('feedbackForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: document.getElementById('feedbackName').value.trim(),
      email: document.getElementById('feedbackEmail').value.trim(),
      message: document.getElementById('feedbackMessage').value.trim()
    };

    try {
      await api('/feedback', { method: 'POST', body: payload });
      form.reset();
      toast('Feedback submitted successfully');
    } catch (error) {
      toast(error.message, 'error');
    }
  });
};

const chatBox = document.getElementById('chatBox');

const loadChat = async () => {
  if (!chatBox) {
    return;
  }

  try {
    const data = await api('/chat/messages?limit=30', { auth: false });
    chatBox.innerHTML = data.messages
      .map(
        (item) => `
        <div class="chat-msg">
          <strong>${item.user?.gamerTag || item.user?.name || 'Player'}</strong>
          <p>${item.message}</p>
        </div>
      `
      )
      .join('');

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (_error) {
    chatBox.innerHTML = '<p>Unable to load chat.</p>';
  }
};

const initChat = () => {
  const form = document.getElementById('chatForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.getElementById('chatInput');
    const value = input.value.trim();

    if (!value) {
      return;
    }

    if (!getToken()) {
      toast('Please login to send chat messages', 'error');
      return;
    }

    try {
      await api('/chat/messages', {
        method: 'POST',
        body: { message: value }
      });
      input.value = '';
      await loadChat();
    } catch (error) {
      toast(error.message, 'error');
    }
  });

  setInterval(loadChat, 10000);
};

const initRealtimeNotifications = async () => {
  if (!getToken()) {
    return;
  }

  try {
    const data = await api('/users/me/notifications');
    if (data.notifications?.length) {
      const latestUnread = data.notifications.find((item) => !item.read);
      if (latestUnread) {
        toast(latestUnread.title);
      }
    }
  } catch (_error) {
    return;
  }
};

const init = async () => {
  initNavbar();
  await hydrateUser();
  registerServiceWorker();

  setSkeleton(featuredTrack, 1, 300);
  setSkeleton(trendingGames, 3, 120);
  setSkeleton(featuredNews, 2, 120);
  setSkeleton(topTeams, 3, 80);

  try {
    const data = await api('/public/home', { auth: false });
    renderCarousel(data.featuredTournaments || []);
    renderTicker(data.ticker || []);
    renderTrending(data.trendingGames || []);
    renderNews(data.featuredNews || []);
    renderTopTeams(data.topTeams || []);

    document.getElementById('statTournaments').textContent = String(data.featuredTournaments?.length || 0);
    document.getElementById('statGames').textContent = String(data.trendingGames?.length || 0);
    document.getElementById('statTeams').textContent = String(data.topTeams?.length || 0);
  } catch (error) {
    toast(error.message, 'error');
  }

  const user = getUser();
  if (user) {
    document.getElementById('feedbackName').value = user.name || '';
    document.getElementById('feedbackEmail').value = user.email || '';
  }

  initFeedback();
  initChat();
  loadChat();
  initRealtimeNotifications();
};

init();
