import { api, setSession, toast, getToken } from './core.js';

if (getToken()) {
  window.location.href = 'dashboard.html';
}

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  try {
    const data = await api('/auth/signup', {
      method: 'POST',
      body: { name, email, password },
      auth: false
    });

    setSession(data);
    toast('Account created');
    window.location.href = 'dashboard.html';
  } catch (error) {
    toast(error.message, 'error');
  }
});
