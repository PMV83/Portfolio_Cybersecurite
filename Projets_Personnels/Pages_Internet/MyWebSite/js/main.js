'use strict';

const GITHUB_USER   = 'PMV83';
const GITHUB_REPO   = 'Portfolio_Cybersecurite';
const GITHUB_API    = 'https://api.github.com';
const COMMITS_COUNT = 5;

function setText(el, text) {
  if (el) el.textContent = text;
}

function escapeHTML(str) {
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);
  if (minutes < 2)  return 'à l\'instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24)   return `il y a ${hours}h`;
  if (days < 30)    return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.querySelector('.nav-toggle');
  const drawer  = document.getElementById('navDrawer');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.classList.toggle('active');
      drawer.classList.toggle('open', expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !drawer.contains(e.target)) {
        toggle.classList.remove('active');
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const lines = [
    'mastère_cybersécurité@esgi-aix:~$',
    'whoami: aurelien.logeais',
    'certifications: [Security+, CSNA-in-progress]',
    'status: AVAILABLE — CDI Sept. 2026',
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const TYPING_SPEED   = 55;
  const DELETING_SPEED = 25;
  const PAUSE          = 2200;

  function type() {
    const current = lines[lineIndex];
    if (!isDeleting) {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(type, PAUSE);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
      }
    }
    setTimeout(type, isDeleting ? DELETING_SPEED : TYPING_SPEED);
  }

  setTimeout(type, 600);
}

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach(el => observer.observe(el));
}

async function safeFetch(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function renderRepoCard(repo) {
  const card = document.getElementById('repoCard');
  if (!card) return;

  card.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'repo-info';

  const icon = document.createElement('div');
  icon.className = 'repo-icon';
  icon.innerHTML = '<i class="fa-brands fa-github" aria-hidden="true"></i>';

  const textBlock = document.createElement('div');
  textBlock.style.flex = '1';

  const nameEl = document.createElement('div');
  nameEl.className = 'repo-name';
  const nameLink = document.createElement('a');
  nameLink.href = repo.html_url;
  nameLink.target = '_blank';
  nameLink.rel = 'noopener';
  nameLink.textContent = repo.full_name;
  nameEl.appendChild(nameLink);

  const descEl = document.createElement('div');
  descEl.className = 'repo-desc';
  descEl.textContent = repo.description || 'Aucune description disponible.';

  textBlock.appendChild(nameEl);
  textBlock.appendChild(descEl);

  const meta = document.createElement('div');
  meta.className = 'repo-meta';

  const metaItems = [
    { icon: 'fa-star',         text: repo.stargazers_count   ?? 0,  label: 'Stars' },
    { icon: 'fa-code-fork',    text: repo.forks_count        ?? 0,  label: 'Forks' },
    { icon: 'fa-code',         text: repo.language           || '—', label: 'Langage' },
    { icon: 'fa-clock',        text: relativeTime(repo.pushed_at),   label: 'Dernier push' },
  ];

  metaItems.forEach(item => {
    const span = document.createElement('span');
    const i = document.createElement('i');
    i.className = `fa-solid ${item.icon}`;
    i.setAttribute('aria-hidden', 'true');
    span.appendChild(i);
    span.appendChild(document.createTextNode(' ' + item.text));
    span.setAttribute('title', item.label);
    meta.appendChild(span);
  });

  wrapper.appendChild(icon);
  wrapper.appendChild(textBlock);
  card.appendChild(wrapper);
  card.appendChild(meta);
}

function renderCommits(commits) {
  const container = document.getElementById('commitsList');
  if (!container) return;

  container.innerHTML = '';

  if (!commits.length) {
    const msg = document.createElement('p');
    msg.className = 'repo-error';
    msg.textContent = 'Aucun commit trouvé.';
    container.appendChild(msg);
    return;
  }

  commits.forEach((c, index) => {
    const commit = c.commit;
    const author = commit.author;

    const item = document.createElement('a');
    item.className = 'commit-item';
    item.href = c.html_url || '#';
    item.target = '_blank';
    item.rel = 'noopener';
    item.setAttribute('aria-label', `Commit: ${commit.message}`);

    // Icon
    const iconWrap = document.createElement('div');
    iconWrap.className = 'commit-icon';
    iconWrap.innerHTML = `<i class="fa-solid fa-code-commit" aria-hidden="true"></i>`;

    // Body
    const body = document.createElement('div');
    body.className = 'commit-body';

    const msgEl = document.createElement('div');
    msgEl.className = 'commit-msg';
    msgEl.textContent = (commit.message || 'No message').split('\n')[0];

    const metaEl = document.createElement('div');
    metaEl.className = 'commit-meta';
    const authorName = (author && author.name) ? author.name : 'Unknown';
    const dateStr    = (author && author.date) ? relativeTime(author.date) : '';
    metaEl.textContent = `${authorName} · ${dateStr}`;

    body.appendChild(msgEl);
    body.appendChild(metaEl);

    const files = Array.isArray(c.files) ? c.files : [];
    if (files.length > 0) {
      const folderMap = {};
      files.forEach(f => {
        const parts = (f.filename || '').split('/');
        // Use the parent folder of the file, or the filename itself if at root
        const folder = parts.length > 1
          ? parts.slice(0, -1).join('/') + '/'
          : f.filename;
        if (!folderMap[folder]) folderMap[folder] = { changes: 0, statuses: new Set() };
        folderMap[folder].changes += (f.additions || 0) + (f.deletions || 0);
        if (f.status) folderMap[folder].statuses.add(f.status); // added|modified|removed|renamed
      });

      const sorted = Object.entries(folderMap)
        .sort((a, b) => b[1].changes - a[1].changes);

      const STATUS_ICON = {
        added:    { icon: 'fa-plus',   cls: 'chip-added' },
        modified: { icon: 'fa-pen',    cls: 'chip-modified' },
        removed:  { icon: 'fa-minus',  cls: 'chip-removed' },
        renamed:  { icon: 'fa-right-left', cls: 'chip-renamed' },
      };

      const filesRow = document.createElement('div');
      filesRow.className = 'commit-files';

      sorted.forEach(([folder, info]) => {
        const isDir = folder.endsWith('/');
        const status = [...info.statuses][0] || 'modified';
        const si = STATUS_ICON[status] || STATUS_ICON.modified;

        const chip = document.createElement('span');
        chip.className = `commit-file-chip ${si.cls}`;
        chip.title = `${info.changes} ligne${info.changes > 1 ? 's' : ''} modifiée${info.changes > 1 ? 's' : ''} (${[...info.statuses].join(', ')})`;
        chip.innerHTML = `<i class="fa-solid ${isDir ? 'fa-folder' : 'fa-file-code'}"></i> <i class="fa-solid ${si.icon} chip-status-icon"></i> `;
        chip.appendChild(document.createTextNode(folder));

        if (info.changes > 0) {
          const count = document.createElement('span');
          count.className = 'chip-changes';
          count.textContent = `+${info.changes}`;
          chip.appendChild(count);
        }
        filesRow.appendChild(chip);
      });

      body.appendChild(filesRow);
    }

    item.appendChild(iconWrap);
    item.appendChild(body);

    item.style.opacity = '0';
    item.style.transform = 'translateY(8px)';
    item.style.transition = `opacity 0.4s ease ${index * 0.07}s, transform 0.4s ease ${index * 0.07}s`;

    container.appendChild(item);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        item.style.opacity  = '1';
        item.style.transform = 'translateY(0)';
      });
    });
  });
}

