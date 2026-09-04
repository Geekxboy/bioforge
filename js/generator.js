function buildProfileCss() {
  return `:root {
  --profile-bg: ${profile.colors.background};
  --profile-text: #f0f6fc;
  --profile-muted: #8b949e;
  --profile-accent: ${profile.colors.accent};
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  min-height: 100%;
}

body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--profile-bg);
  color: var(--profile-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.profile {
  width: min(100%, 680px);
  text-align: center;
  padding: 50px 24px;
}

.avatar {
  width: 116px;
  height: 116px;
  border-radius: 50%;
  object-fit: cover;
  background: rgba(255,255,255,.06);
  border: 2px solid var(--profile-accent);
}

.name {
  margin: 20px 0 4px;
  font-size: clamp(32px, 7vw, 48px);
  line-height: 1.05;
  letter-spacing: -.045em;
}

.username {
  margin: 0;
  color: var(--profile-accent);
  font-weight: 700;
}

.bio {
  color: var(--profile-muted);
  line-height: 1.7;
  white-space: pre-line;
}

.meta {
  color: var(--profile-muted);
  font-size: 13px;
}

.links {
  display: grid;
  gap: 10px;
  margin-top: 30px;
}

.links a {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--profile-accent) 40%, #fff 5%);
  border-radius: 10px;
  color: var(--profile-text);
  text-decoration: none;
  background: rgba(255,255,255,.025);
  transition: transform .15s, border-color .15s;
}

.links a:hover {
  transform: translateY(-2px);
  border-color: var(--profile-accent);
}

.link-icon {
  width: 18px;
  height: 18px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 18px;
}

.link-icon svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
  stroke: none;
}

.link-icon svg[stroke]:not([stroke="none"]) {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.site {
  display: inline-block;
  margin-top: 24px;
  color: var(--profile-accent);
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
}

/* ${profile.theme} theme */
${themeCss(profile.theme)}
`;
}

function themeCss(theme) {
  if (theme === "terminal") return `
.profile { font-family: "SFMono-Regular", Consolas, monospace; text-align: left; }
.avatar { border-radius: 8px; width: 90px; height: 90px; }
.name { font-size: clamp(28px, 6vw, 40px); }
.name::before { content: "> "; color: var(--profile-accent); }
`;
  if (theme === "minimal") return `
body { background: #f7f7f5; color: #161616; }
.profile { text-align: left; }
.avatar { width: 88px; height: 88px; border: 0; }
.bio, .meta { color: #686863; }
.links a { color: #161616; background: #fff; border-color: #d9d9d2; border-radius: 6px; }
`;
  if (theme === "glass") return `
body {
  background:
    radial-gradient(circle at 15% 10%, color-mix(in srgb, var(--profile-accent) 24%, transparent), transparent 32%),
    radial-gradient(circle at 90% 80%, rgba(167,139,250,.18), transparent 30%),
    #090b12;
}
.profile {
  padding: 42px 28px;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 24px;
  background: rgba(255,255,255,.055);
  box-shadow: 0 30px 100px rgba(0,0,0,.28);
  backdrop-filter: blur(18px);
}
.links a { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.12); border-radius: 14px; }
`;
  return "";
}

function buildProfileHtml() {
  const links = profile.links
    .filter(x => x.title.trim() && x.url.trim())
    .map(x => `      <a class="profile-link" href="${safeUrl(x.url)}" target="_blank" rel="noopener noreferrer"><span class="link-icon">${getIconSvg(x.icon)}</span><span>${x.title}</span></a>`)
    .join("\n");

  const avatar = profile.avatar.trim()
    ? `    <img class="avatar" src="${profile.avatar.trim()}" alt="${profile.name || "Profile avatar"}">`
    : "";

  const username = profile.username.trim()
    ? `    <p class="username">@${profile.username.replace(/^@/, "")}</p>`
    : "";

  const bio = profile.bio.trim()
    ? `    <p class="bio">${profile.bio.replaceAll("\n", "<br>")}</p>`
    : "";

  const meta = profile.location.trim()
    ? `    <p class="meta">${profile.location}</p>`
    : "";

  const site = profile.website.trim()
    ? `    <a class="site" href="${safeUrl(profile.website)}" target="_blank" rel="noopener noreferrer">${profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${profile.bio || profile.name}">
  <title>${profile.name || "Profile"}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="profile">
${avatar}
    <h1 class="name">${profile.name || "Your Name"}</h1>
${username}
${bio}
${meta}
    <nav class="links" aria-label="Profile links">
${links}
    </nav>
${site}
  </main>
</body>
</html>
`;
}

function buildConfigJs() {
  const copy = structuredClone(profile);
  return `// BioForge profile configuration
// Edit this file to update your profile.
// Regenerate index.html/style.css with BioForge when needed.

const profile = ${JSON.stringify(copy, null, 2)};
`;
}

function downloadText(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadProfile() {
  if (typeof JSZip === "undefined") {
    showToast("ZIP library could not be loaded");
    return;
  }

  const zip = new JSZip();
  zip.file("index.html", buildProfileHtml());
  zip.file("style.css", buildProfileCss());
  zip.file("profile.js", buildConfigJs());
  zip.file("README.md", `# ${profile.name || "My Bio Profile"}\n\nGenerated with BioForge.\n\nEdit profile.js and regenerate the site when you want to make changes.\n`);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(profile.name || "my-bio-profile")}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Profile ZIP downloaded");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "my-bio-profile";
}

