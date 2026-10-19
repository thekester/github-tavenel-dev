const form = document.querySelector('.controls');
const input = document.querySelector('#search');
const cards = [...document.querySelectorAll('.card')];
const filters = [...document.querySelectorAll('[data-filter]')];
const more = document.querySelector('#load-more');
const counter = document.querySelector('#result-count');
const empty = document.querySelector('#empty-state');
const pageSize = 24;
let activeFilter = 'all';
let visibleCount = pageSize;

function render() {
  const terms = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = cards.filter(card => {
    const categoryMatches = activeFilter === 'all' || (card.dataset.video === 'true') === (activeFilter === 'video');
    return categoryMatches && terms.every(term => card.dataset.search.includes(term));
  });
  const visible = new Set(matches.slice(0, visibleCount));
  cards.forEach(card => { card.hidden = !visible.has(card); });
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
  counter.textContent = `${Math.min(visibleCount, matches.length)} of ${matches.length} examples${activeFilter === 'all' ? ' · YouTube videos first' : ''}`;
  empty.hidden = matches.length !== 0;
  more.hidden = visibleCount >= matches.length;
  more.textContent = `Show more experiments (${Math.max(0, matches.length - visibleCount)} remaining) ↓`;
}

form.hidden = false;
form.addEventListener('submit', event => event.preventDefault());
input.addEventListener('input', () => { visibleCount = pageSize; render(); });
filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  visibleCount = pageSize;
  render();
}));
more.addEventListener('click', () => {
  const previousCount = visibleCount;
  visibleCount += pageSize;
  render();
  const newCard = cards.filter(card => !card.hidden)[previousCount];
  newCard?.querySelector('a')?.focus({ preventScroll: true });
});
document.querySelector('#reset-search').addEventListener('click', () => {
  input.value = '';
  activeFilter = 'all';
  visibleCount = pageSize;
  render();
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
render();

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
