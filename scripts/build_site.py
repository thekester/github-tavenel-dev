"""Validate the catalogue and build a portable GitHub Pages site (stdlib only)."""
import json
import hashlib
import re
import shutil
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '_site'
REPO = 'https://github.com/thekester/github-tavenel-dev'


def validate(catalog):
    examples = catalog['examples']
    videos = catalog['videos']
    slugs = [example['slug'] for example in examples]
    assert len(slugs) == len(set(slugs)), 'Duplicate example slug'
    ids = [video['id'] for video in videos]
    assert len(ids) == len(set(ids)), 'Duplicate YouTube ID'
    assert all(re.fullmatch(r'[\w-]{11}', video_id) for video_id in ids)
    for video in videos:
        assert video['url'] == f"https://www.youtube.com/shorts/{video['id']}"
        assert video['slug'] is None or video['slug'] in slugs
    for example in examples:
        slug = example['slug']
        assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug), slug
        folder = ROOT / 'videos' / 'css' / slug
        assert all((folder / name).is_file() for name in ('index.html', 'style.css', 'README.md')), slug
        video_id = example['youtubeId']
        if video_id:
            assert any(v['id'] == video_id and v['slug'] == slug for v in videos), slug
    actual = {path.parent.name for path in (ROOT / 'videos/css').glob('*/index.html')}
    assert actual == set(slugs), 'Catalogue and example directories differ'


def card(example):
    slug = example['slug']
    title = escape(example['title'])
    description = escape(example['description'])
    video_id = example['youtubeId']
    demo = f'examples/{slug}/'
    youtube = f'https://www.youtube.com/shorts/{video_id}' if video_id else None
    destination = demo
    if video_id:
        preview = f'<img src="https://i.ytimg.com/vi/{video_id}/hqdefault.jpg" alt="{title}" width="480" height="360" loading="lazy" decoding="async"><span class="play" aria-hidden="true">&lt;/&gt;</span>'
    else:
        preview = f'<span class="code-art"><strong aria-hidden="true">&#123; &#125;</strong><span>{slug}/</span></span>'
    video_link = f'<a href="{youtube}">YouTube ↗</a>' if video_id else ''
    label = '<span class="video-label">ON YOUTUBE</span>' if video_id else '<span class="soon-label">AVAILABLE SOON</span>'
    search = escape(f"{slug} {example['title']} {example['description']}".lower(), quote=True)
    return f'''<article class="card" data-video="{str(bool(video_id)).lower()}" data-youtube-id="{video_id or ''}" data-slug="{slug}" data-search="{search}">
      <a class="card-preview" href="{destination}" aria-label="Explore {title}">{preview}</a>
      <div class="card-kicker">{label}<span>HTML + CSS</span></div>
      <h3><a href="{demo}">{title}</a></h3><p>{description}</p>
      <div class="card-actions"><a href="{demo}">Code &amp; demo →</a><a href="{REPO}/tree/main/videos/css/{slug}">GitHub ↗</a>{video_link}</div>
    </article>'''


def example_page(example, template):
    slug = example['slug']
    folder = ROOT / 'videos/css' / slug
    html = (folder / 'index.html').read_text(encoding='utf-8')
    css = (folder / 'style.css').read_text(encoding='utf-8')
    video_id = example['youtubeId']
    values = {
        'TITLE': escape(example['title']),
        'DESCRIPTION': escape(example['description']),
        'SLUG': slug,
        'STATUS': 'ON YOUTUBE' if video_id else 'AVAILABLE SOON',
        'VIDEO': (
            f'<a class="text-link" href="https://www.youtube.com/shorts/{video_id}">Watch on YouTube ↗</a>'
            if video_id else '<p class="upcoming-note">Video available soon. Explore the code and demo below.</p>'
        ),
        'HTML_CODE': escape(html),
        'CSS_CODE': escape(css),
        'HTML_LINES': str(len(html.splitlines())),
        'CSS_LINES': str(len(css.splitlines())),
        'REPO': REPO,
    }
    return re.sub(r'\{\{([A-Z_]+)\}\}', lambda match: values[match[1]], template)


def build():
    catalog = json.loads((ROOT / 'data/catalog.json').read_text(encoding='utf-8'))
    validate(catalog)
    # Only this generated directory may be cleaned, never a user-provided path.
    assert OUTPUT.resolve() == ROOT.resolve() / '_site' and not OUTPUT.is_symlink()
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    shutil.copytree(ROOT / 'site/assets', OUTPUT / 'assets')
    # New asset URLs prevent a cached script from being paired with newer HTML.
    asset_names = {}
    for asset in (ROOT / 'site/assets').iterdir():
        if asset.suffix not in {'.js', '.css'}:
            continue
        content = asset.read_bytes()
        digest = hashlib.sha256(content).hexdigest()[:12]
        versioned_name = f'{asset.stem}.{digest}{asset.suffix}'
        (OUTPUT / 'assets' / versioned_name).write_bytes(content)
        asset_names[asset.name] = versioned_name

    def version_assets(template):
        for original, versioned in asset_names.items():
            template = template.replace(f'assets/{original}"', f'assets/{versioned}"')
        return template

    shutil.copytree(ROOT / 'videos', OUTPUT / 'videos')
    shutil.copy2(ROOT / 'LICENSE', OUTPUT / 'LICENSE')
    shutil.copy2(ROOT / 'README.md', OUTPUT / 'README.md')
    (OUTPUT / '.nojekyll').touch()
    video_order = {video['id']: index for index, video in enumerate(catalog['videos'])}
    examples = sorted(catalog['examples'], key=lambda e: (video_order.get(e['youtubeId'], len(video_order)), e['slug']))
    template = version_assets((ROOT / 'site/example.html').read_text(encoding='utf-8'))
    for example in examples:
        destination = OUTPUT / 'examples' / example['slug']
        destination.mkdir(parents=True)
        (destination / 'index.html').write_text(example_page(example, template), encoding='utf-8')
    matched = sum(bool(example['youtubeId']) for example in examples)
    featured = next(example for example in examples if example['youtubeId'])
    replacements = {
        'FEATURED_ID': featured['youtubeId'],
        'FEATURED_SLUG': featured['slug'],
        'FEATURED_TITLE': escape(featured['title']),
        'EXAMPLE_COUNT': str(len(examples)),
        'VIDEO_COUNT': str(len(catalog['videos'])),
        'MATCHED_COUNT': str(matched),
        'UNMATCHED_COUNT': str(len(examples) - matched),
        'CARDS': '\n'.join(card(example) for example in examples),
        'EXTRA_VIDEOS': '\n'.join(f'<a href="{escape(v["url"])}">{escape(v["title"].split("|")[0].strip())} ↗</a>' for v in catalog['videos'] if v['slug'] is None),
    }
    page = version_assets((ROOT / 'site/index.html').read_text(encoding='utf-8'))
    for key, value in replacements.items():
        page = page.replace('{{' + key + '}}', value)
    assert not re.search(r'\{\{[A-Z_]+\}\}', page), 'Unresolved template marker'
    (OUTPUT / 'index.html').write_text(page, encoding='utf-8')
    print(f'Built {len(examples)} examples, {matched} matched videos, {len(catalog["videos"])} channel videos in {OUTPUT}')


if __name__ == '__main__':
    build()
