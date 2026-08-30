/**
 * Yu-Dojo Router
 * Hash-based SPA navigation with skill-based routing
 */
const Router = (() => {
    let skillsData = {};
    let mapFilter = 'all';

    const SKILL_IDS = ['chinese-chess', 'gomoku', 'photography'];

    const skillMeta = {
        'chinese-chess': { name: '象棋', nameEn: 'Chinese Chess', desc: '千年兵法，方寸之間的智慧博弈' },
        'gomoku': { name: '五子棋', nameEn: 'Gomoku', desc: '黑白之間，連珠成陣的計算藝術' },
        'photography': { name: '攝影', nameEn: 'Photography', desc: '光影捕手，用鏡頭凝結世界的瞬間' }
    };

    const levelNames = {
        beginner: '入門',
        intermediate: '進階',
        advanced: '高級',
        master: '大師'
    };

    const HERO_VIDEO = 'https://designerstephen.github.io/public-assets/videos/serene-art-hero.mp4';

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
                    <button class="pill nav-cta" onclick="Router.navigate('skill/chinese-chess')">開始修煉</button>
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
                    <div class="hero-eyebrow rise">技能修煉道場</div>
                    <h1 class="hero-title rise d1">先看見<em>全貌</em>，再走出路線</h1>
                    <p class="hero-sub rise d2">每一門技藝都先攤開完整的學習地圖 — 所有能學的內容、能力的邊界，一次看清楚，再從地圖上規劃可執行的修煉路線。</p>
                    <div class="hero-actions rise d3">
                        <button class="pill pill-lg" onclick="Router.navigate('skill/chinese-chess')">進入道場</button>
                        <button class="pill pill-lg pill-ghost" onclick="document.getElementById('skills').scrollIntoView({behavior:'smooth'})">瀏覽技藝</button>
                    </div>
                </div>
            </section>

            <section class="section" id="skills">
                <div class="wrap">
                    <div class="section-head">
                        <div class="section-label">The Disciplines</div>
                        <h2 class="section-title">三門技藝，三張完整地圖</h2>
                        <p class="section-desc">每一門技藝都先被完整測繪：所有能被學習的內容、所有能力邊界，一次攤開。路線只是走過這張地圖的一種順序。</p>
                    </div>
                    <div class="skill-grid">${cards}</div>
                </div>
            </section>

            <section class="section" style="padding-top:0">
                <div class="wrap">
                    <div class="section-head">
                        <div class="section-label">Method</div>
                        <h2 class="section-title">怎麼修煉</h2>
                    </div>
                    <div class="quote-card">大多數人學不好一門技藝，不是因為不夠努力，而是因為從來不知道自己還缺什麼。</div>
                    <div class="method-grid">
                        <div class="method-card">
                            <div class="method-num">1</div>
                            <div class="method-title">測繪全貌</div>
                            <p class="method-desc">先窮舉這門技藝可被學習的全部內容，劃分成能力域，標出每個知識單元的深度層級。這是學習的地圖，不是課程表。</p>
                        </div>
                        <div class="method-card">
                            <div class="method-num">2</div>
                            <div class="method-title">規劃路線</div>
                            <p class="method-desc">在地圖上切出四段路線。每一段橫跨多個能力域，並說明為什麼是這個順序、走完之後能做到什麼。</p>
                        </div>
                        <div class="method-card">
                            <div class="method-num">3</div>
                            <div class="method-title">逐段修煉</div>
                            <p class="method-desc">每個階段展開成可讀的教學內容 — 圖解、表格、棋盤示例，以及對應的書籍與工具資源。</p>
                        </div>
                    </div>
                </div>
            </section>

            ${renderFooter()}
        `;
    }

    /* ===== Skill page ===== */

    function renderSkillPage(skillId, activeTab) {
        const meta = skillMeta[skillId];
        const data = skillsData[skillId];
        if (!meta || !data) { renderNotFound(); return; }

        const tabs = [
            { id: 'map', name: '學習地圖' },
            { id: 'roadmap', name: '修煉路線' },
            { id: 'resources', name: '學習資源' }
        ];
        if (!tabs.some(t => t.id === activeTab)) activeTab = 'map';

        const tabsHtml = tabs.map(t => `
            <button class="tab${t.id === activeTab ? ' active' : ''}" onclick="Router.navigate('skill/${skillId}/${t.id}')">${t.name}</button>
        `).join('');

        let panel = '';
        if (activeTab === 'map') panel = renderLearningMap(skillId, data);
        else if (activeTab === 'roadmap') panel = renderRoute(skillId, data);
        else panel = renderAllResources(data);

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

        if (activeTab === 'map') setTimeout(applyMapFilter, 0);
        if (activeTab === 'roadmap') setTimeout(renderBoards, 50);
    }

    /* ===== Tab: 學習地圖 ===== */

    function renderLearningMap(skillId, data) {
        const lm = data.learningMap;
        if (!lm) return '<p class="cb-text">此技能尚未建立學習地圖。</p>';

        const counts = { beginner: 0, intermediate: 0, advanced: 0, master: 0 };
        lm.domains.forEach(d => d.items.forEach(it => { counts[it.level]++; }));

        const filters = [{ id: 'all', label: `全部 ${lm.totalItems}` }]
            .concat(Object.keys(levelNames).map(k => ({ id: k, label: `${levelNames[k]} ${counts[k]}` })))
            .map(f => `<button class="map-filter" data-filter="${f.id}" onclick="Router.setMapFilter('${f.id}')">${f.label}</button>`)
            .join('');

        const domains = lm.domains.map((dom, i) => {
            const items = dom.items.map(it => {
                const click = it.topic ? ` onclick="Router.navigate('skill/${skillId}/stage/${it.topic}')"` : '';
                return `
                    <div class="map-item${it.topic ? ' linked' : ''}" data-level="${it.level}"${click}>
                        <span class="lv" data-lv="${it.level}">${levelNames[it.level]}</span>
                        <span class="map-item-name${it.topic ? '' : ' no-content'}">${escapeHtml(it.name)}</span>
                        ${it.topic ? '<span class="map-item-arrow">→</span>' : ''}
                    </div>
                `;
            }).join('');

            return `
                <section class="domain" data-domain="${dom.id}">
                    <div class="domain-head">
                        <span class="domain-num">${String(i + 1).padStart(2, '0')}</span>
                        <div>
                            <h3 class="domain-name">${escapeHtml(dom.name)}</h3>
                            <div class="domain-en">${escapeHtml(dom.nameEn)}</div>
                            <p class="domain-summary">${escapeHtml(dom.summary)}</p>
                        </div>
                    </div>
                    <div class="map-items">${items}</div>
                </section>
            `;
        }).join('');

        return `
            <div class="panel-head">
                <h2 class="panel-title">${escapeHtml(lm.title)}</h2>
                <p class="panel-desc">${escapeHtml(lm.summary)}</p>
                <div class="panel-stats">
                    <div class="panel-stat"><b>${lm.totalDomains}</b><span>能力域 Domains</span></div>
                    <div class="panel-stat"><b>${lm.totalItems}</b><span>知識單元 Units</span></div>
                    <div class="panel-stat"><b>${data.stages.length}</b><span>修煉階段 Stages</span></div>
                </div>
            </div>
            <div class="map-toolbar">
                ${filters}
                <span class="map-hint">${escapeHtml(lm.legend)}</span>
            </div>
            <div id="map-domains">${domains}</div>
        `;
    }

    function setMapFilter(level) {
        mapFilter = level;
        applyMapFilter();
    }

    function applyMapFilter() {
        document.querySelectorAll('.map-filter').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === mapFilter);
        });
        document.querySelectorAll('.domain').forEach(dom => {
            let visible = 0;
            dom.querySelectorAll('.map-item').forEach(item => {
                const show = mapFilter === 'all' || item.dataset.level === mapFilter;
                item.classList.toggle('hidden', !show);
                if (show) visible++;
            });
            dom.classList.toggle('is-empty', visible === 0);
        });
    }

    /* ===== Tab: 修煉路線 ===== */

    function renderRoute(skillId, data) {
        const lm = data.learningMap;
        const route = data.route || {};
        const domainName = {};
        if (lm) lm.domains.forEach(d => { domainName[d.id] = d.name; });

        const stages = data.stages.map((stage, i) => {
            const chips = (stage.covers || []).map(id => `<span class="chip">${escapeHtml(domainName[id] || id)}</span>`).join('');
            return `
                <section class="route-stage" onclick="Router.navigate('skill/${skillId}/stage/${stage.id}')">
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
                <h2 class="panel-title">從地圖到路線</h2>
                <p class="panel-desc">${escapeHtml(route.intro || '')}</p>
            </div>
            ${route.strategy ? `<div class="route-note">${escapeHtml(route.strategy)}</div>` : ''}
            <div>${stages}</div>
            <div class="topic" style="margin-top:22px">
                <div class="topic-head">
                    <span class="topic-num">附</span>
                    <div>
                        <h3 class="topic-title">分段的依據</h3>
                        <div class="topic-en">Appendix</div>
                    </div>
                </div>
                ${data.introduction ? renderContentBlocks(data.introduction) : ''}
            </div>
        `;
    }

    /* ===== Tab: 學習資源 ===== */

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

        const stage = data.stages.find(s => s.id === stageId);
        if (!stage) { navigate(`skill/${skillId}/roadmap`); return; }

        const lm = data.learningMap;
        const domainName = {};
        if (lm) lm.domains.forEach(d => { domainName[d.id] = d.name; });

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
                { name: '修煉路線', path: `skill/${skillId}/roadmap` },
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

    return { init, navigate, setMapFilter, scrollToTopic };
})();

document.addEventListener('DOMContentLoaded', () => Router.init());
