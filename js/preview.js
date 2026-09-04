function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value = "") {
  const url = String(value).trim();
  if (!url) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  return `https://${url}`;
}

function renderPreview() {
  const preview = document.getElementById("profilePreview");
  const links = profile.links
    .filter(link => link.title.trim() && link.url.trim())
    .map(link => `<a class="profile-link" href="${escapeHtml(safeUrl(link.url))}" target="_blank" rel="noopener noreferrer">
        <span class="link-icon">${getIconSvg(link.icon)}</span>
        <span>${escapeHtml(link.title)}</span>
      </a>`)
    .join("");

  const avatar = profile.avatar.trim()
    ? `<img class="profile-avatar" src="${escapeHtml(profile.avatar.trim())}" alt="${escapeHtml(profile.name || "Profile avatar")}" onerror="this.style.visibility='hidden'">`
    : `<div class="profile-avatar" aria-hidden="true"></div>`;

  const meta = [profile.location.trim()].filter(Boolean).map(escapeHtml).join("");

  preview.innerHTML = `
    <article class="profile-page theme-${escapeHtml(profile.theme)}"
      style="--profile-bg:${escapeHtml(profile.colors.background)};--profile-accent:${escapeHtml(profile.colors.accent)}">
      <div class="profile-card">
        ${avatar}
        <h1 class="profile-name">${escapeHtml(profile.name || "Your Name")}</h1>
        ${profile.username.trim() ? `<p class="profile-username">@${escapeHtml(profile.username.replace(/^@/, ""))}</p>` : ""}
        ${profile.bio.trim() ? `<p class="profile-bio">${escapeHtml(profile.bio)}</p>` : ""}
        ${meta ? `<p class="profile-meta">${meta}</p>` : ""}
        ${links ? `<nav class="profile-links" aria-label="Profile links">${links}</nav>` : ""}
        ${profile.website.trim() ? `<a class="profile-site" href="${escapeHtml(safeUrl(profile.website))}" target="_blank" rel="noopener noreferrer">${escapeHtml(profile.website.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a>` : ""}
      </div>
    </article>
  `;
}
