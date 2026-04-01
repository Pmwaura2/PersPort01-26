const editor = document.getElementById("content-editor");
const statusLabel = document.getElementById("admin-status");
const uploadResult = document.getElementById("upload-result");
const fileInput = document.getElementById("media-file");
const mediaStatus = document.getElementById("media-status");
const mediaLibrary = document.getElementById("media-library");
const mediaTargetLabel = document.getElementById("media-target-label");
const interestCardsRoot = document.getElementById("interest-cards");
const projectsRoot = document.getElementById("projects-list");

let currentContent = null;
let mediaItems = [];
let activeMediaTarget = null;

const inputs = {
  siteName: document.getElementById("site-name"),
  siteBrand: document.getElementById("site-brand"),
  siteRole: document.getElementById("site-role"),
  siteLocation: document.getElementById("site-location"),
  siteEmail: document.getElementById("site-email"),
  siteAvailability: document.getElementById("site-availability"),
  siteLinkedin: document.getElementById("site-linkedin"),
  siteGithub: document.getElementById("site-github"),
  siteResume: document.getElementById("site-resume"),
  introEyebrow: document.getElementById("intro-eyebrow"),
  introOverviewTitle: document.getElementById("intro-overview-title"),
  introTitle: document.getElementById("intro-title"),
  introTitleAccent: document.getElementById("intro-title-accent"),
  introLede: document.getElementById("intro-lede"),
  introPrimaryLabel: document.getElementById("intro-primary-label"),
  introPrimaryHref: document.getElementById("intro-primary-href"),
  introSecondaryLabel: document.getElementById("intro-secondary-label"),
  introSecondaryHref: document.getElementById("intro-secondary-href"),
  introRecruiterBody: document.getElementById("intro-recruiter-body"),
  introBgType: document.getElementById("intro-bg-type"),
  introBgUrl: document.getElementById("intro-bg-url"),
  aboutTitle: document.getElementById("about-title"),
  aboutLede: document.getElementById("about-lede"),
  aboutWorkingTitle: document.getElementById("about-working-title"),
  aboutParagraphs: document.getElementById("about-paragraphs"),
  aboutNotes: document.getElementById("about-notes"),
  aboutQuote: document.getElementById("about-quote"),
  aboutQuoteBody: document.getElementById("about-quote-body"),
  aboutBgType: document.getElementById("about-bg-type"),
  aboutBgUrl: document.getElementById("about-bg-url"),
  interestsTitle: document.getElementById("interests-title"),
  interestsLede: document.getElementById("interests-lede"),
  interestsFavorites: document.getElementById("interests-favorites"),
  interestsOutside: document.getElementById("interests-outside"),
  interestsBgType: document.getElementById("interests-bg-type"),
  interestsBgUrl: document.getElementById("interests-bg-url"),
  projectsTitle: document.getElementById("projects-title"),
  projectsLede: document.getElementById("projects-lede"),
  projectsBgType: document.getElementById("projects-bg-type"),
  projectsBgUrl: document.getElementById("projects-bg-url"),
  contactTitle: document.getElementById("contact-title"),
  contactLede: document.getElementById("contact-lede"),
  contactReachTitle: document.getElementById("contact-reach-title"),
  contactReachBody: document.getElementById("contact-reach-body"),
  contactPrimaryLabel: document.getElementById("contact-primary-label"),
  contactPrimaryHref: document.getElementById("contact-primary-href"),
  contactSecondaryLabel: document.getElementById("contact-secondary-label"),
  contactSecondaryHref: document.getElementById("contact-secondary-href"),
  contactBgType: document.getElementById("contact-bg-type"),
  contactBgUrl: document.getElementById("contact-bg-url")
};

async function loadContent() {
  statusLabel.textContent = "Loading content...";
  const data = await loadAdminContent();
  currentContent = data;
  populateForm(data);
  syncPreview();
  await loadMediaLibrary();
  statusLabel.textContent = isHostedVercel()
    ? "Editor ready."
    : "Content loaded.";
}

async function loadAdminContent() {
  const apiResponse = await fetchJson("/api/content");
  if (apiResponse) {
    return apiResponse;
  }

  const staticResponse = await fetchJson("/content/site-content.json");
  if (staticResponse) {
    return staticResponse;
  }

  throw new Error("Content unavailable.");
}