function showGitHubError(message) {
  const card     = document.getElementById('repoCard');
  const commits  = document.getElementById('commitsList');

  const errHTML = `<p class="repo-error"><i class="fa-solid fa-triangle-exclamation"></i> ${escapeHTML(message)}</p>`;

  if (card)    card.innerHTML    = errHTML;
  if (commits) commits.innerHTML = errHTML;
}

async function loadGitHub() {
  try {
    const [repoData, commitsData] = await Promise.all([
      safeFetch(`${GITHUB_API}/repos/${GITHUB_USER}/${GITHUB_REPO}`),
      safeFetch(`${GITHUB_API}/repos/${GITHUB_USER}/${GITHUB_REPO}/commits?per_page=${COMMITS_COUNT}`)
    ]);

    renderRepoCard(repoData);
    renderCommits(Array.isArray(commitsData) ? commitsData : []);

    if (Array.isArray(commitsData) && commitsData.length) {
      const enriched = await Promise.all(
        commitsData.map(c =>
          safeFetch(`${GITHUB_API}/repos/${GITHUB_USER}/${GITHUB_REPO}/commits/${c.sha}`)
            .catch(() => c)
        )
      );
      renderCommits(enriched);
    }

  } catch (err) {
    console.warn('[GitHub]', err.message);
    if (err.message.includes('404')) {
      showGitHubError('Dépôt introuvable ou privé. Vérifie que PMV83/Portfolio_Cybersecurite est bien public.');
    } else if (err.name === 'AbortError') {
      showGitHubError('Timeout — GitHub API ne répond pas.');
    } else if (err.message.includes('403')) {
      showGitHubError('Limite de l\'API GitHub atteinte (60 req/h). Réessaie dans quelques minutes.');
    } else {
      showGitHubError('Impossible de charger les données GitHub. Vérifie ta connexion.');
    }
  }
}

