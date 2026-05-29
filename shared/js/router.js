/**
 * Yu-Dojo Router
 * Hash-based SPA navigation with skill-based routing
 */
const Router = (() => {
    let skillsData = {};
    const BASE_PATH = '/yu-dojo';

    const skillMeta = {
        'chinese-chess': { name: '象棋', nameEn: 'Chinese Chess', icon: '♞', accent: '#f97316', desc: '千年兵法，方寸之間的智慧博弈' },
        'gomoku': { name: '五子棋', nameEn: 'Gomoku', icon: '⚫', accent: '#58a6ff', desc: '黑白之間，連珠成陣的計算藝術' },
        'photography': { name: '攝影', nameEn: 'Photography', icon: '◎', accent: '#bc8cff', desc: '光影捕手，用鏡頭凝結世界的瞬間' }
    };

    async function init() {
        await loadAllSkillData();
        window.addEventListener('hashchange', handleRoute);
        handleRoute();
    }

    async function loadAllSkillData() {
        const skills = ['chinese-chess', 'gomoku', 'photography'];
        const promises = skills.map(async (id) => {
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

        if (parts.length === 0) {
            renderHome();
        } else if (parts[0] === 'skill' && parts[1]) {
            const skillId = parts[1];
            const tab = parts[2] || 'roadmap';
            const stageId = parts[3] || null;
            if (stageId) {
                renderStageDetail(skillId, stageId);
            } else {
                renderSkillPage(skillId, tab);
            }
        } else {
            renderHome();
        }
    }

    function navigate(path) {
        window.location.hash = path;
    }

    function renderTopbar(breadcrumbs) {
        const crumbs = breadcrumbs ? breadcrumbs.map((b, i) => {
            if (i === breadcrumbs.length - 1) {
                return `<span class="breadcrumb-current">${b.name}</span>`;
            }
            return `<a href="javascript:void(0)" onclick="Router.navigate('${b.path}')">${b.name}</a><span class="breadcrumb-sep">/</span>`;
        }).join('') : '';

        return `
            <div class="topbar">
                <span class="site-logo" onclick="Router.navigate('')">DOJO</span>
                ${crumbs ? `<nav class="breadcrumb">${crumbs}</nav>` : ''}
            </div>
        `;
    }

    function renderHome() {
        const cards = Object.entries(skillMeta).map(([id, meta], i) => {
            const data = skillsData[id];
            const stageCount = data ? data.stages.length : 0;
            return `
                <div class="skill-card fade-in fade-in-delay-${i + 1}" 
                     style="--card-accent: ${meta.accent}" 
                     onclick="Router.navigate('skill/${id}')">
                    <span class="skill-card-icon">${meta.icon}</span>
                    <div class="skill-card-title">${meta.name}</div>
                    <div class="skill-card-subtitle">${meta.nameEn}</div>
                    <div class="skill-card-desc">${meta.desc}</div>
                    <div class="skill-card-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <span class="progress-label">${stageCount} STAGES</span>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('app').innerHTML = `
            ${renderTopbar()}
            <div class="particles" id="particles"></div>
            <div class="home-container">
                <div class="home-level-badge">LV.1 — Apprentice</div>
                <h1 class="home-title">Yu-Dojo</h1>
                <p class="home-subtitle">選擇你的修煉之道</p>
                <div class="skills-grid">
                    ${cards}
                </div>
            </div>
        `;
        initParticles();
    }

    function renderSkillPage(skillId, activeTab) {
        const meta = skillMeta[skillId];
        const data = skillsData[skillId];
        if (!meta || !data) { renderHome(); return; }

        const tabs = [
            { id: 'roadmap', name: '修煉路線' },
            { id: 'resources', name: '學習資源' }
        ];

        const tabsHtml = tabs.map(t => `
            <button class="skill-tab ${t.id === activeTab ? 'active' : ''}" 
                    onclick="Router.navigate('skill/${skillId}/${t.id}')">
                ${t.name}
            </button>
        `).join('');

        let contentHtml = '';
        if (activeTab === 'roadmap') {
            contentHtml = renderRoadmap(skillId, data);
        } else if (activeTab === 'resources') {
            contentHtml = renderAllResources(data);
        }

        document.getElementById('app').innerHTML = `
            ${renderTopbar([
                { name: meta.name, path: `skill/${skillId}` }
            ])}
            <div class="skill-page" style="--card-accent: ${meta.accent}">
                <div class="skill-header">
                    <div class="skill-header-top">
                        <span class="skill-header-icon">${meta.icon}</span>
                        <h1>${data.name}</h1>
                    </div>
                    <p>${data.description}</p>
                </div>
                <div class="skill-tabs">${tabsHtml}</div>
                <div class="skill-content fade-in">${contentHtml}</div>
            </div>
        `;
    }

    function renderRoadmap(skillId, data) {
        const stageColors = ['#58a6ff', '#7ee787', '#d4a037', '#f97316'];
        const stages = data.stages.map((stage, i) => `
            <div class="stage-card" style="--stage-color: ${stageColors[i] || stageColors[0]}" 
                 onclick="Router.navigate('skill/${skillId}/stage/${stage.id}')">
                <div class="stage-card-header">
                    <span class="stage-card-title">${stage.name}</span>
                    <span class="stage-card-badge">${stage.xp} XP</span>
                </div>
                <div class="stage-card-desc">${stage.description}</div>
                <div class="stage-card-meta">
                    <span>${stage.topics.length} 個主題</span>
                    <span>${stage.resources.length} 個資源</span>
                    <span>${stage.duration}</span>
                </div>
            </div>
        `).join('');

        return `<div class="roadmap">${stages}</div>`;
    }

    function renderAllResources(data) {
        const allResources = data.stages.flatMap(stage => 
            stage.resources.map(r => ({ ...r, stage: stage.name }))
        );

        const grouped = {};
        allResources.forEach(r => {
            if (!grouped[r.type]) grouped[r.type] = [];
            grouped[r.type].push(r);
        });

        const typeNames = { book: '書籍', website: '網站', video: '影片', app: '工具/軟體', platform: '平台' };

        let html = '';
        Object.entries(grouped).forEach(([type, resources]) => {
            html += `
                <div class="resources-section" style="margin-bottom: 2rem;">
                    <h3>${typeNames[type] || type}</h3>
                    <div class="resources-grid">
                        ${resources.map(r => renderResourceCard(r)).join('')}
                    </div>
                </div>
            `;
        });
        return html;
    }

    function renderStageDetail(skillId, stageId) {
        const meta = skillMeta[skillId];
        const data = skillsData[skillId];
        if (!meta || !data) { renderHome(); return; }

        const stage = data.stages.find(s => s.id === stageId);
        if (!stage) { navigate(`skill/${skillId}`); return; }

        const topicsHtml = stage.topics.map(t => `
            <div class="topic-card">
                <div class="topic-card-name">${t.name}</div>
                <div class="topic-card-name-en">${t.nameEn}</div>
                <div class="topic-card-desc">${t.description}</div>
            </div>
        `).join('');

        const resourcesHtml = stage.resources.map(r => renderResourceCard(r)).join('');

        document.getElementById('app').innerHTML = `
            ${renderTopbar([
                { name: meta.name, path: `skill/${skillId}` },
                { name: stage.name, path: `skill/${skillId}/stage/${stageId}` }
            ])}
            <div class="skill-page" style="--card-accent: ${meta.accent}">
                <div class="stage-detail">
                    <div class="stage-hero">
                        <h2>${stage.name} — ${stage.nameEn}</h2>
                        <div class="stage-hero-meta">
                            <span>${stage.duration}</span>
                            <span class="xp-badge">+${stage.xp} XP</span>
                            <span>${stage.topics.length} Topics</span>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.95rem;">${stage.description}</p>
                    
                    <div class="topics-section">
                        <h3>學習主題</h3>
                        <div class="topics-grid">${topicsHtml}</div>
                    </div>

                    <div class="resources-section">
                        <h3>推薦資源</h3>
                        <div class="resources-grid">${resourcesHtml}</div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderResourceCard(r) {
        const linkHtml = r.url ? `<a class="resource-card-link" href="${r.url}" target="_blank" rel="noopener">${r.url}</a>` : '';
        return `
            <div class="resource-card">
                <div class="resource-card-header">
                    <span class="resource-card-title">${r.title}</span>
                    <span class="resource-card-type" data-type="${r.type}">${r.type}</span>
                </div>
                <div class="resource-card-desc">${r.description}</div>
                ${linkHtml}
            </div>
        `;
    }

    function initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = Math.random() * 8 + 's';
            p.style.animationDuration = (6 + Math.random() * 6) + 's';
            container.appendChild(p);
        }
    }

    return { init, navigate };
})();

document.addEventListener('DOMContentLoaded', () => Router.init());
