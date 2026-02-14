import { api, initNavbar, parseQuery, formatDate, toast, getToken } from './core.js';

initNavbar();

const { id } = parseQuery();
const articleEl = document.getElementById('articleContainer');
const commentsEl = document.getElementById('articleComments');

if (!id) {
  articleEl.innerHTML = '<p>Invalid article id.</p>';
  throw new Error('Missing id');
}

let articleId = id;

const renderArticle = (article) => {
  articleId = article._id;

  articleEl.innerHTML = `
    <img class="tournament-image" src="${article.image}" alt="${article.title}" />
    <div class="card-body">
      <h1>${article.title}</h1>
      <p class="small mt-1">${article.category} | ${formatDate(article.publishedAt)} | ${article.author}</p>
      <p class="mt-2">${article.excerpt}</p>
      <p class="mt-2">${article.content}</p>
    </div>
  `;
};

const renderComments = (items) => {
  if (!items.length) {
    commentsEl.innerHTML = '<p>No comments yet.</p>';
    return;
  }

  commentsEl.innerHTML = items
    .map(
      (item) => `
      <article class="comment">
        <div class="comment-top">
          <span>${item.user?.gamerTag || item.user?.name || 'Player'}</span>
          <span>${formatDate(item.createdAt)}</span>
        </div>
        <p>${item.content}</p>
      </article>
    `
    )
    .join('');
};

const loadArticle = async () => {
  try {
    const data = await api(`/news/${id}`, { auth: false });
    renderArticle(data.article);
  } catch (error) {
    articleEl.innerHTML = `<p>${error.message}</p>`;
  }
};

const loadComments = async () => {
  try {
    const data = await api(`/news/${articleId}/comments`, { auth: false });
    renderComments(data.comments || []);
  } catch (_error) {
    commentsEl.innerHTML = '<p>Unable to load comments.</p>';
  }
};

await loadArticle();
await loadComments();

const form = document.getElementById('articleCommentForm');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!getToken()) {
    toast('Please login to comment', 'error');
    window.location.href = 'login.html';
    return;
  }

  const content = document.getElementById('articleComment').value.trim();

  try {
    await api(`/news/${articleId}/comments`, {
      method: 'POST',
      body: { content }
    });

    document.getElementById('articleComment').value = '';
    await loadComments();
    toast('Comment posted');
  } catch (error) {
    toast(error.message, 'error');
  }
});