const LI_POSTS_RECENT = 3;

const CATEGORY_STYLE = {
  'Certification':       { cls: 'badge-cat-certification',  icon: 'fa-certificate'    },
  'Detection Splunk':    { cls: 'badge-cat-detection',      icon: 'fa-eye'            },
  'Prevention Réseau':   { cls: 'badge-cat-prevention',     icon: 'fa-shield-halved'  },
  'Architecture Réseau': { cls: 'badge-cat-architecture',   icon: 'fa-network-wired'  },
  'Automatisation':      { cls: 'badge-cat-automatisation', icon: 'fa-robot'          },
};

function getCatStyle(category) {
  return CATEGORY_STYLE[category] || { cls: '', icon: 'fa-tag' };
}

function buildPostCard(post, isScheduled = false) {
  const card = document.createElement('article');
  card.className = 'li-post';

  const postDate = new Date(post.date);
  const dateStr  = postDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const catStyle = getCatStyle(post.category);

  if (isScheduled) {
    const banner = document.createElement('span');
    banner.className = 'li-post-scheduled';
    banner.innerHTML = `<i class="fa-solid fa-clock"></i> Planifié — ${dateStr}`;
    card.appendChild(banner);
  }

  const header = document.createElement('div');
  header.className = 'li-post-header';

  const meta = document.createElement('div');
  meta.className = 'li-post-meta';
  meta.innerHTML = `
    <div class="li-post-avatar"><i class="fa-brands fa-linkedin-in"></i></div>
    <div>
      <div class="li-post-name">Aurélien Logeais</div>
      <div class="li-post-date">${isScheduled ? '(publication prévue) ' : ''}${dateStr}</div>
    </div>`;

  const badge = document.createElement('span');
  badge.className = `li-post-badge ${catStyle.cls}`;
  badge.innerHTML = `<i class="fa-solid ${catStyle.icon}"></i> `;
  badge.appendChild(document.createTextNode(post.category || 'Post'));

  header.appendChild(meta);
  header.appendChild(badge);
  card.appendChild(header);

  const contentEl = document.createElement('div');
  contentEl.className = 'li-post-content';
  const lines = (post.content || '').split('\n');
  const isLong = lines.length > 6 || (post.content || '').length > 350;

  contentEl.textContent = post.content || '';
  if (isLong) contentEl.classList.add('collapsed');
  card.appendChild(contentEl);

  const footer = document.createElement('div');
  footer.className = 'li-post-footer';

  if (isLong) {
    const expandBtn = document.createElement('button');
    expandBtn.className = 'li-post-expand';
    expandBtn.innerHTML = `<i class="fa-solid fa-chevron-down"></i> Voir plus`;
    expandBtn.addEventListener('click', () => {
      const collapsed = contentEl.classList.toggle('collapsed');
      expandBtn.innerHTML = collapsed
        ? `<i class="fa-solid fa-chevron-down"></i> Voir plus`
        : `<i class="fa-solid fa-chevron-up"></i> Réduire`;
    });
    footer.appendChild(expandBtn);
  } else {
    footer.appendChild(document.createElement('span')); // spacer
  }

  if (post.url && post.url.trim()) {
    const link = document.createElement('a');
    link.href   = post.url;
    link.target = '_blank';
    link.rel    = 'noopener';
    link.className = 'li-post-link';
    link.innerHTML = `<i class="fa-brands fa-linkedin"></i> Voir sur LinkedIn`;
    footer.appendChild(link);
  }

  card.appendChild(footer);

  const images = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
  if (images.length > 0) {
    const gallery = document.createElement('div');
    const visibleMax = 4;
    const visibleImgs = images.slice(0, visibleMax);
    const extraCount  = images.length - visibleMax;

    let cls = 'li-post-images';
    if      (images.length === 1) cls += ' imgs-1';
    else if (images.length === 2) cls += ' imgs-2';
    else if (images.length === 3) cls += ' imgs-3';
    else if (images.length === 4) cls += ' imgs-4';
    else                          cls += ' imgs-more';
    gallery.className = cls;

    gallery.dataset.images = JSON.stringify(images);

    visibleImgs.forEach((src, imgIdx) => {
      const btn = document.createElement('button');
      btn.className = 'li-post-img-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', `Voir image ${imgIdx + 1} en grand`);
      btn.dataset.index = imgIdx;

      const img = document.createElement('img');
      img.src = src;
      img.alt = `Image du post — ${imgIdx + 1}`;
      img.loading = 'lazy';
      img.onerror = function () {
        this.closest('.li-post-img-btn').classList.add('img-error');
        this.closest('.li-post-img-btn').innerHTML =
          '<i class="fa-solid fa-image"></i>&nbsp;Image introuvable';
      };

      btn.appendChild(img);

      if (imgIdx === visibleMax - 1 && extraCount > 0) {
        const overlay = document.createElement('div');
        overlay.className = 'li-img-more-overlay';
        overlay.textContent = `+${extraCount}`;
        btn.appendChild(overlay);
      }

      btn.addEventListener('click', () => openLightbox(images, imgIdx));
      gallery.appendChild(btn);
    });

    card.insertBefore(gallery, footer);
  }

  return card;
}