function populateForm(content) {
  const { site, pages } = content;

  inputs.siteName.value = site.name || "";
  inputs.siteBrand.value = site.brand || "";
  inputs.siteRole.value = site.role || "";
  inputs.siteLocation.value = site.location || "";
  inputs.siteEmail.value = site.email || "";
  inputs.siteAvailability.value = site.availability || "";
  inputs.siteLinkedin.value = site.linkedin || "";
  inputs.siteGithub.value = site.github || "";
  inputs.siteResume.value = site.resumeUrl || "";

  inputs.introEyebrow.value = pages.intro.eyebrow || "";
  inputs.introOverviewTitle.value = pages.intro.overviewTitle || "";
  inputs.introTitle.value = pages.intro.title || "";
  inputs.introTitleAccent.value = pages.intro.titleAccent || "";
  inputs.introLede.value = pages.intro.lede || "";
  inputs.introPrimaryLabel.value = pages.intro.primaryCtaLabel || "";
  inputs.introPrimaryHref.value = pages.intro.primaryCtaHref || "";
  inputs.introSecondaryLabel.value = pages.intro.secondaryCtaLabel || "";
  inputs.introSecondaryHref.value = pages.intro.secondaryCtaHref || "";
  inputs.introRecruiterBody.value = pages.intro.recruiterBody || "";
  inputs.introBgType.value = pages.intro.background?.type || "none";
  inputs.introBgUrl.value = pages.intro.background?.url || "";

  inputs.aboutTitle.value = pages.about.title || "";
  inputs.aboutLede.value = pages.about.lede || "";
  inputs.aboutWorkingTitle.value = pages.about.workingStyleTitle || "";
  inputs.aboutParagraphs.value = (pages.about.workingStyleParagraphs || []).join("\n\n");
  inputs.aboutNotes.value = (pages.about.recruiterNotes || []).join("\n");
  inputs.aboutQuote.value = pages.about.quote || "";
  inputs.aboutQuoteBody.value = pages.about.quoteBody || "";
  inputs.aboutBgType.value = pages.about.background?.type || "none";
  inputs.aboutBgUrl.value = pages.about.background?.url || "";

  inputs.interestsTitle.value = pages.interests.title || "";
  inputs.interestsLede.value = pages.interests.lede || "";
  inputs.interestsFavorites.value = (pages.interests.favorites || []).join("\n");
  inputs.interestsOutside.value = (pages.interests.outsideParagraphs || []).join("\n\n");
  inputs.interestsBgType.value = pages.interests.background?.type || "none";
  inputs.interestsBgUrl.value = pages.interests.background?.url || "";

  inputs.projectsTitle.value = pages.projects.title || "";
  inputs.projectsLede.value = pages.projects.lede || "";
  inputs.projectsBgType.value = pages.projects.background?.type || "none";
  inputs.projectsBgUrl.value = pages.projects.background?.url || "";

  inputs.contactTitle.value = pages.contact.title || "";
  inputs.contactLede.value = pages.contact.lede || "";
  inputs.contactReachTitle.value = pages.contact.reachOutTitle || "";
  inputs.contactReachBody.value = pages.contact.reachOutBody || "";
  inputs.contactPrimaryLabel.value = pages.contact.primaryButtonLabel || "";
  inputs.contactPrimaryHref.value = pages.contact.primaryButtonHref || "";
  inputs.contactSecondaryLabel.value = pages.contact.secondaryButtonLabel || "";
  inputs.contactSecondaryHref.value = pages.contact.secondaryButtonHref || "";
  inputs.contactBgType.value = pages.contact.background?.type || "none";
  inputs.contactBgUrl.value = pages.contact.background?.url || "";

  renderInterestCards(pages.interests.cards || []);
  renderProjects(pages.projects.items || []);
  registerMediaTargetListeners(document);
}

function renderInterestCards(cards) {
  interestCardsRoot.innerHTML = "";
  cards.forEach((card) => interestCardsRoot.appendChild(buildInterestCard(card)));
}

