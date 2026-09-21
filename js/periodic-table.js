'use strict';

/**
 * TABELA PERIÓDICA VITALÍCIA
 * Posiciona os 118 elementos na grade científica, mascara os não descobertos
 * e calcula insígnias sem alterar o estado econômico da rodada.
 */

const PERIODIC_CATEGORIES = Object.freeze({
    alkali: Object.freeze([3, 11, 19, 37, 55, 87]),
    alkaline: Object.freeze([4, 12, 20, 38, 56, 88]),
    transition: Object.freeze([...Array.from({ length: 10 }, (_, i) => 21 + i), ...Array.from({ length: 10 }, (_, i) => 39 + i), ...Array.from({ length: 9 }, (_, i) => 72 + i), ...Array.from({ length: 9 }, (_, i) => 104 + i)]),
    post_transition: Object.freeze([13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116]),
    metalloid: Object.freeze([5, 14, 32, 33, 51, 52]),
    nonmetal: Object.freeze([1, 6, 7, 8, 15, 16, 34]),
    halogen: Object.freeze([9, 17, 35, 53, 85, 117]),
    noble: Object.freeze([2, 10, 18, 36, 54, 86, 118]),
    lanthanide: Object.freeze(Array.from({ length: 15 }, (_, i) => 57 + i)),
    actinide: Object.freeze(Array.from({ length: 15 }, (_, i) => 89 + i))
});

const PERIODIC_CATEGORY_ORDER = Object.freeze(Object.keys(PERIODIC_CATEGORIES));
const PERIODIC_CATEGORY_BY_Z = Object.freeze(Object.fromEntries(PERIODIC_CATEGORY_ORDER.flatMap(key => PERIODIC_CATEGORIES[key].map(z => [z, key]))));

const PERIOD_ROWS = Object.freeze([
    [1, 2],
    [3, 4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17, 18],
    Array.from({ length: 18 }, (_, i) => 19 + i),
    Array.from({ length: 18 }, (_, i) => 37 + i)
]);

function periodicPosition(z) {
    if (z === 1) return { row: 1, column: 1, period: 1, group: 1 };
    if (z === 2) return { row: 1, column: 18, period: 1, group: 18 };
    if (z >= 3 && z <= 10) { const columns = [1, 2, 13, 14, 15, 16, 17, 18]; return { row: 2, column: columns[z - 3], period: 2, group: columns[z - 3] }; }
    if (z >= 11 && z <= 18) { const columns = [1, 2, 13, 14, 15, 16, 17, 18]; return { row: 3, column: columns[z - 11], period: 3, group: columns[z - 11] }; }
    if (z >= 19 && z <= 36) return { row: 4, column: z - 18, period: 4, group: z - 18 };
    if (z >= 37 && z <= 54) return { row: 5, column: z - 36, period: 5, group: z - 36 };
    if (z === 55 || z === 56) return { row: 6, column: z - 54, period: 6, group: z - 54 };
    if (z >= 57 && z <= 71) return { row: 8, column: z - 53, period: 6, group: 0 };
    if (z >= 72 && z <= 86) return { row: 6, column: z - 68, period: 6, group: z - 68 };
    if (z === 87 || z === 88) return { row: 7, column: z - 86, period: 7, group: z - 86 };
    if (z >= 89 && z <= 103) return { row: 9, column: z - 85, period: 7, group: 0 };
    if (z >= 104 && z <= 118) return { row: 7, column: z - 100, period: 7, group: z - 100 };
    return null;
}

function completedPeriodicCategories(discovered) {
    const known = discovered instanceof Set ? discovered : new Set(discovered || []);
    return PERIODIC_CATEGORY_ORDER.filter(key => PERIODIC_CATEGORIES[key].every(z => known.has(z)));
}

class PeriodicTableController {
    constructor() {
        this.overlay = document.getElementById('periodic-overlay');
        this.openButton = document.getElementById('btn-open-periodic-table');
        this.closeButton = document.getElementById('btn-close-periodic-table');
        this.grid = document.getElementById('periodic-grid');
        this.achievementList = document.getElementById('periodic-achievement-list');
        this.abortController = new AbortController();
        this.cells = new Map();
        this.active = false;
        this.inspectionFocus = null;
        this.completed = new Set();
        this.build();
        this.bind();
        this.sync(false);
        this.initialSyncTimer = setTimeout(() => this.sync(false), 180);
    }

    get discovered() {
        return window.missionManager?.discoveredElementsLifetime instanceof Set
            ? window.missionManager.discoveredElementsLifetime
            : new Set([1]);
    }

    text(key, fallback) { return typeof i18n !== 'undefined' ? i18n.t(key) : fallback; }

