const currentPage = document.body.dataset.page;
const activeNav = document.querySelector(`[data-nav="${currentPage}"]`);
const pageRoot = document.getElementById("page-content");
const backgroundRoot = document.getElementById("page-media-bg");
const brandLink = document.getElementById("brand-link");

if (activeNav) {
  activeNav.classList.add("is-active");
}

loadSiteContent()
  .then((content) => {
    if (brandLink && content.site?.brand) {
      brandLink.textContent = content.site.brand;
    }

    renderPage(content);
    wirePageTransitions();
    setupReveal();
  })
  .catch((error) => {
    if (pageRoot) {
      pageRoot.innerHTML = `<section class="panel"><p>Content is temporarily unavailable.</p></section>`;
    }
  });

async function loadSiteContent() {
  const apiResponse = await fetchJson("/api/content");
  if (apiResponse) {
    return apiResponse;
  }

  const staticResponse = await fetchJson("/content/site-content.json");
  if (staticResponse) {
    return staticResponse;
  }

  throw new Error("No content source was available.");
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

function renderPage(content) {
  if (!pageRoot) {
    return;
  }

  const page = content.pages?.[currentPage];
  if (!page) {
    pageRoot.innerHTML = `<section class="panel"><p>This page is temporarily unavailable.</p></section>`;
    return;
  }

  applyBackground(page.background);

  switch (currentPage) {
    case "intro":
      pageRoot.innerHTML = renderIntro(content.site, page);
      break;
    case "about":
      pageRoot.innerHTML = renderAbout(page);
      break;
    case "interests":
      pageRoot.innerHTML = renderInterests(page);
      break;
    case "projects":
      pageRoot.innerHTML = renderProjects(page);
      break;
    case "contact":
      pageRoot.innerHTML = renderContact(content.site, page);
      break;
    default:
      pageRoot.innerHTML = `<section class="panel"><p>This page is temporarily unavailable.</p></section>`;
  }
}

function renderIntro(site, page) {
  return `
    <section class="hero hero-home">
      <div class="hero-grid hero-grid-wide">
        <section class="panel panel-hero" data-reveal>
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.title)}<span>${escapeHtml(page.titleAccent)}</span></h1>
          <p class="lede">${escapeHtml(page.lede)}</p>
          <div class="hero-actions">
            <a class="button button-primary" href="${escapeHtml(page.primaryCtaHref)}">${escapeHtml(page.primaryCtaLabel)}</a>
            <a class="button button-ghost" href="${escapeHtml(page.secondaryCtaHref)}">${escapeHtml(page.secondaryCtaLabel)}</a>
            ${site.resumeUrl ? `<a class="button button-ghost" href="${escapeHtml(site.resumeUrl)}" target="_blank" rel="noreferrer">Resume</a>` : ""}
          </div>
        </section>
        <aside class="panel panel-accent" data-reveal>
          <p class="card-label">${escapeHtml(page.overviewTitle)}</p>
          <div class="signal-grid">
            ${page.overviewItems.map((item) => `
              <article>
                <span>${escapeHtml(item.label)}</span>
                <strong>${escapeHtml(item.value)}</strong>
              </article>
            `).join("")}
          </div>
        </aside>
      </div>
    </section>
    <section class="section section-split">
      <article class="panel" data-reveal>
        <p class="eyebrow">${escapeHtml(page.recruiterTitle)}</p>
        <h2>${escapeHtml(page.recruiterHeading)}</h2>
        <p>${escapeHtml(page.recruiterBody)}</p>
      </article>
      <article class="panel metrics-panel" data-reveal>
        ${page.metrics.map((metric) => `
          <div class="metric">
            <strong>${escapeHtml(metric.value)}</strong>
            <span>${escapeHtml(metric.label)}</span>
          </div>
        `).join("")}
      </article>
    </section>
    <section class="section preview-grid">
      <a class="panel preview-card" data-reveal href="/about.html">
        <p class="eyebrow">About Me</p>
        <h3>How I think, work, and collaborate.</h3>
        <p>Background, values, and the kind of teammate I aim to be.</p>
      </a>
      <a class="panel preview-card" data-reveal href="/interests.html">
        <p class="eyebrow">Interests</p>
        <h3>The ideas I keep coming back to.</h3>
        <p>Technical themes, problem spaces, and engineering obsessions.</p>
      </a>
      <a class="panel preview-card" data-reveal href="/projects.html">
        <p class="eyebrow">Projects</p>
        <h3>Proof of execution across backend and product thinking.</h3>
        <p>Project case studies with space for video showcases and media.</p>
      </a>
    </section>
  `;
}

function renderAbout(page) {
  return `
    <section class="hero">
      <div class="page-intro" data-reveal>
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="lede">${escapeHtml(page.lede)}</p>
      </div>
    </section>
    <section class="section section-split">
      <article class="panel" data-reveal>
        <p class="eyebrow">Working Style</p>
        <h2>${escapeHtml(page.workingStyleTitle)}</h2>
        ${page.workingStyleParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </article>
      <article class="panel panel-spotlight" data-reveal>
        <p class="eyebrow">What Recruiters Notice</p>
        <ul class="pill-list">
          ${page.recruiterNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
        </ul>
      </article>
    </section>
    <section class="section grid-two">
      <article class="panel" data-reveal>
        <p class="eyebrow">Education Arc</p>
        <div class="timeline">
          ${page.education.map((item) => `
            <div class="timeline-item">
              <span class="meta">${escapeHtml(item.year)}</span>
              <div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </article>
      <article class="panel" data-reveal>
        <p class="eyebrow">Personal Thesis</p>
        <p class="quote">${escapeHtml(page.quote)}</p>
        <p>${escapeHtml(page.quoteBody)}</p>
      </article>
    </section>
  `;
}

function renderInterests(page) {
  return `
    <section class="hero">
      <div class="page-intro" data-reveal>
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="lede">${escapeHtml(page.lede)}</p>
      </div>
    </section>
    <section class="section grid-three">
      ${page.cards.map((card, index) => `
        <article class="panel interest-card ${index === 0 ? "panel-accent" : ""}" data-reveal>
          <p class="eyebrow">${escapeHtml(card.eyebrow)}</p>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.description)}</p>
        </article>
      `).join("")}
    </section>
    <section class="section grid-two">
      <article class="panel" data-reveal>
        <p class="eyebrow">Favorite Problem Types</p>
        <ul class="pill-list">
          ${page.favorites.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>
      <article class="panel" data-reveal>
        <p class="eyebrow">Outside The Classroom</p>
        ${page.outsideParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </article>
    </section>
  `;
}

function renderProjects(page) {
  return `
    <section class="hero">
      <div class="page-intro" data-reveal>
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="lede">${escapeHtml(page.lede)}</p>
      </div>
    </section>
    <section class="section project-list">
      ${page.items.map((project) => `
        <article class="panel project-card ${project.mediaUrl ? "project-card--media" : ""}" data-reveal>
          ${renderProjectMedia(project)}
          <div class="project-content">
            <p class="eyebrow">${escapeHtml(project.eyebrow)}</p>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.description)}</p>
            <ul class="list-clean">
              ${project.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
            </ul>
          </div>
          <aside class="project-sidebar">
            <div class="mini-card">
              <span class="meta">Role</span>
              <strong>${escapeHtml(project.role)}</strong>
            </div>
            <div class="project-tags">
              ${project.tech.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
            </div>
          </aside>
        </article>
      `).join("")}
    </section>
  `;
}

function renderContact(site, page) {
  return `
    <section class="hero">
      <div class="page-intro" data-reveal>
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="lede">${escapeHtml(page.lede)}</p>
      </div>
    </section>
    <section class="section contact-layout">
      <article class="panel panel-accent" data-reveal>
        <p class="eyebrow">Reach Out</p>
        <h2>${escapeHtml(page.reachOutTitle)}</h2>
        <p>${escapeHtml(page.reachOutBody)}</p>
        <div class="button-row">
          <a class="button button-primary" href="${escapeHtml(page.primaryButtonHref)}">${escapeHtml(page.primaryButtonLabel)}</a>
          <a class="button button-ghost" href="${escapeHtml(page.secondaryButtonHref)}">${escapeHtml(page.secondaryButtonLabel)}</a>
          ${site.resumeUrl ? `<a class="button button-ghost" href="${escapeHtml(site.resumeUrl)}" target="_blank" rel="noreferrer">Resume</a>` : ""}
        </div>
      </article>
      <article class="panel" data-reveal>
        <p class="eyebrow">Contact Information</p>
        <div class="contact-links">
          <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>
          <a href="${escapeHtml(site.linkedin)}" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="${escapeHtml(site.github)}" target="_blank" rel="noreferrer">GitHub</a>
          <span class="meta">${escapeHtml(site.availability)}</span>
        </div>
      </article>
    </section>
  `;
}

function renderProjectMedia(project) {
  if (!project.mediaUrl || project.mediaType === "none") {
    return "";
  }

  const media = resolveMedia(project.mediaUrl, project.mediaType, project.mediaPoster);

  if (media.kind === "youtube-preview") {
    return `
      <div class="media-ambient">
        <img class="media-asset" src="${escapeHtml(media.poster)}" alt="${escapeHtml(project.title)} preview" />
        <div class="media-ambient__overlay"></div>
        <a class="media-watch-link" href="${escapeHtml(media.watchUrl)}" target="_blank" rel="noreferrer">Watch video</a>
      </div>
    `;
  }

  if (media.kind === "embed") {
    return `
      <div class="media-ambient">
        <iframe
          class="media-asset media-embed"
          src="${escapeHtml(media.url)}"
          title="${escapeHtml(project.title)} showcase"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <div class="media-ambient__overlay"></div>
      </div>
    `;
  }

  if (media.kind === "video") {
    return `
      <div class="media-ambient">
        <video class="media-asset" autoplay muted loop playsinline controls poster="${escapeHtml(media.poster || "")}">
          <source src="${escapeHtml(media.url)}" />
        </video>
        <div class="media-ambient__overlay"></div>
      </div>
    `;
  }

  return `
    <div class="media-ambient">
      <img class="media-asset" src="${escapeHtml(media.url)}" alt="${escapeHtml(project.title)} showcase" />
      <div class="media-ambient__overlay"></div>
    </div>
  `;
}

function resolveMedia(url, type, poster) {
  const normalized = String(url || "").trim();
  const youtubeId = extractYouTubeId(normalized);
  if (youtubeId) {
    return {
      kind: "youtube-preview",
      poster: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      watchUrl: normalized
    };
  }

  const vimeoMatch = normalized.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      kind: "embed",
      url: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    };
  }

  if (type === "video" || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(normalized)) {
    return {
      kind: "video",
      url: normalized,
      poster
    };
  }

  return {
    kind: "image",
    url: normalized
  };
}

function extractYouTubeId(url) {
  const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (shortMatch) {
    return shortMatch[1];
  }

  const standardMatch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (standardMatch) {
    return standardMatch[1];
  }

  const embedMatch = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  if (embedMatch) {
    return embedMatch[1];
  }

  return "";
}

function applyBackground(background) {
  if (!backgroundRoot || !background || !background.url || background.type === "none") {
    return;
  }

  if (background.type === "video") {
    backgroundRoot.innerHTML = `
      <video class="page-media-bg__asset" autoplay muted loop playsinline poster="${escapeHtml(background.poster || "")}">
        <source src="${escapeHtml(background.url)}" />
      </video>
      <div class="page-media-bg__overlay"></div>
    `;
    return;
  }

  backgroundRoot.innerHTML = `
    <img class="page-media-bg__asset" src="${escapeHtml(background.url)}" alt="" />
    <div class="page-media-bg__overlay"></div>
  `;
}

function setupReveal() {
  const revealElements = document.querySelectorAll("[data-reveal]");
  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function wirePageTransitions() {
  const links = document.querySelectorAll('a[href$=".html"]');
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const target = link.getAttribute("target");

      if (!href || target === "_blank" || event.metaKey || event.ctrlKey) {
        return;
      }

      event.preventDefault();
      document.body.classList.add("is-transitioning");
      window.setTimeout(() => {
        window.location.href = href;
      }, 420);
    });
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
