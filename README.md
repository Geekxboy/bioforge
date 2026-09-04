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
- Portable `profile.json` configuration
- Import `profile.json` file for updating
- Per-link icons
- No frameworks
- No build steps
- GitHub Pages friendly

## Run locally

Open `index.html` in a browser.

For local development with a static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages After Download the Zip File

Push the repository to GitHub, then enable GitHub Pages from:

**Repository Settings → Pages → Deploy from a branch**

Select the branch containing `index.html`.

## Profile workflow

1. Edit your profile in BioForge.
2. Download the generated files.
3. Put `index.html` and `style.css` in your profile repository. (Upload `avatar.png` if you used the upload feature)
4. Optionally keep `profile.json` as the editable source of truth.
5. Regenerate whenever the profile changes.

## Roadmap

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

Built-in icons currently include `github`, `globe`, `mail`, `linkedin`, `youtube`, `instagram`, `twitter`, and `link`. Additional icons are imported through Simple Icons

## Generated package

Click **Download ZIP** to receive:

```text
my-bio-profile.zip
├── index.html
├── style.css
├── profile.json
├── avatar.png (Only if using the upload image feature)
└── README.md
```

The generated site does not depend on BioForge. The icon SVGs are embedded directly into the generated HTML, so the profile remains portable.