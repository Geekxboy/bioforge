const fields = {
  name: document.getElementById("nameInput"),
  username: document.getElementById("usernameInput"),
  bio: document.getElementById("bioInput"),
  location: document.getElementById("locationInput"),
  website: document.getElementById("websiteInput"),
  avatar: document.getElementById("avatarInput"),
  theme: document.getElementById("themeInput"),
  background: document.getElementById("backgroundInput"),
  accent: document.getElementById("accentInput")
};

// Modal Elements
const modalOverlay = document.getElementById("iconModal");
const iconSearchInput = document.getElementById("iconSearchInput");
const clearIconSearchBtn = document.getElementById("clearIconSearchBtn");
const closeIconModalBtn = document.getElementById("closeIconModalBtn");
const cancelIconModalBtn = document.getElementById("cancelIconModalBtn");
const iconGrid = document.getElementById("iconGrid");
const iconGridEmpty = document.getElementById("iconGridEmpty");
const searchQueryText = document.getElementById("searchQueryText");
const iconCountBadge = document.getElementById("iconCountBadge");
const iconCategoryTabs = document.getElementById("iconCategoryTabs");

let activeModalLinkIndex = null;
let currentCategory = "all";
let searchDebounceTimer = null;
const MAX_RENDER_COUNT = 160;

function syncFieldsFromState() {
  fields.name.value = profile.name;
  fields.username.value = profile.username;
  fields.bio.value = profile.bio;
  fields.location.value = profile.location;
  fields.website.value = profile.website;
  fields.avatar.value = profile.avatar;
  fields.theme.value = profile.theme;
  fields.background.value = profile.colors.background;
  fields.accent.value = profile.colors.accent;
  renderLinksEditor();
}

function updateState(key, value) {
  if (key === "background" || key === "accent") {
    profile.colors[key] = value;
  } else {
    profile[key] = value;
  }
  saveProfile();
  renderPreview();
}

function renderLinksEditor() {
  const root = document.getElementById("linksEditor");
  root.innerHTML = "";

  profile.links.forEach((link, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "link-editor";
    wrapper.innerHTML = `
      <div class="link-editor-row">
        <label class="field">
          <span>Label</span>
          <input type="text" data-link-title="${index}" value="${escapeHtml(link.title)}" placeholder="GitHub">
        </label>
        <label class="field">
          <span>URL</span>
          <input type="url" data-link-url="${index}" value="${escapeHtml(link.url)}" placeholder="https://...">
        </label>
        <div class="field">
          <span>Icon</span>
          <button type="button" class="icon-picker-btn" data-open-icon-modal="${index}" title="Click to choose icon">
            <span class="icon-picker-preview">${getIconSvg(link.icon)}</span>
            <span class="icon-picker-name">${escapeHtml(getIconTitle(link.icon))}</span>
            <span class="icon-picker-arrow">▾</span>
          </button>
        </div>
        <button class="remove-link" type="button" data-remove-link="${index}" aria-label="Remove link">×</button>
      </div>
    `;
    root.appendChild(wrapper);
  });

  root.querySelectorAll("[data-link-title]").forEach(input => {
    input.addEventListener("input", e => {
      profile.links[Number(e.target.dataset.linkTitle)].title = e.target.value;
      saveProfile();
      renderPreview();
    });
  });

  root.querySelectorAll("[data-link-url]").forEach(input => {
    input.addEventListener("input", e => {
      profile.links[Number(e.target.dataset.linkUrl)].url = e.target.value;
      saveProfile();
      renderPreview();
    });
  });

  root.querySelectorAll("[data-open-icon-modal]").forEach(button => {
    button.addEventListener("click", () => {
      openIconModal(Number(button.dataset.openIconModal));
    });
  });

  root.querySelectorAll("[data-remove-link]").forEach(button => {
    button.addEventListener("click", () => {
      profile.links.splice(Number(button.dataset.removeLink), 1);
      saveProfile();
      renderLinksEditor();
      renderPreview();
    });
  });
}

// Icon Popover Modal Functions
async function openIconModal(linkIndex) {
  activeModalLinkIndex = linkIndex;
  modalOverlay.classList.add("show");
  modalOverlay.setAttribute("aria-hidden", "false");

  iconSearchInput.value = "";
  clearIconSearchBtn.hidden = true;
  currentCategory = "all";

  // Reset category tabs UI
  iconCategoryTabs.querySelectorAll(".category-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.category === "all");
  });

  iconCountBadge.textContent = "Loading icons...";
  await loadSimpleIcons();
  renderIconGrid();

  setTimeout(() => {
    iconSearchInput.focus();
  }, 100);
}

