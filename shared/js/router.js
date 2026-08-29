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
            <footer class="wrap">
                <div class="footer">
                    <span>Yu Dojo® — 技能修煉道場</span>
                    <span>先看見全貌，再走出路線</span>
                </div>
            </footer>
        `;
    }

    /* ===== Home ===== */

    function renderHome() {
        const rows = SKILL_IDS.map((id, i) => {
            const meta = skillMeta[id];
            const data = skillsData[id];
            const lm = data && data.learningMap;
            const domains = lm ? lm.totalDomains : 0;
            const units = lm ? lm.totalItems : 0;
            const stages = data ? data.stages.length : 0;
            return `
                <div class="skill-row rise d${i + 1}" onclick="Router.navigate('skill/${id}')">
                    <div class="skill-row-num">${String(i + 1).padStart(2, '0')}</div>
                    <div>
                        <div class="skill-row-name">${meta.name}</div>
                        <div class="skill-row-en">${meta.nameEn}</div>
                        <div class="skill-row-desc">${meta.desc}</div>
                    </div>
                    <div class="skill-row-stats">
                        <div><div class="stat-num">${domains}</div><div class="stat-cap">能力域</div></div>
                        <div><div class="stat-num">${units}</div><div class="stat-cap">知識單元</div></div>
                        <div><div class="stat-num">${stages}</div><div class="stat-cap">修煉階段</div></div>
                    </div>
                    <div class="skill-row-go">→</div>
                </div>
            `;
        }).join('');

        document.getElementById('app').innerHTML = `
            ${renderNav({ overlay: true })}
            <section class="hero">
                <video class="hero-video" autoplay muted loop playsinline preload="auto" poster="">
                    <source src="${HERO_VIDEO}" type="video/mp4">
                </video>
                <div class="hero-scrim"></div>
                <div class="hero-inner">
                    <div class="hero-eyebrow rise">Skill Dojo — 技能修煉道場</div>
                    <h1 class="hero-title rise d1">
                        <span class="line">The whole <em>map</em>,</span>
                        <span class="line">then the <em>path</em>.</span>
                    </h1>
                    <p class="hero-sub rise d2">先看見一門技藝的完整邊界，再決定從哪裡開始。象棋、五子棋、攝影——每一項都先攤開全景學習地圖，再從地圖上規劃出可執行的修煉路線。</p>
                    <div class="hero-actions rise d4">
                        <button class="pill pill-lg" onclick="Router.navigate('skill/chinese-chess')">進入道場</button>
                        <button class="pill pill-lg pill-ghost" onclick="document.getElementById('skills').scrollIntoView({behavior:'smooth'})">瀏覽技藝</button>
                    </div>
                </div>
                <div class="hero-scroll">Scroll</div>
            </section>

            <section class="section" id="skills">
                <div class="wrap">
                    <div class="section-head">
                        <div class="section-label">The Disciplines</div>
                        <h2 class="section-title">三門技藝，三張完整地圖</h2>
                        <p class="section-desc">每一門技藝都先被完整測繪：所有能被學習的內容、所有能力邊界，一次攤開。路線只是走過這張地圖的一種順序。</p>
                    </div>
                    <div class="skill-list">${rows}</div>
                </div>
            </section>

            <section class="manifesto">
                <div class="wrap">
                    <div class="section-label">Method</div>
                    <p class="manifesto-quote">大多數人學不好一門技藝，不是因為不夠努力，而是因為從來不知道自己還缺什麼。</p>
                    <div class="manifesto-steps">
                        <div class="manifesto-step">
                            <div class="manifesto-step-num">01</div>
                            <div class="manifesto-step-title">測繪全貌</div>
                            <div class="manifesto-step-desc">先窮舉這門技藝可被學習的全部內容，劃分成能力域，標出每個知識單元的深度層級。這是學習的地圖，不是課程表。</div>
                        </div>
                        <div class="manifesto-step">
                            <div class="manifesto-step-num">02</div>
                            <div class="manifesto-step-title">規劃路線</div>
                            <div class="manifesto-step-desc">在地圖上切出四段路線。每一段橫跨多個能力域，並說明為什麼是這個順序、走完之後能做到什麼。</div>
                        </div>
                        <div class="manifesto-step">
                            <div class="manifesto-step-num">03</div>
                            <div class="manifesto-step-title">逐段修煉</div>
                            <div class="manifesto-step-desc">每個階段展開成可讀的教學內容——圖解、表格、棋盤示例，以及對應的書籍與工具資源。</div>
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
        if (!['map', 'roadmap', 'resources'].includes(activeTab)) activeTab = 'map';

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
                <div class="section-label rise">${meta.nameEn}</div>
                <h1 class="skill-hero-title rise d1">${data.name}</h1>
                <p class="skill-hero-desc rise d2">${data.description}</p>
                <div class="tabs rise d3">${tabsHtml}</div>
            </div>
            <div class="wrap tab-panel rise d3">${panel}</div>
            ${renderFooter()}
        `;

        if (activeTab === 'map') setTimeout(applyMapFilter, 0);
        if (activeTab === 'roadmap') setTimeout(renderBoards, 50);
    }

    /* ===== Tab: 學習地圖 ===== */

    function renderLearningMap(skillId, data) {
        const lm = data.learningMap;
        if (!lm) return '<p class="cb-text">此技能尚未建立學習地圖。</p>';

        const levelCounts = { beginner: 0, intermediate: 0, advanced: 0, master: 0 };
        lm.domains.forEach(d => d.items.forEach(it => { levelCounts[it.level]++; }));

        const filters = [{ id: 'all', label: `全部 ${lm.totalItems}` }].concat(
            Object.keys(levelNames).map(k => ({ id: k, label: `${levelNames[k]} ${levelCounts[k]}` }))
        ).map(f => `<button class="map-filter" data-filter="${f.id}" onclick="Router.setMapFilter('${f.id}')">${f.label}</button>`).join('');

        const domains = lm.domains.map((dom, i) => {
            const items = dom.items.map(it => {
                const linked = it.topic ? ' linked' : '';
                const click = it.topic
                    ? ` onclick="Router.navigate('skill/${skillId}/stage/${it.topic}')"`
                    : '';
                const nameCls = it.topic ? '' : ' no-content';
                const arrow = it.topic ? '<span class="map-item-arrow">→</span>' : '';
                return `
                    <div class="map-item${linked}" data-level="${it.level}"${click}>
                        <span class="lv" data-lv="${it.level}">${levelNames[it.level]}</span>
                        <span class="map-item-name${nameCls}">${escapeHtml(it.name)}</span>
                        ${arrow}
                    </div>
                `;
            }).join('');

            return `
                <section class="domain" data-domain="${dom.id}">
                    <div>
                        <div class="domain-num">${String(i + 1).padStart(2, '0')} / ${String(lm.domains.length).padStart(2, '0')}</div>
                        <h3 class="domain-name">${escapeHtml(dom.name)}</h3>
                        <div class="domain-en">${escapeHtml(dom.nameEn)}</div>
                        <p class="domain-summary">${escapeHtml(dom.summary)}</p>
                    </div>
                    <div class="map-items">${items}</div>
                </section>
            `;
        }).join('');

        return `
            <div class="map-lead">
                <h2 class="map-lead-title">${escapeHtml(lm.title)}</h2>
                <p class="map-lead-desc">${escapeHtml(lm.summary)}</p>
            </div>
            <div class="map-stats">
                <div><div class="map-stat-num">${lm.totalDomains}</div><div class="map-stat-cap">能力域 Domains</div></div>
                <div><div class="map-stat-num">${lm.totalItems}</div><div class="map-stat-cap">知識單元 Units</div></div>
                <div><div class="map-stat-num">${data.stages.length}</div><div class="map-stat-cap">修煉階段 Stages</div></div>
            </div>
            <div class="map-filters">${filters}</div>
            <p class="map-filter-hint">${escapeHtml(lm.legend)}</p>
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
                    <div>
                        <div class="route-stage-num">STAGE ${String(i + 1).padStart(2, '0')} / ${String(data.stages.length).padStart(2, '0')}</div>
                        <h3 class="route-stage-name">${escapeHtml(stage.name)}</h3>
                        <div class="route-stage-en">${escapeHtml(stage.nameEn)}</div>
                        <div class="route-stage-side-meta">
                            <span>建議時程　<b>${escapeHtml(stage.duration)}</b></span>
                            ${stage.benchmark ? `<span>對應水準　<b>${escapeHtml(stage.benchmark)}</b></span>` : ''}
                        </div>
                    </div>
                    <div>
                        <span class="lv lv-solid" data-lv="${stage.id}">${levelNames[stage.id] || stage.name}</span>
                        <p class="route-goal" style="margin-top:14px">${escapeHtml(stage.goal || stage.description)}</p>
                        <p class="route-desc">${escapeHtml(stage.description)}</p>
                        <div class="route-covers">
                            <div class="route-covers-cap">本段橫跨的能力域</div>
                            <div class="chips">${chips}</div>
                        </div>
                        <div class="route-foot">
                            <span>${stage.topics.length} 個教學主題</span>
                            ${stage.mapItemCount ? `<span>涵蓋地圖 ${stage.mapItemCount} 個知識單元</span>` : ''}
                            <span>${stage.resources.length} 份學習資源</span>
                            <span class="route-enter">進入本段 <span>→</span></span>
                        </div>
                    </div>
                </section>
            `;
        }).join('');

        const introBlocks = data.introduction ? renderContentBlocks(data.introduction) : '';

        return `
            <div class="route-lead">
                <h2 class="route-lead-title">從地圖到路線</h2>
                <p class="route-lead-desc">${escapeHtml(route.intro || '')}</p>
            </div>
            <div class="route-strategy">${escapeHtml(route.strategy || '')}</div>
            <div>${stages}</div>
            <div style="margin-top:96px">
                <div class="section-label">Appendix</div>
                <h3 class="route-lead-title" style="font-size:30px;margin-bottom:28px">分段的依據</h3>
                ${introBlocks}
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
                <h3 class="res-group-title">${typeNames[type] || type}</h3>
                ${list.map(r => `
                    <div class="res-item">
                        <div>
                            <div class="res-title">${escapeHtml(r.title)}</div>
                            <div class="res-desc">${escapeHtml(r.description)}</div>
                            <div class="res-stage-tag">${escapeHtml(r.stage)}</div>
                            ${r.url ? `<a class="res-link" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.url)}</a>` : ''}
                        </div>
                        <span class="res-type">${escapeHtml(r.type)}</span>
                    </div>
                `).join('')}
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
                    <div class="topic-num">${String(i + 1).padStart(2, '0')} / ${String(stage.topics.length).padStart(2, '0')}</div>
                    <h2 class="topic-title">${escapeHtml(t.name)}</h2>
                    <div class="topic-en">${escapeHtml(t.nameEn)}</div>
                </div>
                <div>${renderContentBlocks(t.content)}</div>
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
                <span class="lv lv-solid" data-lv="${stage.id}">${levelNames[stage.id] || ''}</span>
                <h1 class="stage-detail-title rise">${escapeHtml(stage.name)}</h1>
                <div class="stage-detail-en rise d1">${escapeHtml(stage.nameEn)}</div>
                <div class="stage-detail-meta rise d2">
                    <span>建議時程 <b>${escapeHtml(stage.duration)}</b></span>
                    ${stage.benchmark ? `<span>對應水準 <b>${escapeHtml(stage.benchmark)}</b></span>` : ''}
                    <span>教學主題 <b>${stage.topics.length}</b></span>
                    ${stage.mapItemCount ? `<span>涵蓋知識單元 <b>${stage.mapItemCount}</b></span>` : ''}
                </div>
                ${stage.goal ? `<p class="stage-detail-goal rise d2">${escapeHtml(stage.goal)}</p>` : ''}
                <p class="stage-detail-desc rise d3">${escapeHtml(stage.description)}</p>
                ${chips ? `<div class="route-covers"><div class="route-covers-cap">本段橫跨的能力域</div><div class="chips">${chips}</div></div>` : ''}
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
                <div class="empty-title">Not found</div>
                <p class="empty-desc">找不到這條路線。</p>
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
                    return `<div class="cb-tip"><span class="cb-tip-icon">◆</span><span>${escapeHtml(block.value)}</span></div>`;
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
