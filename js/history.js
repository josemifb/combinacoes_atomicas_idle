'use strict';

/**
 * Controlador da coleção histórica.
 *
 * Os textos vêm dos Markdown convertidos em HISTORY_FRAGMENTS. O controlador
 * cuida apenas da apresentação e dos IDs persistentes; a economia do prestígio
 * continua pertencendo ao MissionManager.
 */
class HistoryController {
    constructor(fragments = globalThis.HISTORY_FRAGMENTS || []) {
        this.fragments = [...fragments].sort((a, b) => a.order - b.order);
        this.currentFragment = null;
        this.currentStep = 0;
        this.returnFocus = null;
        // Guarda a posição desktop da loja enquanto ela é promovida a modal móvel.
        this.mobileMarketHome = null;
        this.abort = new AbortController();
        this.bind();
        this.installPrestigeHook();
        this.installProgressUiHook();
        this.sync(true);
    }

    /** Garante que saves novos e antigos possuam coleções Set utilizáveis. */
    get state() {
        const mission = window.missionManager;
        if (!mission) return null;
        if (!(mission.historyUnlockedIds instanceof Set)) mission.historyUnlockedIds = new Set(mission.historyUnlockedIds || []);
        if (!(mission.historySeenIds instanceof Set)) mission.historySeenIds = new Set(mission.historySeenIds || []);
        if (mission.pendingHistoryFragmentId === undefined) mission.pendingHistoryFragmentId = null;
        return mission;
    }

