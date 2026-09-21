'use strict';

/**
 * TUTORIAL CONTEXTUAL
 * Apresenta sete passos sobre a interface, preservando foco e navegação por
 * teclado. O marcador local impede repetição automática, mas permite replay.
 */

class TutorialManager {
    static STORAGE_KEY = 'atomic_idle_tutorial_completed';

    constructor() {
        this.overlay = document.getElementById('tutorial-overlay');
        this.card = document.getElementById('tutorial-card');
        this.spotlight = document.getElementById('tutorial-spotlight');
        this.text = document.getElementById('tutorial-text');
        this.progress = document.getElementById('tutorial-progress');
        this.nextButton = document.getElementById('btn-tutorial-next');
        this.helpButton = document.getElementById('btn-open-tutorial');
        this.avatar = document.getElementById('tutorial-avatar');
        this.speaker = document.getElementById('tutorial-speaker');
        this.role = document.getElementById('tutorial-role');
        this.hud = document.getElementById('screen-hud');
        this.stepIndex = 0;
        this.active = false;
        this.startedAsReplay = false;
        this.previousFocus = null;
        this.resizeFrame = 0;
        this.abortController = new AbortController();
        this.steps = [
            { target: '#panel-accelerator', text: 'tutorial_1' },
            { target: '#panel-fusion', text: 'tutorial_2' },
            { target: '#panel-upgrades', text: 'tutorial_3' },
            { target: '.box-missions-primary', text: 'tutorial_4' },
            { target: '.box-missions-secondary', text: 'tutorial_5' },
            { target: '#panel-shop', text: 'tutorial_6' },
            { target: '#fusion-slots-container', text: 'tutorial_7' }
        ];
        this.bindEvents();
        this.loadCharacter();
        this.refreshLanguage();
    }

    storageGet() {
        if (window.AtomicStorage) return window.AtomicStorage.get(TutorialManager.STORAGE_KEY);
        try { return localStorage.getItem(TutorialManager.STORAGE_KEY); }
        catch (error) { console.warn('[Combinações Atômicas][tutorial storage]', error); return null; }
    }

    storageSet() {
        if (window.AtomicStorage) return window.AtomicStorage.set(TutorialManager.STORAGE_KEY, 'true');
        try { localStorage.setItem(TutorialManager.STORAGE_KEY, 'true'); return true; }
        catch (error) { console.warn('[Combinações Atômicas][tutorial storage]', error); return false; }
    }

    async loadCharacter() {
        try {
            const character = await CharacterRegistry.get('01');
            this.avatar.src = character.image;
            this.avatar.alt = i18n.currentLang === 'pt' ? `Retrato de ${character.name}` : `Portrait of ${character.name}`;
            this.speaker.textContent = character.name.toUpperCase();
            this.role.textContent = i18n.currentLang === 'pt' ? character.role : i18n.t('speaker_role');
        } catch (error) {
            console.warn('[Combinações Atômicas][tutorial] Falha ao carregar a personagem.', error);
        }
    }

    bindEvents() {
        const signal = this.abortController.signal;
        this.nextButton?.addEventListener('click', () => this.advance(), { signal });
        this.helpButton?.addEventListener('click', () => this.start(true), { signal });
        window.addEventListener('resize', () => {
            cancelAnimationFrame(this.resizeFrame);
            this.resizeFrame = requestAnimationFrame(() => this.positionCurrentStep());
        }, { signal });
        window.addEventListener('atomic-language-change', () => this.refreshLanguage(), { signal });
        document.addEventListener('keydown', event => {
            if (!this.active || event.key !== 'Tab') return;
            event.preventDefault();
            this.nextButton.focus();
        }, { signal });
    }

    maybeStart() {
        this.helpButton?.classList.remove('hidden');
        if (!this.storageGet()) this.start(false);
        else setTimeout(() => window.discoveryController?.maybePresentHydrogen(), 0);
    }

