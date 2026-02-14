import { api, setSession, toast, getToken } from './core.js';

if (getToken()) {
  window.location.href = 'dashboard.html';
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false
    });

    setSession(data);
    toast('Login successful');
    window.location.href = 'dashboard.html';
  } catch (error) {
    toast(error.message, 'error');
  }
});