    bind() {
        const options = { signal: this.abort.signal };
        document.getElementById('btn-open-history')?.addEventListener('click', event => this.openTimeline(event.currentTarget), options);
        document.getElementById('btn-close-history')?.addEventListener('click', () => this.closeTimeline(), options);
        document.getElementById('btn-close-history-reader')?.addEventListener('click', () => this.closeReader(), options);
        document.getElementById('btn-history-previous')?.addEventListener('click', () => this.showStep(this.currentStep - 1), options);
        document.getElementById('btn-history-next')?.addEventListener('click', () => this.advance(), options);
        document.getElementById('btn-history-reward-later')?.addEventListener('click', () => this.dismissReward(false), options);
        document.getElementById('btn-history-reward-now')?.addEventListener('click', () => this.dismissReward(true), options);
        document.getElementById('btn-prestige-center')?.addEventListener('click', () => window.missionManager?.triggerPrestigeAscension(), options);
        document.getElementById('btn-open-mobile-market')?.addEventListener('click', () => this.toggleMobileMarket(true), options);
        document.getElementById('btn-close-mobile-market')?.addEventListener('click', () => this.toggleMobileMarket(false), options);
        document.getElementById('mobile-market-backdrop')?.addEventListener('click', () => this.toggleMobileMarket(false), options);
        document.getElementById('btn-mobile-buy-proton')?.addEventListener('click', () => document.getElementById('btn-buy-proton')?.click(), options);
        document.getElementById('panel-shop')?.addEventListener('keydown', event => this.trapMobileMarketFocus(event), options);
        window.addEventListener('resize', () => {
            // Ao voltar ao desktop, devolve imediatamente a loja à coluna original.
            if (!matchMedia('(max-width: 700px)').matches) this.toggleMobileMarket(false);
        }, options);
        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            if (!document.getElementById('history-reader-overlay')?.classList.contains('hidden')) this.closeReader();
            else if (!document.getElementById('history-overlay')?.classList.contains('hidden')) this.closeTimeline();
            else this.toggleMobileMarket(false);
        }, options);
    }

    /** Envolve a função oficial: primeiro prestigia, depois concede uma peça. */
    installPrestigeHook() {
        const prototype = typeof MissionManager !== 'undefined' ? MissionManager.prototype : null;
        if (!prototype || prototype.__historyPrestigeHook) return;
        const original = prototype.triggerPrestigeAscension;
        prototype.triggerPrestigeAscension = function (...args) {
            const before = window.gameEngine?.prestigeLevel || 0;
            const result = original.apply(this, args);
            if ((window.gameEngine?.prestigeLevel || 0) > before) window.historyController?.unlockNext();
            return result;
        };
        prototype.__historyPrestigeHook = true;
    }

    /** Mantém os controles novos sincronizados com o ciclo de HUD legado. */
    installProgressUiHook() {
        const prototype = typeof MissionManager !== 'undefined' ? MissionManager.prototype : null;
        if (!prototype || prototype.__buildOneUiHook) return;
        const original = prototype.updateUpgradesUI;
        prototype.updateUpgradesUI = function (...args) {
            const result = original.apply(this, args);
            queueMicrotask(() => {
                window.atomicSession?.updateModuleUi?.();
                window.historyController?.sync(false);
            });
            return result;
        };
        prototype.__buildOneUiHook = true;
    }

    unlockNext() {
        const state = this.state;
        if (!state) return null;
        const next = this.fragments.find(fragment => !state.historyUnlockedIds.has(fragment.id));
        if (!next) {
            state.pendingHistoryFragmentId = null;
            SaveManager.save();
            state.showToast?.('ACERVO HISTÓRICO COMPLETO!');
            return null;
        }
        state.historyUnlockedIds.add(next.id);
        state.pendingHistoryFragmentId = next.id;
        SaveManager.save();
        this.sync(true);
        this.showReward(next);
        return next;
    }

    sync(showPending = false) {
        const state = this.state;
        if (!state) return;
        const validIds = new Set(this.fragments.map(fragment => fragment.id));
        state.historyUnlockedIds = new Set([...state.historyUnlockedIds].filter(id => validIds.has(id)));
        state.historySeenIds = new Set([...state.historySeenIds].filter(id => state.historyUnlockedIds.has(id)));
        const count = state.historyUnlockedIds.size;
        const unread = [...state.historyUnlockedIds].filter(id => !state.historySeenIds.has(id)).length;
        const buttonCount = document.getElementById('history-button-count');
        const buttonStatus = document.getElementById('history-button-status');
        if (buttonCount) buttonCount.textContent = `${count}/${this.fragments.length}`;
        if (buttonStatus) buttonStatus.textContent = unread ? `${unread} NOVO${unread > 1 ? 'S' : ''}` : 'LINHA DO TEMPO';
        document.getElementById('btn-open-history')?.classList.toggle('has-new-fragment', unread > 0);
        const prestigeReady = state.missionState === 'prestige_ready' && state.playerLevel >= 50;
        document.getElementById('btn-prestige-center')?.classList.toggle('hidden', !prestigeReady);
        const mobileCost = document.getElementById('mobile-proton-cost');
        if (mobileCost) mobileCost.textContent = typeof formatQuantumNumber === 'function' ? formatQuantumNumber(state.getProtonCost()) : state.getProtonCost();
        if (showPending && state.pendingHistoryFragmentId) {
            const pending = this.fragments.find(fragment => fragment.id === state.pendingHistoryFragmentId);
            if (pending) queueMicrotask(() => this.showReward(pending));
        }
    }

    openTimeline(source) {
        this.returnFocus = source || document.activeElement;
        this.renderTimeline();
        document.getElementById('history-overlay')?.classList.remove('hidden');
        document.getElementById('btn-close-history')?.focus();
    }

    closeTimeline() {
        document.getElementById('history-overlay')?.classList.add('hidden');
        this.returnFocus?.focus?.();
    }

    renderTimeline() {
        const state = this.state;
        const timeline = document.getElementById('history-timeline');
        if (!state || !timeline) return;
        timeline.replaceChildren();
        for (const fragment of this.fragments) {
            const unlocked = state.historyUnlockedIds.has(fragment.id);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `history-fragment${unlocked ? ' is-unlocked' : ' is-locked'}${unlocked && !state.historySeenIds.has(fragment.id) ? ' is-new' : ''}`;
            button.disabled = !unlocked;
            button.style.setProperty('--history-image', `url("${ASSET_PATHS.historyImage(fragment.image)}")`);
            button.innerHTML = unlocked
                ? `<span>${String(fragment.order).padStart(2, '0')}</span><strong>${fragment.title}</strong><small>${fragment.period}</small>`
                : `<span>${String(fragment.order).padStart(2, '0')}</span><strong>?</strong><small>FRAGMENTO NÃO RECUPERADO</small>`;
            if (unlocked) button.addEventListener('click', () => this.openReader(fragment));
            timeline.append(button);
        }
        document.getElementById('history-progress').textContent = `${state.historyUnlockedIds.size} / ${this.fragments.length}`;
    }

    openReader(fragment) {
        this.currentFragment = fragment;
        this.currentStep = 0;
        const reader = document.getElementById('history-reader');
        reader.style.setProperty('--history-image', `url("${ASSET_PATHS.historyImage(fragment.image)}")`);
        document.getElementById('history-reader-title').textContent = fragment.title;
        document.getElementById('history-reader-period').textContent = fragment.period;
        document.getElementById('history-reader-overlay').classList.remove('hidden');
        this.showStep(0);
    }

    async showStep(index) {
        const fragment = this.currentFragment;
        if (!fragment) return;
        this.currentStep = Math.max(0, Math.min(fragment.dialogue.length - 1, index));
        const step = fragment.dialogue[this.currentStep];
        let character;
        try { character = await CharacterRegistry.get(step.character); }
        catch (_) { character = await CharacterRegistry.get('01'); character = { ...character, name: `Arquivo histórico · Registro ${step.character}` }; }
        document.getElementById('history-speaker-image').src = character.image;
        document.getElementById('history-speaker-image').alt = character.name;
        document.getElementById('history-speaker-name').textContent = character.name;
        document.getElementById('history-dialogue-text').textContent = step.text;
        document.getElementById('history-reader-step').textContent = `${this.currentStep + 1} / ${fragment.dialogue.length}`;
        document.getElementById('btn-history-previous').disabled = this.currentStep === 0;
        document.getElementById('btn-history-next').textContent = this.currentStep === fragment.dialogue.length - 1 ? 'CONCLUIR ✓' : 'AVANÇAR ▶';
    }

    advance() {
        if (!this.currentFragment) return;
        if (this.currentStep < this.currentFragment.dialogue.length - 1) this.showStep(this.currentStep + 1);
        else this.completeReader();
    }

    completeReader() {
        const state = this.state;
        if (state && this.currentFragment) {
            state.historySeenIds.add(this.currentFragment.id);
            SaveManager.save();
        }
        this.closeReader();
        this.sync(false);
        this.renderTimeline();
    }

    closeReader() {
        document.getElementById('history-reader-overlay')?.classList.add('hidden');
        if (!document.getElementById('history-overlay')?.classList.contains('hidden')) document.getElementById('btn-close-history')?.focus();
    }

    showReward(fragment) {
        document.getElementById('history-reward-name').textContent = fragment.title;
        document.getElementById('history-reward-preview').style.setProperty('--history-image', `url("${ASSET_PATHS.historyImage(fragment.image)}")`);
        document.getElementById('history-reward-overlay').classList.remove('hidden');
        document.getElementById('btn-history-reward-now')?.focus();
    }

    dismissReward(readNow) {
        const state = this.state;
        const fragment = this.fragments.find(item => item.id === state?.pendingHistoryFragmentId);
        if (state) state.pendingHistoryFragmentId = null;
        document.getElementById('history-reward-overlay')?.classList.add('hidden');
        SaveManager.save();
        if (readNow && fragment) { this.openTimeline(); this.openReader(fragment); }
    }

    /**
     * Alterna a loja compacta como um modal real.
     *
     * A loja é temporariamente movida para o body para não herdar recortes e
     * overflow da grade do HUD. Ao fechar, volta ao mesmo nó da coluna desktop.
     */
    toggleMobileMarket(open) {
        const shop = document.getElementById('panel-shop');
        const backdrop = document.getElementById('mobile-market-backdrop');
        const hud = document.getElementById('screen-hud');
        const opener = document.getElementById('btn-open-mobile-market');
        if (!shop) return;

        const shouldOpen = Boolean(open) && matchMedia('(max-width: 700px)').matches;
        if (shouldOpen) {
            if (!this.mobileMarketHome) {
                this.mobileMarketHome = { parent: shop.parentNode, next: shop.nextSibling };
                document.body.append(shop);
            }
            this.returnFocus = opener;
            shop.classList.add('mobile-shop-open');
            shop.setAttribute('role', 'dialog');
            shop.setAttribute('aria-modal', 'true');
            shop.setAttribute('aria-labelledby', 'mobile-market-title');
            backdrop?.classList.remove('hidden');
            backdrop?.setAttribute('aria-hidden', 'false');
            hud?.classList.add('market-modal-open');
            document.body.classList.add('market-scroll-locked');
            opener?.setAttribute('aria-expanded', 'true');
            this.setMarketBackgroundInert(true);
            requestAnimationFrame(() => document.getElementById('btn-close-mobile-market')?.focus());
            return;
        }

        shop.classList.remove('mobile-shop-open');
        shop.removeAttribute('role');
        shop.removeAttribute('aria-modal');
        shop.removeAttribute('aria-labelledby');
        backdrop?.classList.add('hidden');
        backdrop?.setAttribute('aria-hidden', 'true');
        hud?.classList.remove('market-modal-open');
        document.body.classList.remove('market-scroll-locked');
        opener?.setAttribute('aria-expanded', 'false');
        this.setMarketBackgroundInert(false);
        if (this.mobileMarketHome) {
            const { parent, next } = this.mobileMarketHome;
            if (next?.parentNode === parent) parent.insertBefore(shop, next);
            else parent.append(shop);
            this.mobileMarketHome = null;
        }
        if (open === false && this.returnFocus === opener) opener?.focus();
    }

    /** Impede interação acidental com o jogo que está visualmente desfocado. */
    setMarketBackgroundInert(inert) {
        for (const node of document.querySelectorAll('#screen-hud > .hud-topbar, #screen-hud > .hud-workspace')) {
            node.inert = inert;
        }
    }

    /** Mantém Tab e Shift+Tab dentro dos controles da loja aberta. */
    trapMobileMarketFocus(event) {
        if (event.key !== 'Tab' || !event.currentTarget.classList.contains('mobile-shop-open')) return;
        const focusable = [...event.currentTarget.querySelectorAll('button:not(:disabled), [href], select, input')]
            .filter(element => element.getClientRects().length > 0);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    destroy() { this.toggleMobileMarket(false); this.abort.abort(); }
}

document.addEventListener('DOMContentLoaded', () => {
    // A sessão nasce somente quando o HUD abre; o evento abaixo sincroniza o save.
    window.historyController = new HistoryController();
    window.addEventListener('atomic-save-applied', () => window.historyController.sync(true));
});

window.HistoryController = HistoryController;
