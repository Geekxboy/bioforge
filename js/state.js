const DEFAULT_PROFILE = {
  name: "Jane Doe",
  username: "janedoe",
  bio: "Designer, developer, and maker of things.",
  location: "Washington, USA",
  website: "https://example.com",
  avatar: "",
  links: [
    { title: "GitHub", url: "https://github.com/", icon: "github" },
    { title: "Instagram", url: "https://instagram.com/", icon: "instagram" },
    { title: "Facebook", url: "https://facebook.com/", icon: "facebook" },
    { title: "Email", url: "mailto:hello@example.com", icon: "mail" }
  ],
  theme: "geek",
  colors: {
    background: "#0d1117",
    accent: "#58a6ff"
  },
  includeBuiltWith: true
};

let profile = loadProfile();

function loadProfile() {
  try {
    const saved = localStorage.getItem("bioforge-profile");
    if (!saved) return structuredClone(DEFAULT_PROFILE);
    return normalizeProfile(JSON.parse(saved));
  } catch {
    return structuredClone(DEFAULT_PROFILE);
  }
}

function normalizeProfile(value) {
  const base = structuredClone(DEFAULT_PROFILE);
  return {
    ...base,
    ...value,
    colors: { ...base.colors, ...(value.colors || {}) },
    links: Array.isArray(value.links)
      ? value.links.map(x => ({
          title: String(x.title || ""),
          url: String(x.url || ""),
          icon: String(x.icon || "link")
        }))
      : base.links,
    includeBuiltWith: Boolean(value.includeBuiltWith)
  };
}

function saveProfile() {
  localStorage.setItem("bioforge-profile", JSON.stringify(profile));
}
