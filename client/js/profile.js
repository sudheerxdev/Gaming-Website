import { api, initNavbar, requireAuth, hydrateUser, getUser, toast } from './core.js';

initNavbar();
requireAuth();
await hydrateUser();

const nameEl = document.getElementById('profileName');
const gamerTagEl = document.getElementById('profileGamerTag');
const avatarEl = document.getElementById('profileAvatar');
const bioEl = document.getElementById('profileBio');
const teamsEl = document.getElementById('profileTeams');
const favoriteListEl = document.getElementById('favoriteTeamList');

const paintFavorites = (teams = []) => {
  if (!teams.length) {
    favoriteListEl.innerHTML = '<p>No favorite teams saved.</p>';
    return;
  }

  favoriteListEl.innerHTML = teams.map((team) => `<div class="comment">${team}</div>`).join('');
};

const loadProfile = async () => {
  try {
    const data = await api('/auth/me');
    const user = data.user;
    nameEl.value = user.name || '';
    gamerTagEl.value = user.gamerTag || '';
    avatarEl.value = user.avatar || '';
    bioEl.value = user.bio || '';
    teamsEl.value = (user.favoriteTeams || []).join(', ');
    paintFavorites(user.favoriteTeams || []);
  } catch (error) {
    toast(error.message, 'error');
  }
};

await loadProfile();

document.getElementById('profileForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const favoriteTeams = teamsEl.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  try {
    const data = await api('/users/me', {
      method: 'PUT',
      body: {
        name: nameEl.value.trim(),
        gamerTag: gamerTagEl.value.trim(),
        avatar: avatarEl.value.trim(),
        bio: bioEl.value.trim(),
        favoriteTeams
      }
    });

    localStorage.setItem('gamehub_user', JSON.stringify(data.user));
    paintFavorites(data.user.favoriteTeams || []);
    toast('Profile updated');
  } catch (error) {
    toast(error.message, 'error');
  }
});

document.getElementById('favoriteTeamToggle').addEventListener('click', async () => {
  const value = document.getElementById('favoriteTeamInput').value.trim();
  if (!value) {
    return;
  }

  try {
    const data = await api('/users/me/favorites', {
      method: 'POST',
      body: { team: value }
    });

    teamsEl.value = (data.favoriteTeams || []).join(', ');
    paintFavorites(data.favoriteTeams || []);
    document.getElementById('favoriteTeamInput').value = '';
    const current = getUser() || {};
    localStorage.setItem('gamehub_user', JSON.stringify({ ...current, favoriteTeams: data.favoriteTeams || [] }));
    toast('Favorites updated');
  } catch (error) {
    toast(error.message, 'error');
  }
});