function buildInterestCard(card = {}) {
  const wrapper = document.createElement("article");
  wrapper.className = "stack-card";
  wrapper.innerHTML = `
    <div class="stack-card__header">
      <strong>Interest Card</strong>
      <button class="stack-remove" type="button">Remove</button>
    </div>
    <div class="field-grid">
      <label class="field">
        <span>Eyebrow</span>
        <input data-field="eyebrow" type="text" value="${escapeAttribute(card.eyebrow || "")}" />
      </label>
      <label class="field">
        <span>Title</span>
        <input data-field="title" type="text" value="${escapeAttribute(card.title || "")}" />
      </label>
      <label class="field field-full">
        <span>Description</span>
        <textarea data-field="description">${escapeHtml(card.description || "")}</textarea>
      </label>
    </div>
  `;
  wrapper.querySelector(".stack-remove").addEventListener("click", () => {
    wrapper.remove();
    syncPreview();
  });
  bindCardInputs(wrapper);
  return wrapper;
}

function renderProjects(projects) {
  projectsRoot.innerHTML = "";
  projects.forEach((project) => projectsRoot.appendChild(buildProjectCard(project)));
  registerMediaTargetListeners(projectsRoot);
}

function buildProjectCard(project = {}) {
  const mediaItemsText = formatMediaItems(project);
  const wrapper = document.createElement("article");
  wrapper.className = "stack-card";
  wrapper.innerHTML = `
    <div class="stack-card__header">
      <strong>Project</strong>
      <button class="stack-remove" type="button">Remove</button>
    </div>
    <div class="field-grid field-grid-2">
      <label class="field">
        <span>Eyebrow</span>
        <input data-field="eyebrow" type="text" value="${escapeAttribute(project.eyebrow || "")}" />
      </label>
      <label class="field">
        <span>Title</span>
        <input data-field="title" type="text" value="${escapeAttribute(project.title || "")}" />
      </label>
      <label class="field field-full">
        <span>Description</span>
        <textarea data-field="description">${escapeHtml(project.description || "")}</textarea>
      </label>
      <label class="field">
        <span>Role</span>
        <input data-field="role" type="text" value="${escapeAttribute(project.role || "")}" />
      </label>
      <label class="field">
        <span>Media Type</span>
        <select data-field="mediaType">
          <option value="none"${project.mediaType === "none" ? " selected" : ""}>None</option>
          <option value="image"${project.mediaType === "image" ? " selected" : ""}>Image</option>
          <option value="video"${project.mediaType === "video" ? " selected" : ""}>Video</option>
        </select>
      </label>
      <label class="field">
        <span>Media URL</span>
        <input data-field="mediaUrl" data-media-target="project media" type="text" value="${escapeAttribute(project.mediaUrl || "")}" />
      </label>
      <label class="field">
        <span>Media Poster</span>
        <input data-field="mediaPoster" data-media-target="project poster" type="text" value="${escapeAttribute(project.mediaPoster || "")}" />
      </label>
      <label class="field field-full">
        <span>Media Gallery</span>
        <textarea data-field="mediaItems" data-media-target="project gallery" placeholder="One media URL per line. Types are detected automatically, or use type|url|poster for manual control.">${escapeHtml(mediaItemsText)}</textarea>
      </label>
      <label class="field field-full">
        <span>Bullets</span>
        <textarea data-field="bullets" placeholder="One bullet per line">${escapeHtml((project.bullets || []).join("\n"))}</textarea>
      </label>
      <label class="field field-full">
        <span>Tech Stack</span>
        <textarea data-field="tech" placeholder="One tech item per line">${escapeHtml((project.tech || []).join("\n"))}</textarea>
      </label>
    </div>
  `;
  wrapper.querySelector(".stack-remove").addEventListener("click", () => {
    wrapper.remove();
    syncPreview();
  });
  bindCardInputs(wrapper);
  return wrapper;
}

function bindCardInputs(root) {
  root.querySelectorAll("input, textarea, select").forEach((element) => {
    element.addEventListener("input", syncPreview);
    element.addEventListener("change", syncPreview);
  });
}