function closeIconModal() {
  modalOverlay.classList.remove("show");
  modalOverlay.setAttribute("aria-hidden", "true");
  activeModalLinkIndex = null;
}

function renderIconGrid() {
  const query = iconSearchInput.value.trim();
  const currentIconSlug = activeModalLinkIndex !== null ? profile.links[activeModalLinkIndex].icon : "";
  const filtered = filterIcons(query, currentCategory);

  iconGrid.innerHTML = "";

  if (filtered.length === 0) {
    searchQueryText.textContent = query;
    iconGridEmpty.hidden = false;
    iconCountBadge.textContent = "0 icons found";
    return;
  }

  iconGridEmpty.hidden = true;

  const displayList = filtered.slice(0, MAX_RENDER_COUNT);

  if (filtered.length > MAX_RENDER_COUNT) {
    iconCountBadge.textContent = `Showing ${displayList.length} of ${filtered.length.toLocaleString()} icons (type to refine search)`;
  } else {
    iconCountBadge.textContent = `${filtered.length.toLocaleString()} icon${filtered.length === 1 ? "" : "s"} available`;
  }

  const fragment = document.createDocumentFragment();

  displayList.forEach(item => {
    const card = document.createElement("div");
    card.className = `icon-card${item.slug === currentIconSlug ? " selected" : ""}`;
    card.dataset.slug = item.slug;
    card.title = item.title;

    const hexColor = item.hex ? `#${item.hex}` : "#58a6ff";

    card.innerHTML = `
      <div class="icon-card-svg">${getIconSvg(item.slug)}</div>
      <span class="icon-card-name">${escapeHtml(item.title)}</span>
      <span class="icon-card-dot" style="background:${hexColor}" title="Brand Color"></span>
    `;

    card.addEventListener("click", () => selectIcon(item.slug, item.title));
    fragment.appendChild(card);
  });

  iconGrid.appendChild(fragment);

  // Scroll selected icon into view
  const selectedElem = iconGrid.querySelector(".icon-card.selected");
  if (selectedElem) {
    selectedElem.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

function selectIcon(slug, title) {
  if (activeModalLinkIndex !== null && profile.links[activeModalLinkIndex]) {
    profile.links[activeModalLinkIndex].icon = slug;
    saveProfile();
    renderLinksEditor();
    renderPreview();
    closeIconModal();
    showToast(`Updated icon to "${title}"`);
  }
}

// Modal Event Listeners
iconSearchInput.addEventListener("input", () => {
  clearIconSearchBtn.hidden = !iconSearchInput.value.trim();
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(renderIconGrid, 60);
});

clearIconSearchBtn.addEventListener("click", () => {
  iconSearchInput.value = "";
  clearIconSearchBtn.hidden = true;
  renderIconGrid();
  iconSearchInput.focus();
});

iconCategoryTabs.addEventListener("click", e => {
  const btn = e.target.closest(".category-tab");
  if (!btn) return;
  iconCategoryTabs.querySelectorAll(".category-tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  currentCategory = btn.dataset.category;
  renderIconGrid();
});

closeIconModalBtn.addEventListener("click", closeIconModal);
cancelIconModalBtn.addEventListener("click", closeIconModal);

modalOverlay.addEventListener("click", e => {
  if (e.target === modalOverlay) {
    closeIconModal();
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && modalOverlay.classList.contains("show")) {
    closeIconModal();
  }
});

Object.entries(fields).forEach(([key, input]) => {
  input.addEventListener("input", () => updateState(key, input.value));
  input.addEventListener("change", () => updateState(key, input.value));
});

document.getElementById("addLinkBtn").addEventListener("click", () => {
  profile.links.push({ title: "New Link", url: "https://", icon: "link" });
  saveProfile();
  renderLinksEditor();
  renderPreview();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset your profile to the default example?")) return;
  profile = structuredClone(DEFAULT_PROFILE);
  saveProfile();
  syncFieldsFromState();
  renderPreview();
  showToast("Profile reset");
});

document.getElementById("downloadBtn").addEventListener("click", downloadProfile);

document.getElementById("configBtn").addEventListener("click", () => {
  downloadText("profile.js", buildConfigJs(), "text/javascript");
  showToast("Downloaded profile.js");
});

document.getElementById("copyConfigBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(buildConfigJs());
  showToast("Config copied");
});

document.getElementById("copyHtmlBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(buildProfileHtml());
  showToast("HTML copied");
});

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

// Initial state sync and background icons load
syncFieldsFromState();
renderPreview();
loadSimpleIcons().then(() => {
  // Re-render link editor and preview once Simple Icons metadata/paths are fully loaded
  renderLinksEditor();
  renderPreview();
});
