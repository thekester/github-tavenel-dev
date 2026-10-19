const form = document.querySelector('.controls');
const input = document.querySelector('#search');
const cards = [...document.querySelectorAll('.card')];
const filters = [...document.querySelectorAll('[data-filter]')];
const paginations = [...document.querySelectorAll('.pagination')];
const sizeSelect = document.querySelector('#page-size');
const counter = document.querySelector('#result-count');
const empty = document.querySelector('#empty-state');
let pageSize = 12;
let activeFilter = 'all';
let currentPage = 1;

function readLocation() {
  const params = new URLSearchParams(location.search);
  activeFilter = ['all', 'video', 'code'].includes(params.get('filter')) ? params.get('filter') : 'all';
  input.value = params.get('q') || '';
  pageSize = [12, 24, 48].includes(Number(params.get('size'))) ? Number(params.get('size')) : 12;
  const page = Number(params.get('page'));
  currentPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  sizeSelect.value = String(pageSize);
}

function saveLocation(method = 'replaceState') {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries({
    page: currentPage > 1 ? currentPage : '',
    filter: activeFilter !== 'all' ? activeFilter : '',
    q: input.value.trim(),
    size: pageSize !== 12 ? pageSize : '',
  })) {
    if (value !== '') url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  if (url.href !== location.href) history[method](null, '', url);
}

function pageButton(label, page, { current = false, disabled = false } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.dataset.page = page;
  button.disabled = disabled;
  button.setAttribute('aria-controls', 'video-gallery');
  button.setAttribute('aria-label', /^\d+$/.test(label) ? `Page ${page}` : label);
  if (current) button.setAttribute('aria-current', 'page');
  return button;
}

function renderPagination(totalPages) {
  // Always expose the first/last page, plus the current page and its neighbours.
  let pages;
  if (totalPages <= 7) pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  else if (currentPage <= 4) pages = [1, 2, 3, 4, 5, totalPages];
  else if (currentPage >= totalPages - 3) pages = [1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  else pages = [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  paginations.forEach(nav => {
    nav.hidden = totalPages <= 1;
    nav.replaceChildren();
    if (nav.hidden) return;
    const previous = pageButton('← Previous', currentPage - 1, { disabled: currentPage === 1 });
    const next = pageButton('Next →', currentPage + 1, { disabled: currentPage === totalPages });
    previous.className = 'page-direction';
    next.className = 'page-direction';
    const numbers = document.createElement('ol');
    numbers.className = 'page-numbers';
    pages.forEach((page, index) => {
      if (index && page - pages[index - 1] > 1) {
        const gap = document.createElement('li');
        gap.className = 'page-gap';
        gap.textContent = '…';
        gap.setAttribute('aria-hidden', 'true');
        numbers.append(gap);
      }
      const item = document.createElement('li');
      item.append(pageButton(String(page), page, { current: page === currentPage }));
      numbers.append(item);
    });
    nav.append(previous, numbers, next);
  });
}

function render() {
  const terms = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = cards.filter(card => {
    const categoryMatches = activeFilter === 'all' || (card.dataset.video === 'true') === (activeFilter === 'video');
    return categoryMatches && terms.every(term => card.dataset.search.includes(term));
  });
  const totalPages = Math.ceil(matches.length / pageSize);
  currentPage = Math.min(currentPage, Math.max(1, totalPages));
  const start = (currentPage - 1) * pageSize;
  const visible = new Set(matches.slice(start, start + pageSize));
  cards.forEach(card => { card.hidden = !visible.has(card); });
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
  counter.textContent = matches.length
    ? `${start + 1}-${Math.min(start + pageSize, matches.length)} of ${matches.length} examples · Page ${currentPage} of ${totalPages}`
    : 'No examples found';
  empty.hidden = matches.length !== 0;
  renderPagination(totalPages);
}

form.hidden = false;
document.querySelector('.page-size').hidden = false;
form.addEventListener('submit', event => event.preventDefault());
input.addEventListener('input', () => { currentPage = 1; render(); saveLocation(); });
filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  currentPage = 1;
  render();
  saveLocation('pushState');
}));
sizeSelect.addEventListener('change', () => {
  // Keep the first visible result on screen when changing the page size.
  const firstIndex = (currentPage - 1) * pageSize;
  pageSize = Number(sizeSelect.value);
  currentPage = Math.floor(firstIndex / pageSize) + 1;
  render();
  saveLocation('pushState');
});
paginations.forEach(nav => nav.addEventListener('click', event => {
  const button = event.target.closest('button[data-page]');
  if (!button || button.disabled || Number(button.dataset.page) === currentPage) return;
  currentPage = Number(button.dataset.page);
  render();
  saveLocation('pushState');
  counter.focus({ preventScroll: true });
  form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}));
window.addEventListener('popstate', () => {
  readLocation();
  render();
  saveLocation();
});
document.querySelector('#reset-search').addEventListener('click', () => {
  input.value = '';
  activeFilter = 'all';
  currentPage = 1;
  render();
  saveLocation('pushState');
  input.focus();
});
document.querySelectorAll('.card-preview img').forEach(img => {
  img.addEventListener('error', () => {
    img.hidden = true;
    const fallback = document.createElement('span');
    fallback.className = 'code-art';
    fallback.textContent = img.alt;
    img.after(fallback);
  }, { once: true });
});
readLocation();
render();
saveLocation();

// Choose only published videos with a matching example. Keep every link in sync.
const publishedCards = cards.filter(card => card.dataset.youtubeId);
const featuredPlay = document.querySelector('#featured-play');
if (publishedCards.length && featuredPlay) {
  const selected = publishedCards[Math.floor(Math.random() * publishedCards.length)];
  const videoId = selected.dataset.youtubeId;
  const title = selected.querySelector('h3').textContent;
  const videoUrl = `https://www.youtube.com/shorts/${videoId}`;
  document.querySelector('#featured-name').textContent = selected.dataset.slug;
  document.querySelector('#featured-title').textContent = title;
  const poster = document.querySelector('#featured-image');
  poster.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  poster.alt = title;
  featuredPlay.href = videoUrl;
  featuredPlay.setAttribute('aria-label', `Play ${title} on YouTube`);
  document.querySelector('#featured-youtube').href = videoUrl;
  document.querySelector('#featured-code').href = `examples/${selected.dataset.slug}/`;
  featuredPlay.addEventListener('click', event => {
    // Preserve open-in-new-tab and modified-click behavior.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const player = document.createElement('iframe');
    player.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`;
    player.title = title;
    player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    document.querySelector('#featured-stage').replaceChildren(player);
    player.focus();
  });
}