    build() {
        if (!this.grid || !this.achievementList) return;
        this.grid.textContent = '';
        for (let group = 1; group <= 18; group++) {
            const label = document.createElement('span');
            label.className = 'periodic-group-label';
            label.style.gridColumn = String(group);
            label.style.gridRow = '1';
            label.textContent = String(group);
            label.setAttribute('aria-hidden', 'true');
            this.grid.append(label);
        }
        const placeholders = [[7, 3, '57–71'], [8, 3, '89–103']];
        for (const [row, column, label] of placeholders) {
            const node = document.createElement('span');
            node.className = 'periodic-series-placeholder';
            node.style.gridRow = String(row);
            node.style.gridColumn = String(column);
            node.textContent = label;
            node.setAttribute('aria-hidden', 'true');
            this.grid.append(node);
        }
        for (let z = 1; z <= 118; z++) {
            const atom = ATOM_REGISTRY[z], position = periodicPosition(z);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `periodic-element is-locked category-${PERIODIC_CATEGORY_BY_Z[z]}`;
            button.dataset.z = String(z);
            button.style.gridRow = String(position.row + 1);
            button.style.gridColumn = String(position.column);
            button.disabled = true;
            button.innerHTML = '<span class="periodic-unknown" aria-hidden="true">?</span>';
            this.grid.append(button);
            this.cells.set(z, button);
        }
        for (const key of PERIODIC_CATEGORY_ORDER) {
            const badge = document.createElement('div');
            badge.className = `periodic-achievement category-${key}`;
            badge.dataset.category = key;
            badge.innerHTML = '<span class="achievement-star" aria-hidden="true">☆</span><span class="achievement-copy"><strong></strong><small></small></span>';
            this.achievementList.append(badge);
        }
        const finalBadge = document.createElement('div');
        finalBadge.className = 'periodic-achievement achievement-master';
        finalBadge.dataset.category = 'master';
        finalBadge.innerHTML = '<span class="achievement-star" aria-hidden="true">☆</span><span class="achievement-copy"><strong></strong><small></small></span>';
        this.achievementList.append(finalBadge);
    }

    bind() {
        const options = { signal: this.abortController.signal };
        this.openButton?.addEventListener('click', () => this.open(), options);
        this.closeButton?.addEventListener('click', () => this.close(), options);
        this.grid?.addEventListener('click', event => {
            const cell = event.target.closest('.periodic-element:not(:disabled)');
            if (cell) this.inspect(Number(cell.dataset.z), cell);
        }, options);
        this.overlay?.addEventListener('keydown', event => this.onKeydown(event), options);
        window.addEventListener('atomic-discovery-updated', () => this.sync(true), options);
        window.addEventListener('atomic-save-applied', () => this.sync(false), options);
        window.addEventListener('atomic-language-change', () => this.sync(false), options);
    }

    sync(announce = false) {
        const known = this.discovered;
        for (let z = 1; z <= 118; z++) {
            const cell = this.cells.get(z), atom = ATOM_REGISTRY[z], unlocked = known.has(z);
            if (!cell) continue;
            if (unlocked) {
                cell.disabled = false;
                cell.classList.replace('is-locked', 'is-discovered');
                cell.innerHTML = `<span class="periodic-z">${z}</span><span class="periodic-symbol">${atom.symbol}</span><img src="${atom.imagePath}" alt=""><span class="periodic-name">${atom.namePt}</span><span class="periodic-mass">${atom.massDisplay}</span>`;
                const img = cell.querySelector('img');
                img.onerror = () => { img.onerror = null; img.src = atomTextures.generateFallback(atom); };
                cell.setAttribute('aria-label', `${atom.namePt}, ${atom.symbol}, número atômico ${z}, massa ${atom.massDisplay}. Abrir ficha.`);
            } else {
                cell.disabled = true;
                cell.classList.remove('is-discovered');
                cell.classList.add('is-locked');
                cell.innerHTML = '<span class="periodic-unknown" aria-hidden="true">?</span>';
                const p = periodicPosition(z);
                cell.setAttribute('aria-label', `Elemento ainda não descoberto, período ${p.period}${p.group ? `, grupo ${p.group}` : ''}.`);
            }
        }
        const complete = new Set(completedPeriodicCategories(known));
        const newlyCompleted = [...complete].filter(key => !this.completed.has(key));
        this.completed = complete;
        const master = known.size >= 118;
        this.syncButton(known, complete, master);
        document.getElementById('periodic-discovery-count').textContent = `${known.size} / 118`;
        document.getElementById('periodic-achievement-count').textContent = `${complete.size + (master ? 1 : 0)} / 11 ★`;
        document.getElementById('periodic-progress-fill').style.width = `${known.size / 118 * 100}%`;
        for (const key of PERIODIC_CATEGORY_ORDER) this.renderAchievement(key, known, complete.has(key));
        this.renderAchievement('master', known, master);
        this.openButton?.setAttribute('aria-label', `${this.text('periodic_open', 'Abrir Tabela Periódica das Descobertas')}. ${known.size} de 118 elementos; ${complete.size + (master ? 1 : 0)} de 11 conquistas.`);
        if (announce && newlyCompleted.length) {
            this.openButton?.classList.add('has-new-achievement');
            const label = this.categoryLabel(newlyCompleted[0]);
            window.missionManager?.showToast?.(`★ Conquista da tabela: ${label}!`);
        }
    }

