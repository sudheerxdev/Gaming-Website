import { api, initNavbar, formatDate, setSkeleton, toast } from './core.js';

initNavbar();

const listEl = document.getElementById('newsList');
const searchEl = document.getElementById('newsSearch');
const categoryEl = document.getElementById('newsCategory');
const featuredEl = document.getElementById('newsFeatured');

const render = (items) => {
  if (!items.length) {
    listEl.innerHTML = '<p>No articles found.</p>';
    return;
  }

  listEl.innerHTML = items
    .map(
      (item) => `
      <article class="card tournament-card">
        <img class="tournament-image" src="${item.image}" alt="${item.title}" loading="lazy" />
        <div class="card-body">
          <h3>${item.title}</h3>
          <p class="small mt-1">${item.category} | ${formatDate(item.publishedAt)} | ${item.author}</p>
          <p class="mt-1">${item.excerpt}</p>
          <a class="btn secondary mt-2" href="article.html?id=${item._id}">Read More</a>
        </div>
      </article>
    `
    )
    .join('');
};

const loadNews = async () => {
  setSkeleton(listEl, 6, 280);

  const query = new URLSearchParams();
  if (searchEl.value.trim()) {
    query.set('q', searchEl.value.trim());
  }
  if (categoryEl.value) {
    query.set('category', categoryEl.value);
  }
  if (featuredEl.value) {
    query.set('featured', featuredEl.value);
  }

  try {
    const data = await api(`/news?${query.toString()}`, { auth: false });
    render(data.articles || []);

    const current = categoryEl.value;
    categoryEl.innerHTML = '<option value="">All Categories</option>';
    (data.categories || []).forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      if (category === current) {
        option.selected = true;
      }
      categoryEl.appendChild(option);
    });
  } catch (error) {
    toast(error.message, 'error');
  }
};

await loadNews();
document.getElementById('newsFilterBtn').addEventListener('click', loadNews);
