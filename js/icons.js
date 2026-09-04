const ICONS = {
  github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
  link: '<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07.07l2-2A5 5 0 0 0 12 4l-1.14 1.14M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.14-1.14"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 10v6M8 8v.01M12 16v-6M12 13a3 3 0 0 1 6 0v3"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="m10 9 5 3-5 3V9Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><path d="M17.5 6.5h.01"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 7.2c-.6.3-1.3.5-2 .6a3.5 3.5 0 0 0-6 2.4v.8A8.9 8.9 0 0 1 4 7s-3 7 4 10.5a9.7 9.7 0 0 1-5 1.5c7 4 15.5 0 15.5-8.9v-.4c.7-.5 1.2-1.1 1.5-1.8Z"/></svg>'
};

const BUILTIN_TITLES = {
  github: "GitHub",
  globe: "Globe",
  mail: "Email",
  link: "Generic link",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  instagram: "Instagram",
  twitter: "X / Twitter"
};

const POPULAR_SLUGS = [
  "github", "x", "twitter", "linkedin", "instagram", "youtube", "discord", "spotify",
  "bluesky", "threads", "twitch", "tiktok", "reddit", "facebook", "patreon", "substack",
  "medium", "whatsapp", "telegram", "signal", "globe", "mail", "link"
];

const DEV_SLUGS = [
  "github", "gitlab", "bitbucket", "docker", "npm", "python", "javascript", "typescript",
  "react", "vuedotjs", "angular", "nodedotjs", "rust", "go", "html5", "css3",
  "tailwindcss", "figma", "visualstudiocode", "codepen", "stackoverflow", "hashnode"
];

const SIMPLE_ICONS_MAP = new Map();
let allIconsList = [];
let isSimpleIconsLoaded = false;
let loadPromise = null;

async function loadSimpleIcons() {
  if (isSimpleIconsLoaded) return allIconsList;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const module = await import("https://cdn.jsdelivr.net/npm/simple-icons@14/+esm");
      const list = [];
      Object.values(module).forEach(icon => {
        if (icon && icon.slug && icon.path) {
          SIMPLE_ICONS_MAP.set(icon.slug, icon);
          list.push({
            slug: icon.slug,
            title: icon.title,
            hex: icon.hex || "5865F2",
            path: icon.path,
            aliases: icon.aliases ? [
              ...(icon.aliases.aka || []),
              ...(icon.aliases.dup ? icon.aliases.dup.map(d => d.title) : [])
            ] : []
          });
        }
      });

      // Include built-in non-Simple Icons if not already covered
      Object.keys(ICONS).forEach(key => {
        if (!SIMPLE_ICONS_MAP.has(key)) {
          list.push({
            slug: key,
            title: BUILTIN_TITLES[key] || key,
            hex: "58a6ff",
            isBuiltin: true
          });
        }
      });

      allIconsList = list;
      isSimpleIconsLoaded = true;
    } catch (err) {
      console.warn("Failed to fetch Simple Icons ESM bundle, using built-in icons fallback.", err);
      allIconsList = Object.keys(ICONS).map(key => ({
        slug: key,
        title: BUILTIN_TITLES[key] || key,
        hex: "58a6ff",
        isBuiltin: true
      }));
      isSimpleIconsLoaded = true;
    }
    return allIconsList;
  })();

  return loadPromise;
}

function getIconSvg(name = "link") {
  if (ICONS[name]) {
    return ICONS[name];
  }
  const simpleIcon = SIMPLE_ICONS_MAP.get(name);
  if (simpleIcon) {
    return `<svg role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><title>${escapeHtml(simpleIcon.title)}</title><path d="${simpleIcon.path}"/></svg>`;
  }
  return ICONS.link;
}

function getIconTitle(name = "link") {
  if (BUILTIN_TITLES[name]) {
    return BUILTIN_TITLES[name];
  }
  const simpleIcon = SIMPLE_ICONS_MAP.get(name);
  if (simpleIcon) {
    return simpleIcon.title;
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getIconHex(name = "link") {
  const simpleIcon = SIMPLE_ICONS_MAP.get(name);
  if (simpleIcon && simpleIcon.hex) {
    return `#${simpleIcon.hex}`;
  }
  return "#58a6ff";
}

function filterIcons(query = "", category = "all") {
  const q = query.trim().toLowerCase();
  let baseList = allIconsList;

  if (category === "popular") {
    baseList = allIconsList.filter(item => POPULAR_SLUGS.includes(item.slug));
  } else if (category === "dev") {
    baseList = allIconsList.filter(item => DEV_SLUGS.includes(item.slug));
  }

  if (!q) {
    return baseList;
  }

  return baseList.filter(item => {
    if (item.title.toLowerCase().includes(q)) return true;
    if (item.slug.toLowerCase().includes(q)) return true;
    if (item.aliases && item.aliases.some(alias => alias.toLowerCase().includes(q))) return true;
    return false;
  });
}

// Pre-trigger icon loading in the background
loadSimpleIcons();