    syncButton(known = this.discovered, complete = new Set(completedPeriodicCategories(known)), master = known.size >= 118) {
        const elementCount = document.getElementById('periodic-button-elements');
        const badgeCount = document.getElementById('periodic-button-badges');
        if (elementCount) elementCount.textContent = `${known.size}/118`;
        if (badgeCount) badgeCount.textContent = `★ ${complete.size + (master ? 1 : 0)}/11`;
        this.openButton?.setAttribute('aria-label', `${this.text('periodic_open', 'Abrir Tabela Periódica das Descobertas')}. ${known.size} de 118 elementos; ${complete.size + (master ? 1 : 0)} de 11 conquistas.`);
    }

    categoryLabel(key) {
        const labels = {
            alkali: ['Metais alcalinos', 'Alkali metals'], alkaline: ['Alcalino-terrosos', 'Alkaline earth metals'],
            transition: ['Metais de transição', 'Transition metals'], post_transition: ['Metais pós-transição', 'Post-transition metals'],
            metalloid: ['Semimetais', 'Metalloids'], nonmetal: ['Outros não metais', 'Other nonmetals'],
            halogen: ['Halogênios', 'Halogens'], noble: ['Gases nobres', 'Noble gases'],
            lanthanide: ['Lantanídeos', 'Lanthanides'], actinide: ['Actinídeos', 'Actinides'],
            master: ['Tabela completa', 'Complete table']
        };
        const languageIndex = typeof i18n !== 'undefined' && i18n.currentLang === 'en' ? 1 : 0;
        return labels[key][languageIndex];
    }

    renderAchievement(key, known, complete) {
        const badge = this.achievementList?.querySelector(`[data-category="${key}"]`);
        if (!badge) return;
        const required = key === 'master' ? Array.from({ length: 118 }, (_, i) => i + 1) : PERIODIC_CATEGORIES[key];
        const current = required.filter(z => known.has(z)).length;
        badge.classList.toggle('is-complete', complete);
        badge.querySelector('.achievement-star').textContent = complete ? '★' : '☆';
        badge.querySelector('strong').textContent = this.categoryLabel(key);
        badge.querySelector('small').textContent = complete ? this.text('periodic_complete', 'COMPLETO') : `${current}/${required.length}`;
        badge.setAttribute('aria-label', `${this.categoryLabel(key)}: ${complete ? this.text('periodic_complete', 'completo') : `${current} de ${required.length}`}`);
    }

    open() {
        if (!this.overlay || this.active) return;
        this.sync(false);
        this.active = true;
        this.openButton.classList.remove('has-new-achievement');
        document.getElementById('screen-hud').inert = true;
        const help = document.getElementById('btn-open-tutorial');
        if (help) help.inert = true;
        this.overlay.classList.remove('hidden');
        this.closeButton.focus({ preventScroll: true });
    }

    close() {
        if (!this.active) return;
        this.active = false;
        this.overlay.classList.add('hidden');
        document.getElementById('screen-hud').inert = false;
        const help = document.getElementById('btn-open-tutorial');
        if (help) help.inert = false;
        this.openButton.focus({ preventScroll: true });
    }

    inspect(z, cell) {
        if (!window.discoveryController?.inspect(z, cell, () => this.resumeFromDiscovery())) return;
        this.inspectionFocus = cell;
        this.overlay.classList.add('hidden');
    }

    resumeFromDiscovery() {
        this.sync(false);
        this.overlay.classList.remove('hidden');
        requestAnimationFrame(() => this.inspectionFocus?.focus({ preventScroll: true }));
    }

    onKeydown(event) {
        if (!this.active || this.overlay.classList.contains('hidden')) return;
        if (event.key === 'Escape') { event.preventDefault(); this.close(); return; }
        const cell = event.target.closest?.('.periodic-element:not(:disabled)');
        if (cell && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            const unlocked = [...this.grid.querySelectorAll('.periodic-element:not(:disabled)')];
            const current = unlocked.indexOf(cell);
            const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' ? -18 : 18;
            unlocked[Math.max(0, Math.min(unlocked.length - 1, current + step))]?.focus();
            return;
        }
        if (event.key !== 'Tab') return;
        const focusable = [...this.overlay.querySelectorAll('button:not(:disabled)')];
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    destroy() {
        clearTimeout(this.initialSyncTimer);
        this.abortController.abort();
        this.overlay?.classList.add('hidden');
        document.getElementById('screen-hud').inert = false;
    }
}

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => { window.periodicTableController = new PeriodicTableController(); });
if (typeof module !== 'undefined' && module.exports) module.exports = { PERIODIC_CATEGORIES, PERIODIC_CATEGORY_ORDER, PERIODIC_CATEGORY_BY_Z, periodicPosition, completedPeriodicCategories };
