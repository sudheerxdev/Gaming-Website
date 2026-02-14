import { api, initNavbar, requireAuth, getUser, hydrateUser, toast } from './core.js';

initNavbar();
requireAuth();
await hydrateUser();

const guard = document.getElementById('adminGuard');
const content = document.getElementById('adminContent');

const user = getUser();
if (!user || user.role !== 'admin') {
  guard.innerHTML = '<p>Admin access required. Login using an admin account.</p>';
  throw new Error('Not admin');
}

guard.remove();
content.classList.remove('hidden');

const readBool = (id) => Boolean(document.getElementById(id).checked);
const read = (id) => document.getElementById(id).value.trim();

const withAdminAction = (formId, handler) => {
  document.getElementById(formId).addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await handler();
      event.target.reset();
      toast('Saved successfully');
    } catch (error) {
      toast(error.message, 'error');
    }
  });
};

withAdminAction('adminTournamentForm', async () => {
  await api('/admin/tournaments', {
    method: 'POST',
    body: {
      title: read('atTitle'),
      game: read('atGame'),
      description: read('atDescription'),
      bannerImage: read('atBanner'),
      prizePool: Number(read('atPrize') || 0),
      entryFee: Number(read('atFee') || 0),
      maxTeams: Number(read('atTeams') || 32),
      featured: readBool('atFeatured'),
      startDate: read('atStart'),
      endDate: read('atEnd')
    }
  });
});

withAdminAction('adminMatchForm', async () => {
  await api('/admin/matches', {
    method: 'POST',
    body: {
      tournament: read('amTournament'),
      game: read('amGame'),
      teamA: read('amTeamA'),
      teamB: read('amTeamB'),
      scheduledAt: read('amDate'),
      status: document.getElementById('amStatus').value
    }
  });
});

withAdminAction('adminNewsForm', async () => {
  await api('/admin/news', {
    method: 'POST',
    body: {
      title: read('anTitle'),
      slug: read('anSlug'),
      category: read('anCategory'),
      image: read('anImage'),
      author: read('anAuthor') || 'GameHub Editorial',
      excerpt: read('anExcerpt'),
      content: read('anContent'),
      featured: readBool('anFeatured')
    }
  });
});