function collectContent() {
  return {
    site: {
      name: inputs.siteName.value.trim(),
      brand: inputs.siteBrand.value.trim(),
      role: inputs.siteRole.value.trim(),
      email: inputs.siteEmail.value.trim(),
      linkedin: inputs.siteLinkedin.value.trim(),
      github: inputs.siteGithub.value.trim(),
      resumeUrl: inputs.siteResume.value.trim(),
      availability: inputs.siteAvailability.value.trim(),
      location: inputs.siteLocation.value.trim()
    },
    pages: {
      intro: {
        eyebrow: inputs.introEyebrow.value.trim(),
        title: inputs.introTitle.value.trim(),
        titleAccent: inputs.introTitleAccent.value.trim(),
        lede: inputs.introLede.value.trim(),
        primaryCtaLabel: inputs.introPrimaryLabel.value.trim(),
        primaryCtaHref: inputs.introPrimaryHref.value.trim(),
        secondaryCtaLabel: inputs.introSecondaryLabel.value.trim(),
        secondaryCtaHref: inputs.introSecondaryHref.value.trim(),
        overviewTitle: inputs.introOverviewTitle.value.trim(),
        overviewItems: currentContent?.pages?.intro?.overviewItems || [],
        recruiterTitle: currentContent?.pages?.intro?.recruiterTitle || "Fast Recruiter Read",
        recruiterHeading: currentContent?.pages?.intro?.recruiterHeading || "",
        recruiterBody: inputs.introRecruiterBody.value.trim(),
        metrics: currentContent?.pages?.intro?.metrics || [],
        background: {
          type: inputs.introBgType.value,
          url: inputs.introBgUrl.value.trim(),
          poster: currentContent?.pages?.intro?.background?.poster || ""
        }
      },
      about: {
        eyebrow: currentContent?.pages?.about?.eyebrow || "About Me",
        title: inputs.aboutTitle.value.trim(),
        lede: inputs.aboutLede.value.trim(),
        workingStyleTitle: inputs.aboutWorkingTitle.value.trim(),
        workingStyleParagraphs: splitParagraphs(inputs.aboutParagraphs.value),
        recruiterNotes: splitLines(inputs.aboutNotes.value),
        education: currentContent?.pages?.about?.education || [],
        quote: inputs.aboutQuote.value.trim(),
        quoteBody: inputs.aboutQuoteBody.value.trim(),
        background: {
          type: inputs.aboutBgType.value,
          url: inputs.aboutBgUrl.value.trim(),
          poster: currentContent?.pages?.about?.background?.poster || ""
        }
      },
      interests: {
        eyebrow: currentContent?.pages?.interests?.eyebrow || "Interests",
        title: inputs.interestsTitle.value.trim(),
        lede: inputs.interestsLede.value.trim(),
        cards: collectInterestCards(),
        favorites: splitLines(inputs.interestsFavorites.value),
        outsideParagraphs: splitParagraphs(inputs.interestsOutside.value),
        background: {
          type: inputs.interestsBgType.value,
          url: inputs.interestsBgUrl.value.trim(),
          poster: currentContent?.pages?.interests?.background?.poster || ""
        }
      },
      projects: {
        eyebrow: currentContent?.pages?.projects?.eyebrow || "Projects",
        title: inputs.projectsTitle.value.trim(),
        lede: inputs.projectsLede.value.trim(),
        items: collectProjects(),
        background: {
          type: inputs.projectsBgType.value,
          url: inputs.projectsBgUrl.value.trim(),
          poster: currentContent?.pages?.projects?.background?.poster || ""
        }
      },
      contact: {
        eyebrow: currentContent?.pages?.contact?.eyebrow || "Contact",
        title: inputs.contactTitle.value.trim(),
        lede: inputs.contactLede.value.trim(),
        reachOutTitle: inputs.contactReachTitle.value.trim(),
        reachOutBody: inputs.contactReachBody.value.trim(),
        primaryButtonLabel: inputs.contactPrimaryLabel.value.trim(),
        primaryButtonHref: inputs.contactPrimaryHref.value.trim(),
        secondaryButtonLabel: inputs.contactSecondaryLabel.value.trim(),
        secondaryButtonHref: inputs.contactSecondaryHref.value.trim(),
        background: {
          type: inputs.contactBgType.value,
          url: inputs.contactBgUrl.value.trim(),
          poster: currentContent?.pages?.contact?.background?.poster || ""
        }
      }
    }
  };
}

