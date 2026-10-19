# Tavenel Dev

Explore the code behind the [Tavenel Dev YouTube channel](https://www.youtube.com/@tavenel-dev). Try an animation, inspect the HTML and CSS, and adapt it for your own projects.

**[Explore the live gallery](https://thekester.github.io/github-tavenel-dev/)** · **[Watch the Shorts](https://www.youtube.com/@tavenel-dev/shorts)** · **[Browse the code](videos/css/)**

## What's inside

**275 standalone HTML and CSS demos**, from animated scenes and 3D objects to interactive forms and games. Each example has its own folder containing:

- `index.html` for the markup and controls.
- `style.css` for the styling, animations, and interactions.
- `README.md` with instructions, a live demo link, and the matching YouTube video when available.

The demos need no dependencies or build tools. The gallery adds search, filters, and a page for each example where you can copy the HTML and CSS before launching the demo in a new tab. Upcoming videos appear under **Available soon**, with their code and demos ready to explore.

The homepage features a randomly selected published video with its matching code link. Click the thumbnail to play it, or open it on YouTube. Without JavaScript, the latest matched video remains available as a direct link.

## Start exploring

| Example | What you'll explore | Links |
| --- | --- | --- |
| Synthwave | Perspective, gradients, and a moving grid | [Code & demo](https://thekester.github.io/github-tavenel-dev/examples/synthwave/) · [Files](videos/css/synthwave/) |
| 3D book | Transforms that open a book on hover | [Code & demo](https://thekester.github.io/github-tavenel-dev/examples/3d-book/) · [Files](videos/css/3d-book/) |
| Retro CRT TV | A television power-off effect | [Code & demo](https://thekester.github.io/github-tavenel-dev/examples/crt-tv/) · [Files](videos/css/crt-tv/) |

Browse the [full gallery](https://thekester.github.io/github-tavenel-dev/) to find a title, effect, or CSS feature.

## Run a demo locally

```bash
git clone https://github.com/thekester/github-tavenel-dev.git
cd github-tavenel-dev
```

Open `videos/css/index.html` in your browser to browse the collection, or open an example's `index.html` directly.

Hover, click, focus, or type into the controls to try the interactions. Edit the HTML or CSS, then refresh the page to see your changes.

Some examples use recent CSS features such as `:has()`, `@property`, `offset-path`, `linear()`, anchor positioning, and `if()`. A current Chromium-based browser offers the broadest support.

## Repository layout

```text
videos/css/
  index.html                Browse all demos locally
  synthwave/
    index.html              Demo markup
    style.css               Demo styling
    README.md               Explanation, demo and YouTube links
  ...                       One folder per example
data/catalog.json           Titles, descriptions and verified YouTube links
site/                       Gallery and example templates, styles and JavaScript
scripts/build_site.py       Validates the catalogue and generates _site/
.github/workflows/pages.yml GitHub Pages build and deployment
LICENSE                     MIT License
```

The HTML and CSS demos were imported unchanged from the original archive. JavaScript handles gallery search, filters, pagination, and the code copy buttons. The build generates an `examples/<slug>/` page for each demo; the original `videos/css/<slug>/` URLs still launch the demos directly.

## Preview the website

Python 3.11 or later is sufficient; no third-party packages are required.

```bash
python scripts/build_site.py
python -m http.server 8000 --directory _site
```

Open [localhost:8000](http://localhost:8000). After editing the template, assets, or catalogue, run the build command again and refresh the page. `_site/` is generated and ignored by Git.

The gallery also works without JavaScript, with all examples displayed on one page. On an example page, you can select and copy the code manually and launch the demo without JavaScript.

## YouTube catalogue

As of **October 19, 2026**, the catalogue includes **75 public Shorts**, with **73 linked to example folders**. The remaining two videos appear separately in the gallery because their source code has not been identified in this collection.

Links are maintained in [data/catalog.json](data/catalog.json). Examples without a video link are listed as **Available soon** for upcoming videos. Add the YouTube ID when a video is published to move its example into **On YouTube**. The site loads thumbnails from YouTube and fonts from Google Fonts, with fallback fonts available.

## Add an example or video

1. Create `videos/css/<slug>/` with `index.html`, `style.css`, and a README. Use an existing example README as a starting point.
2. Add its `slug`, `title`, `description`, and `youtubeId` to `examples` in `data/catalog.json`. Use `null` until a matching video is confirmed.
3. For a published Short, add its `id`, `title`, `url`, and `slug` to `videos` in the same file. Keep the videos ordered newest first. Use a `null` slug for a video without corresponding code.
4. Add the example to the original `videos/css/index.html` index and update the counts in this README when needed.
5. Run `python scripts/build_site.py` and preview the result. Commit and push to `main` to deploy.

## GitHub Pages

Pushes to `main` trigger the [Pages workflow](.github/workflows/pages.yml), which validates the catalogue, builds the gallery, and deploys it to [GitHub Pages](https://thekester.github.io/github-tavenel-dev/).

To deploy a fork, select **GitHub Actions** under **Settings → Pages → Build and deployment → Source**, then update the repository and website links for your own account.

## Contributing

Bug fixes, clearer explanations, and new examples are welcome. [Open an issue](https://github.com/thekester/github-tavenel-dev/issues) or submit a pull request with the relevant example, a description of the change, and how you checked it. For rendering issues, include your browser and version.

## License

The code is available under the [MIT License](LICENSE). You can use, modify, and share it, including in commercial projects, provided you retain the license and copyright notice.
