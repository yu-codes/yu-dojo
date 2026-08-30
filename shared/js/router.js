/**
 * Yu-Dojo Router
 * Hash-based SPA navigation with skill-based routing
 */
const Router = (() => {
    let skillsData = {};
    let mapFilter = 'all';
    let collapsed = {};          // domainId -> true when collapsed in the mind map
    let currentSkill = null;

    const SKILL_IDS = ['chinese-chess', 'gomoku', 'photography'];

    const skillMeta = {
        'chinese-chess': { name: '象棋', nameEn: 'Chinese Chess', desc: '千年兵法，方寸之間的智慧博弈' },
        'gomoku': { name: '五子棋', nameEn: 'Gomoku', desc: '黑白之間，連珠成陣的計算藝術' },
        'photography': { name: '攝影', nameEn: 'Photography', desc: '光影捕手，用鏡頭凝結世界的瞬間' }
    };

    const levelNames = { beginner: '入門', intermediate: '進階', advanced: '高級', master: '大師' };
    const LEVELS = ['beginner', 'intermediate', 'advanced', 'master'];

    const HERO_VIDEO = 'https://designerstephen.github.io/public-assets/videos/serene-art-hero.mp4';

    /* ===== Theme ===== */

    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    function toggleTheme() {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('yu-dojo-theme', next); } catch (e) { /* private mode */ }
        document.querySelectorAll('.theme-toggle').forEach(b => {
            b.innerHTML = themeIcon(next);
            b.setAttribute('aria-label', next === 'dark' ? '切換為淺色主題' : '切換為深色主題');
        });
    }

    function themeIcon(theme) {
        return theme === 'dark'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    }

    /* ===== Boot ===== */

    async function init() {
        await loadAllSkillData();
        window.addEventListener('hashchange', handleRoute);
        handleRoute();
    }

    async function loadAllSkillData() {
        const promises = SKILL_IDS.map(async (id) => {
            try {
                const resp = await fetch(`data/${id}.json`);
                skillsData[id] = await resp.json();
            } catch (e) {
                console.warn(`Failed to load ${id} data`, e);
            }
        });
        await Promise.all(promises);
    }

    function handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const parts = hash.split('/').filter(Boolean);

        mapFilter = 'all';
        collapsed = {};

        if (parts.length === 0) {
            renderHome();
        } else if (parts[0] === 'skill' && parts[1]) {
            const skillId = parts[1];
            if (parts[2] === 'stage' && parts[3]) {
                renderStageDetail(skillId, parts[3], parts[4] || null);
            } else {
                renderSkillPage(skillId, parts[2] || 'map');
            }
        } else {
            renderHome();
        }
        window.scrollTo(0, 0);
    }

    function navigate(path) {
        window.location.hash = path;
    }

    /* ===== Chrome ===== */

    function renderNav(options) {
        const opts = options || {};
        const links = SKILL_IDS.map(id => {
            const active = opts.activeSkill === id ? ' class="active"' : '';
            return `<li><a${active} href="javascript:void(0)" onclick="Router.navigate('skill/${id}')">${skillMeta[id].name}</a></li>`;
        }).join('');

        return `
            <header class="nav${opts.overlay ? ' nav-over' : ''}">
                <div class="nav-inner">
                    <div class="nav-brand" onclick="Router.navigate('')">Yu Dojo<sup>®</sup></div>
                    <ul class="nav-links">${links}</ul>
                    <div class="nav-right">
                        <button class="icon-btn theme-toggle" onclick="Router.toggleTheme()"
                                aria-label="${currentTheme() === 'dark' ? '切換為淺色主題' : '切換為深色主題'}">${themeIcon(currentTheme())}</button>
                    </div>
                </div>
            </header>
        `;
    }

    function renderCrumbs(crumbs) {
        const all = [{ name: '道場', path: '' }].concat(crumbs || []);
        const html = all.map((b, i) => {
            if (i === all.length - 1) return `<span class="crumbs-current">${b.name}</span>`;
            return `<a href="javascript:void(0)" onclick="Router.navigate('${b.path}')">${b.name}</a><span>/</span>`;
        }).join('');
        return `<nav class="crumbs wrap">${html}</nav>`;
    }

    function renderFooter() {
        return `
            <div class="wrap">
                <footer class="footer">
                    <span>Yu Dojo® — 技能修煉道場</span>
                    <span>先看見全貌，再走出路線</span>
                </footer>
            </div>
        `;
    }

    /* ===== Home ===== */

    function renderHome() {
        const cards = SKILL_IDS.map((id, i) => {
            const meta = skillMeta[id];
            const data = skillsData[id];
            const lm = data && data.learningMap;
            return `
                <div class="skill-card rise d${i + 1}" onclick="Router.navigate('skill/${id}')">
                    <div class="skill-card-top">
                        <span class="skill-card-name">${meta.name}</span>
                        <span class="skill-card-en">${meta.nameEn}</span>
                    </div>
                    <p class="skill-card-desc">${meta.desc}</p>
                    <div class="skill-card-stats">
                        <div class="skill-card-stat"><b>${lm ? lm.totalDomains : 0}</b><span>能力域</span></div>
                        <div class="skill-card-stat"><b>${lm ? lm.totalItems : 0}</b><span>知識單元</span></div>
                        <div class="skill-card-stat"><b>${data ? data.stages.length : 0}</b><span>修煉階段</span></div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('app').innerHTML = `
            ${renderNav({ overlay: true })}
            <section class="hero">
                <video class="hero-video" autoplay muted loop playsinline preload="auto">
                    <source src="${HERO_VIDEO}" type="video/mp4">
                </video>
                <div class="hero-scrim"></div>
                <div class="hero-inner">
                    <h1 class="hero-title rise">先看見<em>全貌</em>，再走出路線</h1>
                    <p class="hero-sub rise d1">每一門技藝都先攤開完整的學習地圖 — 所有能學的內容、能力的邊界，一次看清楚，再從地圖上規劃可執行的修煉路線。</p>
                </div>
            </section>

            <section class="section" id="skills">
                <div class="wrap">
                    <div class="section-head">
                        <div class="section-label">Disciplines</div>
                        <h2 class="section-title">選擇一門技藝</h2>
                        <p class="section-desc">每一門技藝都先被完整測繪：所有能被學習的內容、所有能力邊界，一次攤開。路線只是走過這張地圖的一種順序。</p>
                    </div>
                    <div class="skill-grid">${cards}</div>
                </div>
            </section>

            <div class="wrap">
                <section class="method">
                    <div class="section-label">Method</div>
                    <p class="method-lead">大多數人學不好一門技藝，不是因為不夠努力，而是因為從來不知道自己還缺什麼。</p>
                    <div class="method-steps">
                        <div class="method-step">
                            <div class="method-step-num">01</div>
                            <div class="method-step-title">測繪全貌</div>
                            <p class="method-step-desc">先窮舉這門技藝可被學習的全部內容，劃分成能力域，標出每個知識單元的深度層級。這是學習的地圖，不是課程表。</p>
                        </div>
                        <div class="method-step">
                            <div class="method-step-num">02</div>
                            <div class="method-step-title">規劃路線</div>
                            <p class="method-step-desc">在地圖上切出階段路線。每一段橫跨多個能力域，並說明為什麼是這個順序、走完之後能做到什麼。</p>
                        </div>
                        <div class="method-step">
                            <div class="method-step-num">03</div>
                            <div class="method-step-title">逐段修煉</div>
                            <p class="method-step-desc">每個階段展開成可讀的教學內容 — 圖解、表格、棋盤示例，以及對應的書籍與工具資源。</p>
                        </div>
                    </div>
                </section>
            </div>

            ${renderFooter()}
        `;
    }

    /* ===== Skill page (map + route merged) ===== */

    function renderSkillPage(skillId, activeTab) {
        const meta = skillMeta[skillId];
        const data = skillsData[skillId];
        if (!meta || !data) { renderNotFound(); return; }
        currentSkill = skillId;

        const tabs = [
            { id: 'map', name: '學習地圖與路線' },
            { id: 'resources', name: '學習資源' }
        ];
        // "roadmap" used to be its own tab; it now lives on the map page.
        if (activeTab === 'roadmap') activeTab = 'map';
        if (!tabs.some(t => t.id === activeTab)) activeTab = 'map';

        const tabsHtml = tabs.map(t => `
            <button class="tab${t.id === activeTab ? ' active' : ''}" onclick="Router.navigate('skill/${skillId}/${t.id}')">${t.name}</button>
        `).join('');

        const panel = activeTab === 'map'
            ? renderMapAndRoute(skillId, data)
            : renderAllResources(data);

        document.getElementById('app').innerHTML = `
            ${renderNav({ activeSkill: skillId })}
            ${renderCrumbs([{ name: meta.name, path: `skill/${skillId}` }])}
            <div class="wrap skill-hero">
                <div class="skill-hero-en">${meta.nameEn}</div>
                <h1 class="skill-hero-title">${data.name}</h1>
                <p class="skill-hero-desc">${data.description}</p>
                <div class="tabs">${tabsHtml}</div>
            </div>
            <div class="wrap tab-panel rise">${panel}</div>
            ${renderFooter()}
        `;

        if (activeTab === 'map') setTimeout(() => { drawMindMap(); renderBoards(); }, 30);
    }

    /* ===== Merged panel: mind map + route ===== */

    function renderMapAndRoute(skillId, data) {
        const lm = data.learningMap;
        const route = data.route || {};
        const domainName = {};
        if (lm) lm.domains.forEach(d => { domainName[d.id] = d.name; });

        const counts = { beginner: 0, intermediate: 0, advanced: 0, master: 0 };
        if (lm) lm.domains.forEach(d => d.items.forEach(it => { counts[it.level]++; }));

        const filters = [{ id: 'all', label: `全部 ${lm ? lm.totalItems : 0}` }]
            .concat(LEVELS.map(k => ({ id: k, label: `${levelNames[k]} ${counts[k]}` })))
            .map(f => `<button class="mm-filter" data-filter="${f.id}" onclick="Router.setMapFilter('${f.id}')">${f.label}</button>`)
            .join('');

        const legend = LEVELS.map(k =>
            `<span><i style="background:var(--lv-${k})"></i>${levelNames[k]}</span>`
        ).join('');

        // Jump straight into any stage from this page
        const jump = data.stages.map(s => `
            <button class="stage-jump-btn" onclick="Router.navigate('skill/${skillId}/stage/${s.id}')">
                <i style="background:var(--lv-${s.id})"></i>${escapeHtml(s.name)}
            </button>
        `).join('');

        const stages = data.stages.map((stage, i) => {
            const chips = (stage.covers || []).map(id => `<span class="chip">${escapeHtml(domainName[id] || id)}</span>`).join('');
            return `
                <section class="route-stage" id="stage-${stage.id}" onclick="Router.navigate('skill/${skillId}/stage/${stage.id}')">
                    <div class="route-stage-head">
                        <span class="lv lv-solid" data-lv="${stage.id}">${levelNames[stage.id] || ''}</span>
                        <span class="route-stage-name">${escapeHtml(stage.name)}</span>
                        <span class="route-stage-en">${escapeHtml(stage.nameEn)}</span>
                        <span class="route-stage-num" style="margin-left:auto">STAGE ${String(i + 1).padStart(2, '0')} / ${String(data.stages.length).padStart(2, '0')}</span>
                    </div>
                    <p class="route-goal">${escapeHtml(stage.goal || stage.description)}</p>
                    <p class="route-desc">${escapeHtml(stage.description)}</p>
                    <div class="route-meta">
                        <span>建議時程 <b>${escapeHtml(stage.duration)}</b></span>
                        ${stage.benchmark ? `<span>對應水準 <b>${escapeHtml(stage.benchmark)}</b></span>` : ''}
                    </div>
                    <div class="covers-cap">本段橫跨的能力域</div>
                    <div class="chips">${chips}</div>
                    <div class="route-foot">
                        <span>${stage.topics.length} 個教學主題</span>
                        ${stage.mapItemCount ? `<span>涵蓋地圖 ${stage.mapItemCount} 個知識單元</span>` : ''}
                        <span>${stage.resources.length} 份學習資源</span>
                        <span class="route-enter">進入本段 →</span>
                    </div>
                </section>
            `;
        }).join('');

        return `
            <div class="panel-head">
                <h2 class="panel-title">${escapeHtml(lm ? lm.title : '學習地圖')}</h2>
                <p class="panel-desc">${escapeHtml(lm ? lm.summary : '')}</p>
                <div class="panel-stats">
                    <div class="panel-stat"><b>${lm ? lm.totalDomains : 0}</b><span>能力域 Domains</span></div>
                    <div class="panel-stat"><b>${lm ? lm.totalItems : 0}</b><span>知識單元 Units</span></div>
                    <div class="panel-stat"><b>${data.stages.length}</b><span>修煉階段 Stages</span></div>
                </div>
            </div>

            <div class="anchor-head" id="sec-map">
                <h2>學習地圖</h2><span class="rule"></span>
                <span class="hint">點節點可收合，有連結的單元可直接進入教學</span>
            </div>
            <div class="mm-toolbar">
                ${filters}
                <span class="mm-spacer"></span>
                <button class="mm-filter" onclick="Router.toggleAllDomains()" id="mm-collapse-all">全部收合</button>
            </div>
            <div class="mm-wrap"><div id="mindmap"></div></div>
            <div class="mm-legend">${legend}</div>

            <div class="anchor-head" id="sec-route">
                <h2>修煉路線</h2><span class="rule"></span>
                <span class="hint">從地圖推導出的學習順序</span>
            </div>
            <p class="panel-desc" style="margin-bottom:14px">${escapeHtml(route.intro || '')}</p>
            ${route.strategy ? `<div class="route-note">${escapeHtml(route.strategy)}</div>` : ''}
            <div class="stage-jump">${jump}</div>
            <div>${stages}</div>

            <div class="anchor-head"><h2>分段的依據</h2><span class="rule"></span></div>
            <div class="topic">${data.introduction ? renderContentBlocks(data.introduction) : ''}</div>
        `;
    }

    /* ===== Mind map (SVG) ===== */

    function drawMindMap() {
        const host = document.getElementById('mindmap');
        const data = skillsData[currentSkill];
        if (!host || !data || !data.learningMap) return;
        host.innerHTML = buildMindMapSVG(currentSkill, data);
        document.querySelectorAll('.mm-filter[data-filter]').forEach(b => {
            b.classList.toggle('active', b.dataset.filter === mapFilter);
        });
    }

    function buildMindMapSVG(skillId, data) {
        const lm = data.learningMap;

        // Layout constants
        const ROOT_X = 14, ROOT_W = 104;
        const DOM_X = 196, DOM_W = 196, DOM_H = 44;
        const ITEM_X = 452, ITEM_W = 384;
        const ROW = 25, PAD_Y = 18, DOM_GAP = 16;
        const WIDTH = ITEM_X + ITEM_W + 16;

        // Measure: place each domain block
        let y = PAD_Y;
        const blocks = lm.domains.map(dom => {
            const items = dom.items.filter(it => mapFilter === 'all' || it.level === mapFilter);
            const isCollapsed = !!collapsed[dom.id];
            const listH = (isCollapsed || items.length === 0) ? 0 : items.length * ROW;
            const h = Math.max(DOM_H, listH);
            const block = { dom, items, isCollapsed, top: y, h, cy: y + h / 2 };
            y += h + DOM_GAP;
            return block;
        }).filter(b => b.items.length > 0 || mapFilter === 'all');

        const HEIGHT = Math.max(y - DOM_GAP + PAD_Y, 160);
        const rootCY = HEIGHT / 2;

        let svg = `<svg class="mm-svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="${escapeHtml(lm.title)}">`;

        // Root -> domain connectors
        blocks.forEach(b => {
            svg += curve(ROOT_X + ROOT_W, rootCY, DOM_X, b.cy);
        });

        // Root node
        const rootH = 42;
        svg += `<rect class="mm-root-box" x="${ROOT_X}" y="${rootCY - rootH / 2}" width="${ROOT_W}" height="${rootH}" rx="10"/>`;
        svg += `<text class="mm-root-text" x="${ROOT_X + ROOT_W / 2}" y="${rootCY}" text-anchor="middle" dominant-baseline="central">${escapeHtml(data.name)}</text>`;

        // Domains + items
        blocks.forEach((b, i) => {
            const dom = b.dom;
            const boxY = b.cy - DOM_H / 2;

            if (!b.isCollapsed) {
                b.items.forEach((it, j) => {
                    const iy = b.top + j * ROW + ROW / 2;
                    svg += curve(DOM_X + DOM_W, b.cy, ITEM_X - 10, iy);
                });
            }

            svg += `<g class="mm-dom-g" onclick="Router.toggleDomain('${dom.id}')">`;
            svg += `<rect class="mm-dom-box" x="${DOM_X}" y="${boxY}" width="${DOM_W}" height="${DOM_H}" rx="9"/>`;
            svg += `<text class="mm-dom-text" x="${DOM_X + 13}" y="${boxY + 17}">${escapeHtml(dom.name)}</text>`;
            svg += `<text class="mm-dom-sub" x="${DOM_X + 13}" y="${boxY + 32}">${String(i + 1).padStart(2, '0')} · ${b.items.length} 單元</text>`;
            svg += `<text class="mm-dom-toggle" x="${DOM_X + DOM_W - 13}" y="${boxY + DOM_H / 2}" text-anchor="end" dominant-baseline="central">${b.isCollapsed ? '+' : '−'}</text>`;
            svg += `</g>`;

            if (b.isCollapsed) return;

            b.items.forEach((it, j) => {
                const iy = b.top + j * ROW + ROW / 2;
                const linked = !!it.topic;
                const click = linked ? ` onclick="Router.navigate('skill/${skillId}/stage/${it.topic}')"` : '';
                svg += `<g class="mm-item-g${linked ? ' linked' : ''}"${click}>`;
                svg += `<rect class="mm-item-hit" x="${ITEM_X - 12}" y="${iy - ROW / 2 + 2}" width="${ITEM_W}" height="${ROW - 3}" rx="6"/>`;
                svg += `<circle class="mm-dot" data-lv="${it.level}" cx="${ITEM_X - 4}" cy="${iy}" r="3.6"/>`;
                svg += `<text class="mm-item-text" x="${ITEM_X + 9}" y="${iy}" dominant-baseline="central">${escapeHtml(it.name)}${linked ? '' : ''}</text>`;
                svg += `</g>`;
            });
        });

        svg += `</svg>`;
        return svg;
    }

    function curve(x1, y1, x2, y2) {
        const mx = (x1 + x2) / 2;
        return `<path class="mm-link" d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}"/>`;
    }

    function toggleDomain(domainId) {
        collapsed[domainId] = !collapsed[domainId];
        drawMindMap();
        syncCollapseAllLabel();
    }

    function toggleAllDomains() {
        const lm = skillsData[currentSkill] && skillsData[currentSkill].learningMap;
        if (!lm) return;
        const anyOpen = lm.domains.some(d => !collapsed[d.id]);
        lm.domains.forEach(d => { collapsed[d.id] = anyOpen; });
        drawMindMap();
        syncCollapseAllLabel();
    }

    function syncCollapseAllLabel() {
        const lm = skillsData[currentSkill] && skillsData[currentSkill].learningMap;
        const btn = document.getElementById('mm-collapse-all');
        if (!lm || !btn) return;
        btn.textContent = lm.domains.some(d => !collapsed[d.id]) ? '全部收合' : '全部展開';
    }

    function setMapFilter(level) {
        mapFilter = level;
        drawMindMap();
    }

    /* ===== Resources ===== */

    function renderAllResources(data) {
        const all = data.stages.flatMap(stage => stage.resources.map(r => ({ ...r, stage: stage.name })));
        const grouped = {};
        all.forEach(r => {
            if (!grouped[r.type]) grouped[r.type] = [];
            grouped[r.type].push(r);
        });

        const typeNames = { book: '書籍', website: '網站', video: '影片', app: '工具與軟體', platform: '平台' };

        return Object.entries(grouped).map(([type, list]) => `
            <div class="res-group">
                <h3 class="res-group-title">${typeNames[type] || type}<span>${list.length}</span></h3>
                <div class="res-grid">
                    ${list.map(r => `
                        <div class="res-card">
                            <div class="res-card-top">
                                <span class="res-title">${escapeHtml(r.title)}</span>
                                <span class="res-type">${escapeHtml(r.type)}</span>
                            </div>
                            <p class="res-desc">${escapeHtml(r.description)}</p>
                            <div class="res-foot">
                                <span>${escapeHtml(r.stage)}</span>
                                ${r.url ? `<a class="res-link" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.url)}</a>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    /* ===== Stage detail ===== */

    function renderStageDetail(skillId, stageId, topicId) {
        const meta = skillMeta[skillId];
        const data = skillsData[skillId];
        if (!meta || !data) { renderNotFound(); return; }
        currentSkill = skillId;

        const stage = data.stages.find(s => s.id === stageId);
        if (!stage) { navigate(`skill/${skillId}/map`); return; }

        const lm = data.learningMap;
        const domainName = {};
        if (lm) lm.domains.forEach(d => { domainName[d.id] = d.name; });

        // Jump between stages without going back to the map
        const stageNav = data.stages.map(s => `
            <button class="stage-jump-btn"${s.id === stageId ? ' style="border-color:var(--faint);color:var(--ink);font-weight:600"' : ''}
                    onclick="Router.navigate('skill/${skillId}/stage/${s.id}')">
                <i style="background:var(--lv-${s.id})"></i>${escapeHtml(s.name)}
            </button>
        `).join('');

        const toc = stage.topics.map((t, i) => `
            <button class="toc-item" onclick="Router.scrollToTopic('${t.id}')">
                <span class="toc-num">${String(i + 1).padStart(2, '0')}</span>
                <span>${escapeHtml(t.name)}</span>
            </button>
        `).join('');

        const articles = stage.topics.map((t, i) => `
            <article class="topic" id="topic-${t.id}">
                <div class="topic-head">
                    <span class="topic-num">${String(i + 1).padStart(2, '0')}</span>
                    <div>
                        <h2 class="topic-title">${escapeHtml(t.name)}</h2>
                        <div class="topic-en">${escapeHtml(t.nameEn)}</div>
                    </div>
                </div>
                ${renderContentBlocks(t.content)}
            </article>
        `).join('');

        const chips = (stage.covers || []).map(id => `<span class="chip">${escapeHtml(domainName[id] || id)}</span>`).join('');

        document.getElementById('app').innerHTML = `
            ${renderNav({ activeSkill: skillId })}
            ${renderCrumbs([
                { name: meta.name, path: `skill/${skillId}` },
                { name: '學習地圖與路線', path: `skill/${skillId}/map` },
                { name: stage.name, path: `skill/${skillId}/stage/${stageId}` }
            ])}
            <div class="wrap stage-detail">
                <div class="stage-head">
                    <span class="lv lv-solid" data-lv="${stage.id}">${levelNames[stage.id] || ''}</span>
                    <h1 class="stage-title">${escapeHtml(stage.name)}</h1>
                    <div class="stage-en">${escapeHtml(stage.nameEn)}</div>
                    ${stage.goal ? `<p class="stage-goal">${escapeHtml(stage.goal)}</p>` : ''}
                    <p class="stage-desc">${escapeHtml(stage.description)}</p>
                    ${chips ? `<div class="covers-cap">本段橫跨的能力域</div><div class="chips">${chips}</div>` : ''}
                    <div class="stage-meta">
                        <span>建議時程 <b>${escapeHtml(stage.duration)}</b></span>
                        ${stage.benchmark ? `<span>對應水準 <b>${escapeHtml(stage.benchmark)}</b></span>` : ''}
                        <span>教學主題 <b>${stage.topics.length}</b></span>
                        ${stage.mapItemCount ? `<span>涵蓋知識單元 <b>${stage.mapItemCount}</b></span>` : ''}
                    </div>
                </div>
                <div class="stage-nav">${stageNav}</div>
                <div class="stage-body">
                    <aside class="toc">
                        <div class="toc-cap">本段主題</div>
                        ${toc}
                    </aside>
                    <div>${articles}</div>
                </div>
            </div>
            ${renderFooter()}
        `;

        setTimeout(() => {
            renderBoards();
            if (topicId) scrollToTopic(topicId);
        }, 60);
    }

    function scrollToTopic(topicId) {
        const el = document.getElementById(`topic-${topicId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderNotFound() {
        document.getElementById('app').innerHTML = `
            ${renderNav({})}
            <div class="wrap empty">
                <div class="empty-title">找不到頁面</div>
                <p class="empty-desc">這條路線不存在。</p>
                <button class="pill" onclick="Router.navigate('')">回到道場</button>
            </div>
            ${renderFooter()}
        `;
    }

    /* ===== Content blocks ===== */

    function renderContentBlocks(blocks) {
        if (!blocks || !Array.isArray(blocks)) return '';
        return blocks.map(block => {
            switch (block.type) {
                case 'text':
                    return `<p class="cb-text">${escapeHtml(block.value)}</p>`;
                case 'heading':
                    return `<h3 class="cb-heading">${escapeHtml(block.value)}</h3>`;
                case 'list':
                    return `<ul class="cb-list">${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
                case 'tip':
                    return `<div class="cb-tip"><span class="cb-tip-icon">💡</span><span>${escapeHtml(block.value)}</span></div>`;
                case 'table':
                    return renderTable(block);
                case 'board':
                    return `<div class="cb-board" data-fen="${escapeHtml(block.fen)}" data-caption="${escapeHtml(block.caption || '')}" data-highlights='${JSON.stringify(block.highlights || [])}' data-arrows='${JSON.stringify(block.arrows || [])}'></div>`;
                case 'gomoku':
                    return `<div class="cb-gomoku" data-moves='${JSON.stringify(block.moves || [])}' data-caption="${escapeHtml(block.caption || '')}" data-markers='${JSON.stringify(block.markers || [])}' data-show-numbers="${block.showNumbers !== false}"></div>`;
                default:
                    return '';
            }
        }).join('');
    }

    function renderTable(block) {
        const headers = block.headers ? `<thead><tr>${block.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>` : '';
        const rows = block.rows ? `<tbody>${block.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>` : '';
        return `<div class="cb-table-wrap"><table class="cb-table">${headers}${rows}</table></div>`;
    }

    function renderBoards() {
        document.querySelectorAll('.cb-board').forEach(el => {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            const caption = el.dataset.caption;
            if (typeof XiangqiBoard !== 'undefined') {
                XiangqiBoard.render(el, el.dataset.fen, {
                    highlights: JSON.parse(el.dataset.highlights || '[]'),
                    arrows: JSON.parse(el.dataset.arrows || '[]')
                });
            }
            if (caption) appendCaption(el, caption);
        });
        document.querySelectorAll('.cb-gomoku').forEach(el => {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            const caption = el.dataset.caption;
            if (typeof GomokuBoard !== 'undefined') {
                GomokuBoard.render(el, JSON.parse(el.dataset.moves || '[]'), {
                    markers: JSON.parse(el.dataset.markers || '[]'),
                    showNumbers: el.dataset.showNumbers !== 'false'
                });
            }
            if (caption) appendCaption(el, caption);
        });
    }

    function appendCaption(el, caption) {
        const cap = document.createElement('div');
        cap.className = 'cb-board-caption';
        cap.textContent = caption;
        el.appendChild(cap);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    return {
        init, navigate, setMapFilter, scrollToTopic,
        toggleTheme, toggleDomain, toggleAllDomains
    };
})();

document.addEventListener('DOMContentLoaded', () => Router.init());