function renderArchive(posts) {
  const container = document.getElementById('archiveContainer');
  if (!container) return;

  container.innerHTML = '';

  if (!posts.length) {
    container.innerHTML = `<p class="archive-empty">
      <i class="fa-solid fa-box-archive"></i>
      Pas encore d’archives — elles apparaîtront dès que tu auras plus de ${LI_POSTS_RECENT} publications.
    </p>`;
    return;
  }

  const groups = {};
  posts.forEach(p => {
    const cat = p.category || 'Autre';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  });
  Object.values(groups).forEach(g => g.sort((a, b) => new Date(b.date) - new Date(a.date)));

  Object.entries(groups).forEach(([cat, catPosts], gi) => {
    const catStyle = getCatStyle(cat);
    const folderId = `archive-folder-${gi}`;

    const folder = document.createElement('div');
    folder.className = 'archive-folder';

    const header = document.createElement('button');
    header.className = 'archive-folder-header';
    header.setAttribute('aria-expanded', 'true');
    header.setAttribute('aria-controls', folderId);
    header.innerHTML = `
      <span class="archive-folder-icon"><i class="fa-solid fa-folder-open"></i></span>
      <span class="archive-folder-name">${escapeHTML(cat)}</span>
      <span class="archive-folder-count">${catPosts.length} post${catPosts.length > 1 ? 's' : ''}</span>
      <i class="fa-solid fa-chevron-down archive-folder-chevron"></i>`;

    const body = document.createElement('div');
    body.className = 'archive-folder-body open';
    body.id = folderId;

    catPosts.forEach(post => {
      const postDate = new Date(post.date);
      const dateStr  = postDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      const firstLine = (post.content || '')
        .split('\n')
        .find(l => l.trim().length > 2) || '(post sans titre)';
      const cleanTitle = firstLine.replace(/^[\p{Emoji}\s\u200d\ufe0f\u20e3\u2600-\u26ff\u2700-\u27bf]+/u, '').trim() || firstLine.trim();

      const rowEl = document.createElement('div');
      rowEl.className = 'archive-row';

      const dateEl = document.createElement('span');
      dateEl.className = 'archive-row-date';
      dateEl.textContent = dateStr;

      const titleEl = document.createElement('span');
      titleEl.className = 'archive-row-title';
      titleEl.textContent = cleanTitle.slice(0, 90) + (cleanTitle.length > 90 ? '…' : '');

      const linkIcon = document.createElement('span');
      linkIcon.className = 'archive-row-link';

      rowEl.appendChild(dateEl);
      rowEl.appendChild(titleEl);
      rowEl.appendChild(linkIcon);

      if (post.url && post.url.trim()) {
        const a = document.createElement('a');
        a.href   = post.url;
        a.target = '_blank';
        a.rel    = 'noopener';
        a.className = 'archive-row archive-row-link-wrap';
        a.setAttribute('aria-label', `Voir "${cleanTitle}" sur LinkedIn`);
        a.appendChild(dateEl);
        a.appendChild(titleEl);
        linkIcon.innerHTML = '<i class="fa-brands fa-linkedin"></i>';
        a.appendChild(linkIcon);
        body.appendChild(a);
      } else {
        body.appendChild(rowEl);
      }
    });

    folder.appendChild(header);
    folder.appendChild(body);
    container.appendChild(folder);

    header.addEventListener('click', () => {
      const open = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', String(!open));
      body.classList.toggle('open', !open);
      header.querySelector('.archive-folder-icon i').className =
        open ? 'fa-solid fa-folder' : 'fa-solid fa-folder-open';
    });
  });
}

