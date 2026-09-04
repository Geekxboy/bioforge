# BioForge

A tiny, dependency-free bio profile generator built with vanilla HTML, CSS and JavaScript.

## Features

- Live profile preview
- Four built-in themes
- Dynamic profile links
- Custom accent/background colors
- Browser-local persistence
- Standalone `index.html` + `style.css` generation
- One-click ZIP packaging
- Portable `profile.js` configuration
- Per-link icons from a built-in SVG icon set
- No framework
- No build step
- GitHub Pages friendly

## Run locally

Open `index.html` in a browser.

For local development with a static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

Push the repository to GitHub, then enable GitHub Pages from:

**Repository Settings → Pages → Deploy from a branch**

Select the branch containing `index.html`.

## Profile workflow

1. Edit your profile in BioForge.
2. Download the generated files.
3. Put `index.html` and `style.css` in your profile repository.
4. Optionally keep `profile.js` as the editable source of truth.
5. Regenerate whenever the profile changes.

## Roadmap

- Import profile.js / JSON
- More themes
- Font selection
- Projects section
- Skills section
- Open Graph metadata
- Favicon generator


## Link icons

Each link has an `icon` property:

```js
{
  title: "GitHub",
  url: "https://github.com/",
  icon: "github"
}
```

Built-in icons currently include `github`, `globe`, `mail`, `linkedin`, `youtube`, `instagram`, `twitter`, and `link`.

## Generated package

Click **Download ZIP** to receive:

```text
my-bio-profile.zip
├── index.html
├── style.css
├── profile.js
└── README.md
```

The generated site does not depend on BioForge. The icon SVGs are embedded directly into the generated HTML, so the profile remains portable.
