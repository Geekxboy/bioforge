const ICON_OPTIONS = [
  ["github", "GitHub"],
  ["globe", "Globe"],
  ["mail", "Email"],
  ["linkedin", "LinkedIn"],
  ["youtube", "YouTube"],
  ["instagram", "Instagram"],
  ["twitter", "X / Twitter"],
  ["link", "Generic link"]
];

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
        <label class="field">
          <span>Icon</span>
          <select data-link-icon="${index}">
            ${ICON_OPTIONS.map(([value, label]) => `<option value="${value}" ${link.icon === value ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
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

  root.querySelectorAll("[data-link-icon]").forEach(select => {
    select.addEventListener("change", e => {
      profile.links[Number(e.target.dataset.linkIcon)].icon = e.target.value;
      saveProfile();
      renderPreview();
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

syncFieldsFromState();
renderPreview();
