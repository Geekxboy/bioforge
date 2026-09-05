const themeDefaults = {
  geek: {
    name: "Geek",
    background: "#0d1117",
    accent: "#58a6ff"
  },
  terminal: {
    name: "Terminal",
    background: "#0d1117",
    accent: "#58ff6e"
  },
  minimal: {
    name: "Minimal",
    background: "#f7f7f5",
    accent: "#58a6ff"
  },
  glass: {
    name: "Glass",
    background: "#58a6ff",
    accent: "#7758ff"
  }
};


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

const restoreBackgroundBtn = document.querySelector(".restore-background");
const restoreAccentBtn = document.querySelector(".restore-accent");

let activeModalLinkIndex = null;
let currentCategory = "all";
let searchDebounceTimer = null;
const MAX_RENDER_COUNT = 160;

// Avatar Upload Elements
const avatarFileInput = document.getElementById("avatarFileInput");
const removeAvatarBtn = document.getElementById("removeAvatarBtn");
const avatarPreviewImg = document.getElementById("avatarPreviewImg");

function syncFieldsFromState() {
  fields.name.value = profile.name;
  fields.username.value = profile.username;
  fields.bio.value = profile.bio;
  fields.location.value = profile.location;
  fields.website.value = profile.website;
  fields.avatar.value = profile.avatar.startsWith("data:") ? "" : profile.avatar;
  fields.theme.value = profile.theme;
  fields.background.value = profile.colors.background;
  fields.accent.value = profile.colors.accent;
  syncAvatarUI();
  renderLinksEditor();
}

function syncAvatarUI() {
  const avatarSrc = profile.avatar.trim() || "assets/default-avatar.svg";
  avatarPreviewImg.src = avatarSrc;
  removeAvatarBtn.hidden = !profile.avatar.trim();
}

function updateState(key, value) {
  if (key === "theme") {
    if (fields.background.value === themeDefaults[profile.theme].background) {
      fields.background.value = themeDefaults[value].background;
      profile.colors["background"] = themeDefaults[value].background;
    } 
    
    if (fields.accent.value === themeDefaults[profile.theme].accent) {
      fields.accent.value = themeDefaults[value].accent;
      profile.colors["accent"] = themeDefaults[value].accent;
    }
  }

  if (key === "background" || key === "accent") {
    profile.colors[key] = value;
  } else {
    profile[key] = value;
  }
  if (key === "avatar") {
    syncAvatarUI();
  }
  saveProfile();
  themeColorCheck();
  renderPreview();
}

function renderLinksEditor() {
  const root = document.getElementById("linksEditor");
  root.innerHTML = "";

  profile.links.forEach((link, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "link-editor";
    wrapper.innerHTML = `
    
      <div class="link-editor-container">
        <div class="link-editor-row">
          <div class="field">
            <span>Icon</span>
            <button type="button" class="icon-picker-btn" data-open-icon-modal="${index}" title="Click to choose icon">
              <span class="icon-picker-preview">${getIconSvg(link.icon)}</span>
              <span class="icon-picker-name">${escapeHtml(getIconTitle(link.icon))}</span>
              <span class="icon-picker-arrow">▾</span>
            </button>
          </div>
          <label class="field">
            <span>Label</span>
            <input type="text" data-link-title="${index}" value="${escapeHtml(link.title)}" placeholder="GitHub">
          </label>
          <button class="remove-link" type="button" data-remove-link="${index}" title="Remove link" aria-label="Remove link">×</button>
        </div>
        <label class="field">
          <span>URL</span>
          <input type="url" data-link-url="${index}" value="${escapeHtml(link.url)}" placeholder="https://...">
        </label>
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

// Avatar File Upload Handlers
avatarFileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Please select a valid image file");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast("Image file size should be under 5MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = event => {
    profile.avatar = event.target.result;
    saveProfile();
    syncAvatarUI();
    renderPreview();
    showToast("Avatar image uploaded");
  };
  reader.readAsDataURL(file);
});

removeAvatarBtn.addEventListener("click", () => {
  profile.avatar = "";
  avatarFileInput.value = "";
  fields.avatar.value = "";
  saveProfile();
  syncAvatarUI();
  renderPreview();
  showToast("Avatar removed");
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

// Import Profile Config Handler
const importConfigInput = document.getElementById("importConfigInput");

importConfigInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".json")) {
    showToast("Please select a valid .json file (e.g. profile.json)");
    importConfigInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = event => {
    try {
      const content = event.target.result;
      const parsed = parseProfileConfig(content);
      profile = normalizeProfile(parsed);
      saveProfile();
      syncFieldsFromState();
      renderPreview();
      showToast(`Loaded profile from ${file.name}`);
    } catch (err) {
      console.error("Failed to import profile config:", err);
      showToast(`Could not parse ${file.name}`);
    }
    importConfigInput.value = "";
  };
  reader.readAsText(file);
});

function parseProfileConfig(text) {
  // Extract JSON object substring {...}
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON profile configuration object found");
  }

  return JSON.parse(jsonMatch[0]);
}

document.getElementById("configBtn").addEventListener("click", () => {
  downloadText("profile.json", buildConfigJson(), "application/json");
  showToast("Downloaded profile.json");
});

document.getElementById("copyConfigBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(buildConfigJson());
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

// Theme Options and Color Restore Buttons
function loadThemeOptions() {
  Object.entries(themeDefaults).forEach(([key, value]) => {
    const option = document.createElement("option");
    option.value = key.toLowerCase();
    option.textContent = value.name;
    fields.theme.appendChild(option);
  });
}

function themeColorCheck() {
  const theme = fields.theme.value;
  const defaultBackground = themeDefaults[theme].background;
  const defaultAccent = themeDefaults[theme].accent;

  if (fields.background.value.toLowerCase() === defaultBackground.toLowerCase()) {
    restoreBackgroundBtn.classList.add("hide");
  } else {
    restoreBackgroundBtn.classList.remove("hide");
  }

  if (fields.accent.value.toLowerCase() === defaultAccent.toLowerCase()) {
    restoreAccentBtn.classList.add("hide");
  } else {
    restoreAccentBtn.classList.remove("hide");
  }
}

restoreBackgroundBtn.addEventListener("click", (e) => {
  e.preventDefault();
  fields.background.value = themeDefaults[fields.theme.value].background;
  fields.background.dispatchEvent(
    new Event("change", {
      bubbles: true,
    }),
  );
});

restoreAccentBtn.addEventListener("click", (e) => {
  e.preventDefault();
  fields.accent.value = themeDefaults[fields.theme.value].accent;
  fields.accent.dispatchEvent(
    new Event("change", {
      bubbles: true,
    }),
  );
});

// Load theme options into the select dropdown
loadThemeOptions();

// Initial state sync and background icons load
syncFieldsFromState();
renderPreview();
themeColorCheck();
loadSimpleIcons().then(() => {
  // Re-render link editor and preview once Simple Icons metadata/paths are fully loaded
  renderLinksEditor();
  renderPreview();
});