    start(replay = false) {
        if (!this.overlay || this.active) return;
        this.active = true;
        this.startedAsReplay = replay;
        this.stepIndex = 0;
        this.previousFocus = document.activeElement;
        this.overlay.classList.remove('hidden');
        this.helpButton.classList.add('hidden');
        if (this.hud) this.hud.inert = true;
        this.renderStep();
        this.nextButton.focus({ preventScroll: true });
    }

    advance() {
        if (!this.active) return;
        if (this.stepIndex < this.steps.length - 1) {
            this.stepIndex += 1;
            this.renderStep();
            return;
        }
        this.finish();
    }

    finish() {
        this.storageSet();
        this.active = false;
        this.overlay.classList.add('hidden');
        this.helpButton.classList.remove('hidden');
        if (this.hud) this.hud.inert = false;
        const focusTarget = this.startedAsReplay && this.previousFocus instanceof HTMLElement
            ? this.previousFocus : document.getElementById('accelerator-canvas');
        focusTarget?.focus({ preventScroll: true });
        document.getElementById('game-status').textContent = i18n.currentLang === 'pt'
            ? 'Tutorial concluído. O laboratório está pronto.'
            : 'Tutorial complete. The laboratory is ready.';
        window.dispatchEvent(new CustomEvent('atomic-tutorial-complete', {
            detail: { replay: this.startedAsReplay, focusTarget }
        }));
    }

    renderStep() {
        const step = this.steps[this.stepIndex];
        this.text.textContent = i18n.t(step.text);
        this.progress.textContent = `${this.stepIndex + 1} / ${this.steps.length}`;
        this.nextButton.textContent = i18n.t(this.stepIndex === this.steps.length - 1 ? 'tutorial_finish' : 'tutorial_next');
        this.positionCurrentStep();
    }

    refreshLanguage() {
        if (this.helpButton) {
            const label = i18n.t('tutorial_help_label');
            this.helpButton.setAttribute('aria-label', label);
            this.helpButton.title = label;
        }
        if (this.active) this.renderStep();
        this.loadCharacter();
    }

    positionCurrentStep() {
        if (!this.active || !this.card || !this.spotlight) return;
        const target = document.querySelector(this.steps[this.stepIndex].target);
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const margin = 8;
        this.spotlight.style.left = `${Math.max(margin, rect.left - 4)}px`;
        this.spotlight.style.top = `${Math.max(margin, rect.top - 4)}px`;
        this.spotlight.style.width = `${Math.min(innerWidth - margin * 2, rect.width + 8)}px`;
        this.spotlight.style.height = `${Math.min(innerHeight - margin * 2, rect.height + 8)}px`;

        const cardWidth = Math.min(460, innerWidth - 24);
        const estimatedHeight = Math.min(210, innerHeight - 24);
        const rightSpace = innerWidth - rect.right;
        const leftSpace = rect.left;
        let left;
        let top;
        let side;
        if (rightSpace >= cardWidth + 20) {
            left = rect.right + 14;
            top = rect.top + rect.height / 2 - estimatedHeight / 2;
            side = 'left';
        } else if (leftSpace >= cardWidth + 20) {
            left = rect.left - cardWidth - 14;
            top = rect.top + rect.height / 2 - estimatedHeight / 2;
            side = 'right';
        } else if (rect.bottom + estimatedHeight + 20 < innerHeight) {
            left = rect.left + rect.width / 2 - cardWidth / 2;
            top = rect.bottom + 14;
            side = 'top';
        } else {
            left = rect.left + rect.width / 2 - cardWidth / 2;
            top = rect.top - estimatedHeight - 14;
            side = 'bottom';
        }
        this.card.style.width = `${cardWidth}px`;
        this.card.style.left = `${Math.max(12, Math.min(innerWidth - cardWidth - 12, left))}px`;
        this.card.style.top = `${Math.max(12, Math.min(innerHeight - estimatedHeight - 12, top))}px`;
        this.card.dataset.arrow = side;
    }

    destroy() {
        cancelAnimationFrame(this.resizeFrame);
        this.abortController.abort();
        if (this.hud) this.hud.inert = false;
        this.overlay?.classList.add('hidden');
        this.active = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.tutorialManager = new TutorialManager();
});