function collectInterestCards() {
  return Array.from(interestCardsRoot.querySelectorAll(".stack-card")).map((card) => ({
    eyebrow: card.querySelector('[data-field="eyebrow"]').value.trim(),
    title: card.querySelector('[data-field="title"]').value.trim(),
    description: card.querySelector('[data-field="description"]').value.trim()
  }));
}

function collectProjects() {
  return Array.from(projectsRoot.querySelectorAll(".stack-card")).map((card) => ({
    eyebrow: card.querySelector('[data-field="eyebrow"]').value.trim(),
    title: card.querySelector('[data-field="title"]').value.trim(),
    description: card.querySelector('[data-field="description"]').value.trim(),
    bullets: splitLines(card.querySelector('[data-field="bullets"]').value),
    role: card.querySelector('[data-field="role"]').value.trim(),
    tech: splitLines(card.querySelector('[data-field="tech"]').value),
    mediaType: card.querySelector('[data-field="mediaType"]').value,
    mediaUrl: card.querySelector('[data-field="mediaUrl"]').value.trim(),
    mediaPoster: card.querySelector('[data-field="mediaPoster"]').value.trim(),
    mediaItems: parseMediaItems(card.querySelector('[data-field="mediaItems"]').value)
  }));
}

function parseMediaItems(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (!line.includes("|")) {
        return {
          type: inferMediaType(line),
          url: line,
          poster: ""
        };
      }

      const [type = "", url = "", poster = ""] = line.split("|").map((item) => item.trim());
      return {
        type: type || inferMediaType(url),
        url,
        poster
      };
    })
    .filter((item) => item.url);
}

function formatMediaItems(project) {
  if (Array.isArray(project.mediaItems) && project.mediaItems.length) {
    return project.mediaItems
      .map((item) => {
        const type = item.type || inferMediaType(item.url || "");
        const poster = item.poster || "";
        return [type, item.url || "", poster].join("|").replace(/\|$/, "");
      })
      .join("\n");
  }

  if (project.mediaUrl) {
    const type = project.mediaType || inferMediaType(project.mediaUrl);
    return [type, project.mediaUrl, project.mediaPoster || ""].join("|").replace(/\|$/, "");
  }

  return "";
}

function inferMediaType(url) {
  const normalized = String(url || "").trim().toLowerCase();
  if (!normalized) {
    return "image";
  }

  if (
    normalized.includes("youtube.com") ||
    normalized.includes("youtu.be") ||
    normalized.includes("vimeo.com") ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(normalized)
  ) {
    return "video";
  }

  return "image";
}

async function loadMediaLibrary() {
  if (!mediaLibrary) {
    return;
  }

  mediaLibrary.innerHTML = "";
  mediaStatus.textContent = "Loading uploaded media...";

  try {
    const response = await fetch("/api/media", {
      headers: {
        Accept: "application/json"
      }
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || "Library unavailable.");
    }

    mediaItems = Array.isArray(result.items) ? result.items : [];
    renderMediaLibrary();
    mediaStatus.textContent = mediaItems.length
      ? "Media library ready."
      : "No uploaded media yet.";
  } catch (error) {
    mediaLibrary.innerHTML = "";
    mediaStatus.textContent = error.message || "Library unavailable.";
  }
}

function renderMediaLibrary() {
  if (!mediaLibrary) {
    return;
  }

  if (!mediaItems.length) {
    mediaLibrary.innerHTML = `<p class="media-library-empty">No media uploaded yet.</p>`;
    return;
  }

  mediaLibrary.innerHTML = mediaItems
    .map(
      (item) => `
        <article class="media-card" data-media-url="${escapeAttribute(item.url)}">
          <div class="media-card__preview">
            ${renderMediaPreview(item)}
          </div>
          <div class="media-card__meta">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.kind)}</span>
          </div>
          <button class="button button-ghost media-card__action" type="button" data-media-pick="${escapeAttribute(item.url)}">Use This</button>
        </article>
      `
    )
    .join("");

  mediaLibrary.querySelectorAll("[data-media-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      const url = button.getAttribute("data-media-pick") || "";
      applyMediaToTarget(url);
    });
  });
}

function renderMediaPreview(item) {
  if (item.kind === "video") {
    return `
      <video class="media-card__asset" muted playsinline preload="metadata">
        <source src="${escapeHtml(item.url)}" />
      </video>
    `;
  }

  return `<img class="media-card__asset" src="${escapeHtml(item.url)}" alt="${escapeHtml(item.name)}" loading="lazy" />`;
}