async function loadLinkedInPosts() {
  const container  = document.getElementById('liPostsContainer');
  const countLabel = document.getElementById('liPostsCount');
  if (!container) return;

  let allPosts = [];
  try {
    const res = await fetch(`data/linkedin-posts.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allPosts = await res.json();
  } catch (err) {
    console.warn('[LinkedIn posts]', err.message);
    container.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;padding:0.75rem;">
      Impossible de charger les posts (${escapeHTML(err.message)}).
    </p>`;
    return;
  }

  const now = Date.now();

  const visible   = allPosts.filter(p => new Date(p.date).getTime() <= now);
  const scheduled = allPosts.filter(p => new Date(p.date).getTime() >  now);

  visible.sort((a, b) => new Date(b.date) - new Date(a.date));
  scheduled.sort((a, b) => new Date(a.date) - new Date(b.date));

  const recent  = visible.slice(0, LI_POSTS_RECENT);
  const archive = visible.slice(LI_POSTS_RECENT);

  container.innerHTML = '';

  if (recent.length === 0 && scheduled.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;padding:0.75rem;">
      Aucun post pour l'instant. Ajoute des entrées dans <code>data/linkedin-posts.json</code> !
    </p>`;
    return;
  }

  if (countLabel) {
    const total = allPosts.length;
    countLabel.textContent = `${total} post${total > 1 ? 's' : ''}`;
  }

  recent.forEach((post, i) => {
    const card = buildPostCard(post, false);
    card.style.opacity   = '0';
    card.style.transform = 'translateY(8px)';
    card.style.transition = `opacity 0.4s ease ${i * 0.09}s, transform 0.4s ease ${i * 0.09}s`;
    container.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    }));
  });

  if (scheduled.length > 0) {
    const schedDiv = document.createElement('div');
    schedDiv.style.cssText = 'margin-top:0.25rem;';
    const schedHeader = document.createElement('p');
    schedHeader.style.cssText = 'font-family:var(--font-mono);font-size:0.75rem;color:var(--yellow);margin-bottom:0.5rem;display:flex;align-items:center;gap:0.4rem;';
    schedHeader.innerHTML = `<i class="fa-solid fa-clock"></i> Posts planifiés (visibles uniquement ici en preview)`;
    schedDiv.appendChild(schedHeader);
    scheduled.forEach(post => schedDiv.appendChild(buildPostCard(post, true)));
    container.appendChild(schedDiv);
  }

  renderArchive(archive);
}

let _lbImages  = [];
let _lbCurrent = 0;

function openLightbox(images, startIndex = 0) {
  if (!images || !images.length) return;
  _lbImages  = images;
  _lbCurrent = startIndex;
  _renderLightbox();
  const lb = document.getElementById('lightbox');
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  document.getElementById('lightboxClose').focus();
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.hidden = true;
  document.body.style.overflow = '';
  _lbImages  = [];
  _lbCurrent = 0;
}

function _renderLightbox() {
  const img     = document.getElementById('lightboxImg');
  const counter = document.getElementById('lightboxCounter');
  const prev    = document.getElementById('lightboxPrev');
  const next    = document.getElementById('lightboxNext');

  img.src = _lbImages[_lbCurrent];
  img.alt = `Image ${_lbCurrent + 1} sur ${_lbImages.length}`;

  counter.textContent = `${_lbCurrent + 1} / ${_lbImages.length}`;
  prev.hidden = (_lbCurrent === 0);
  next.hidden = (_lbCurrent === _lbImages.length - 1);
}

function initLightbox() {
  const lb   = document.getElementById('lightbox');
  const prev = document.getElementById('lightboxPrev');
  const next = document.getElementById('lightboxNext');
  const closeBtn = document.getElementById('lightboxClose');
  if (!lb) return;

  closeBtn.addEventListener('click', closeLightbox);

  prev.addEventListener('click', () => {
    if (_lbCurrent > 0) { _lbCurrent--; _renderLightbox(); }
  });
  next.addEventListener('click', () => {
    if (_lbCurrent < _lbImages.length - 1) { _lbCurrent++; _renderLightbox(); }
  });

  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.closest('.lightbox-img-wrap') === null
        && !e.target.closest('button')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft'  && _lbCurrent > 0)                            { _lbCurrent--; _renderLightbox(); }
    if (e.key === 'ArrowRight' && _lbCurrent < _lbImages.length - 1)        { _lbCurrent++; _renderLightbox(); }
  });
}

function initFooter() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = `© ${new Date().getFullYear()} Aurélien Logeais`;
}

function addRevealClasses() {
  const targets = document.querySelectorAll(
    '.about-grid > .card, .commits-list, #repoCard, .linkedin-wrapper > .card, .link-card, .github-cta'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTypewriter();
  initLightbox();
  addRevealClasses();
  initScrollReveal();
  initFooter();
  loadGitHub();
  loadLinkedInPosts();
});
