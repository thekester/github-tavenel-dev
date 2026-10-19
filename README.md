# Tavenel Dev — Video Source Code

Small experiments. Real code. Source code and examples from the [Tavenel Dev YouTube channel](https://www.youtube.com/@tavenel-dev).

**[Explore the live gallery](https://thekester.github.io/github-tavenel-dev/)** · **[Watch the Shorts](https://www.youtube.com/@tavenel-dev/shorts)** · **[Browse the code](videos/css/)**

## The collection

275 standalone HTML/CSS demos, organized into one folder per example. Each folder includes the original `index.html` and `style.css`, plus a README with a live demo link and the matching YouTube video when confirmed.

The channel catalogue was checked on **October 19, 2026**: 75 public Shorts were found, with 73 matched to example folders. Two videos have no confirmed source match in this archive and are listed separately on the website. An example without a video link is not assumed to be unpublished.

## Try an example

```bash
git clone https://github.com/thekester/github-tavenel-dev.git
cd github-tavenel-dev
```

Open `videos/css/index.html` to browse the original collection, or open an example such as `videos/css/synthwave/index.html` directly. No install or build step is needed for the demos.

Hover, click, focus, or type into the controls to replay the effects from the videos. Some demos use recent CSS features, including `:has()`, `@property`, `offset-path`, `linear()`, anchor positioning, and `if()`. Use a current Chromium-based browser for the broadest support.

## Repository layout

```text
videos/css/
  index.html                Original archive index
  synthwave/
    index.html              Original demo markup
    style.css               Original demo styling
    README.md               Explanation, demo and YouTube links
  ...                       One folder per example
data/catalog.json           Titles, descriptions and verified YouTube links
site/                       Gallery template, styles and JavaScript
scripts/build_site.py       Validates the catalogue and generates _site/
.github/workflows/pages.yml GitHub Pages build and deployment
LICENSE                     MIT License
```

The original ZIP is retained locally and ignored by Git. Its HTML and CSS files were imported without changes. The gallery uses JavaScript for search and filtering; the demos themselves use HTML and CSS only.

## Preview the website

Python 3.11 or later is sufficient; no third-party packages are required.

```bash
python scripts/build_site.py
python -m http.server 8000 --directory _site
```

Open [localhost:8000](http://localhost:8000). The generated `_site/` directory is ignored by Git and rebuilt on each run. The gallery remains browsable without JavaScript.

## Add an example or video

1. Create `videos/css/<slug>/` with `index.html`, `style.css`, and a README. Use an existing example README as a starting point.
2. Add its `slug`, `title`, `description`, and `youtubeId` to `examples` in `data/catalog.json`. Use `null` until a matching video is confirmed.
3. For a published Short, add its `id`, `title`, `url`, and `slug` to `videos` in the same file. Keep the videos ordered newest first. Use a `null` slug for a video without corresponding code.
4. Add the example to the original `videos/css/index.html` index and update the counts in this README when needed.
5. Run `python scripts/build_site.py` and preview the result. Commit and push to `main` to deploy.

Video links are curated in the catalogue; the website does not scrape YouTube at runtime. Thumbnails are loaded from YouTube, and the gallery fonts are loaded from Google Fonts with local fallback fonts.

## GitHub Pages

The [Pages workflow](.github/workflows/pages.yml) validates the catalogue, builds the static website, and publishes `_site/` on pushes to `main`. The repository's **Settings → Pages → Build and deployment → Source** must be set to **GitHub Actions**. See [GitHub's custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Feedback and license

Found a bug or have a suggestion? [Open an issue](https://github.com/thekester/github-tavenel-dev/issues) with the relevant video or example.

The code in this repository is licensed under the [MIT License](LICENSE).