function applyMediaToTarget(url) {
  if (!activeMediaTarget) {
    mediaStatus.textContent = "Choose a target field first.";
    return;
  }

  if (activeMediaTarget.tagName === "TEXTAREA" && activeMediaTarget.dataset.field === "mediaItems") {
    activeMediaTarget.value = appendMediaLine(activeMediaTarget.value, url);
  } else {
    activeMediaTarget.value = url;
  }

  activeMediaTarget.dispatchEvent(new Event("input", { bubbles: true }));
  activeMediaTarget.dispatchEvent(new Event("change", { bubbles: true }));
  activeMediaTarget.focus();
  mediaStatus.textContent = "Asset inserted into the selected field.";
}

function appendMediaLine(currentValue, url) {
  const value = String(currentValue || "").trim();
  if (!value) {
    return url;
  }

  const existingLines = value.split("\n").map((line) => line.trim());
  if (existingLines.includes(url)) {
    return value;
  }

  return `${value}\n${url}`;
}

function registerMediaTargetListeners(root = document) {
  root.querySelectorAll("[data-media-target]").forEach((element) => {
    if (element.dataset.mediaTargetBound === "true") {
      return;
    }

    const activateTarget = () => setActiveMediaTarget(element);
    element.addEventListener("focus", activateTarget);
    element.addEventListener("click", activateTarget);
    element.dataset.mediaTargetBound = "true";
  });
}

function setActiveMediaTarget(element) {
  activeMediaTarget = element;
  const label = element.dataset.mediaTarget || "selected field";
  mediaTargetLabel.textContent = `Target: ${label}`;
  mediaStatus.textContent = "Pick any asset below to place it here.";
}

function syncPreview() {
  const payload = collectContent();
  editor.value = JSON.stringify(payload, null, 2);
}

async function saveContent() {
  try {
    const payload = collectContent();
    statusLabel.textContent = "Saving...";

    const response = await fetch("/api/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Save failed.");
    }

    currentContent = payload;
    syncPreview();
    statusLabel.textContent = "Saved.";
  } catch (error) {
    statusLabel.textContent = error.message || "Save failed.";
  }
}

async function uploadMedia() {
  if (!fileInput.files.length) {
    uploadResult.value = "Select a file first.";
    return;
  }

  const files = Array.from(fileInput.files);
  uploadResult.value = `Uploading ${files.length} file${files.length === 1 ? "" : "s"}...`;

  const uploadedPaths = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      uploadResult.value = result.error || `Upload failed for ${file.name}.`;
      return;
    }

    uploadedPaths.push(result.path);
  }

  uploadResult.value = uploadedPaths.join("\n");
  fileInput.value = "";
  await loadMediaLibrary();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Request unavailable.");
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Content unavailable.");
  }

  return response.json();
}

function isHostedVercel() {
  return window.location.hostname.endsWith(".vercel.app") || window.location.hostname === "petermwaura.com" || window.location.hostname === "www.petermwaura.com";
}

function splitLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitParagraphs(value) {
  return value
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

document.querySelectorAll("input, textarea, select").forEach((element) => {
  element.addEventListener("input", syncPreview);
  element.addEventListener("change", syncPreview);
});

document.getElementById("save-content").addEventListener("click", saveContent);
document.getElementById("reload-content").addEventListener("click", loadContent);
document.getElementById("upload-media").addEventListener("click", uploadMedia);
document.getElementById("refresh-media-library").addEventListener("click", loadMediaLibrary);
document.getElementById("logout-admin").addEventListener("click", async () => {
  try {
    await fetch("/api/admin-logout", {
      method: "POST"
    });
  } finally {
    window.location.href = "/admin-login.html";
  }
});

document.getElementById("add-interest-card").addEventListener("click", () => {
  interestCardsRoot.appendChild(buildInterestCard());
  syncPreview();
});

document.getElementById("add-project").addEventListener("click", () => {
  const card = buildProjectCard();
  projectsRoot.appendChild(card);
  registerMediaTargetListeners(card);
  syncPreview();
});

loadContent().catch((error) => {
  statusLabel.textContent = error.message || "Editor unavailable right now.";
});
