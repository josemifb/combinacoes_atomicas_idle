'use strict';

/**
 * FICHAS DE DESCOBERTA
 * Coordena a fila de elementos inéditos, escolhe o pesquisador e monta o card.
 * Somente fusões reais entram na coleção vitalícia; compras nunca descobrem.
 */

const DISCOVERY_DIALOGUES = Object.freeze({
    pt: Object.freeze({
        '01': [
            ({ name }) => `Excelente trabalho! ${name} amplia o alcance estratégico do AURORA.`,
            ({ name, z }) => `Uma nova assinatura foi confirmada: ${name}, com Z=${z}. Registre cada detalhe.`,
            ({ name }) => `Parabéns pela descoberta de ${name}. Este é um marco para todo o laboratório.`
        ],
        '02': [
            ({ name }) => `Olhe só esses dados! A assinatura de ${name} é inequívoca.`,
            ({ symbol, z }) => `Os sensores concordam: ${symbol}, Z=${z}. Uma descoberta perfeitamente consistente.`,
            ({ name }) => `${name} apareceu no espectro. Eu sabia que os dados guardavam uma surpresa.`
        ],
        '03': [
            ({ name }) => `O que é isso? ${name}! Vamos investigar suas relações com a vida e o ambiente.`,
            ({ name }) => `Uma nova descoberta: ${name}. Até um único elemento pode transformar sistemas vivos.`,
            ({ name }) => `Parabéns! ${name} acaba de entrar em nossa linha de pesquisa bioquímica.`
        ],
        '04': [
            ({ name }) => `${name}! Quero ver como este elemento responde à energia e aos campos.`,
            ({ symbol }) => `Temos uma nova leitura, ${symbol}. Isto pode abrir possibilidades tecnológicas incríveis.`,
            ({ name }) => `Que descarga de dados! ${name} foi confirmado pelo AURORA.`
        ],
        '05': [
            ({ name, z }) => `Padrão confirmado para ${name}: Z=${z}. Agora podemos estudar sua estabilidade.`,
            ({ name }) => `Uma nova descoberta! ${name} merece uma análise cuidadosa de seus isótopos.`,
            ({ symbol }) => `${symbol} entrou no registro. Lembre-se: o número atômico identifica o elemento, não o isótopo.`
        ],
        '06': [
            ({ name }) => `${name} entrou no inventário! Quero testar como ele se comporta em sistemas reais.`,
            ({ symbol }) => `Olha só, ${symbol}! Mais uma peça nova para a oficina do AURORA.`,
            ({ name }) => `Descoberta confirmada: ${name}. Já estou pensando no que podemos construir com isso.`
        ],
        '07': [
            ({ name }) => `Descobrimos ${name}. Antes de usar, vamos compreender seus riscos e seu impacto ambiental.`,
            ({ symbol }) => `${symbol} foi confirmado. Toda descoberta também exige responsabilidade.`,
            ({ name }) => `Excelente achado! Agora precisamos conhecer a ocorrência e a segurança de ${name}.`
        ],
        '08': [
            ({ name }) => `${name}! Temperatura, fase e reatividade vão revelar como ele troca energia.`,
            ({ symbol }) => `Os sensores aqueceram com esta leitura: ${symbol} acaba de ser confirmado.`,
            ({ name }) => `Uma nova descoberta energética! Vamos medir o comportamento de ${name}.`
        ],
        '09': [
            ({ name }) => `A assinatura de ${name} já está na interface. Que descoberta elegante!`,
            ({ symbol }) => `${symbol} confirmado. Talvez este elemento abra novos caminhos em sensores e eletrônica.`,
            ({ name }) => `Olhe só esta estrutura! ${name} acaba de entrar em nosso catálogo tecnológico.`
        ],
        '10': [
            ({ name }) => `${name}! Vamos observar como ele organiza minerais, cristais e redes sólidas.`,
            ({ symbol }) => `Uma nova estrutura surgiu no AURORA: ${symbol} foi confirmado.`,
            ({ name }) => `Bela descoberta! ${name} tem muito a revelar sobre a arquitetura da matéria.`
        ]
    }),
    en: Object.freeze({
        '01': [({ name }) => `Excellent work! ${name} expands AURORA's strategic reach.`, ({ name, z }) => `A new signature is confirmed: ${name}, Z=${z}. Record every detail.`, ({ name }) => `Congratulations on discovering ${name}. This is a milestone for the whole laboratory.`],
        '02': [({ name }) => `Look at that data! ${name}'s signature is unmistakable.`, ({ symbol, z }) => `The sensors agree: ${symbol}, Z=${z}. A perfectly consistent discovery.`, ({ name }) => `${name} appeared in the spectrum. I knew the data held a surprise.`],
        '03': [({ name }) => `What is this? ${name}! Let us investigate its links to life and the environment.`, ({ name }) => `A new discovery: ${name}. Even one element can transform living systems.`, ({ name }) => `Congratulations! ${name} has just joined our biochemical research.`],
        '04': [({ name }) => `${name}! I want to see how this element responds to energy and fields.`, ({ symbol }) => `We have a new reading, ${symbol}. This could unlock amazing technologies.`, ({ name }) => `What a surge of data! AURORA has confirmed ${name}.`],
        '05': [({ name, z }) => `Pattern confirmed for ${name}: Z=${z}. Now we can study its stability.`, ({ name }) => `A new discovery! ${name} deserves careful isotope analysis.`, ({ symbol }) => `${symbol} is in the record. Remember: atomic number identifies the element, not its isotope.`],
        '06': [({ name }) => `${name} is in the inventory! I want to test it in real systems.`, ({ symbol }) => `Look at that, ${symbol}! Another new part for the AURORA workshop.`, ({ name }) => `Discovery confirmed: ${name}. I am already thinking about what we can build.`],
        '07': [({ name }) => `We discovered ${name}. Before using it, let us understand its risks and environmental impact.`, ({ symbol }) => `${symbol} confirmed. Every discovery also demands responsibility.`, ({ name }) => `Excellent find! Now we must learn about ${name}'s occurrence and safety.`],
        '08': [({ name }) => `${name}! Temperature, phase, and reactivity will show how it exchanges energy.`, ({ symbol }) => `The sensors heated up with this reading: ${symbol} is confirmed.`, ({ name }) => `A high-energy discovery! Let us measure how ${name} behaves.`],
        '09': [({ name }) => `${name}'s signature is already on the interface. What an elegant discovery!`, ({ symbol }) => `${symbol} confirmed. This element may open new paths in sensors and electronics.`, ({ name }) => `Look at that structure! ${name} has joined our technology catalog.`],
        '10': [({ name }) => `${name}! Let us see how it organizes minerals, crystals, and solid lattices.`, ({ symbol }) => `A new structure emerged in AURORA: ${symbol} is confirmed.`, ({ name }) => `Beautiful discovery! ${name} has much to reveal about matter's architecture.`]
    })
});

const HYDROGEN_DIALOGUES = Object.freeze({
    pt: [
        'Este é o hidrogênio, nosso núcleo-base. Z=1 significa exatamente um próton; isso não informa o isótopo nem seu número de massa.',
        'Olhe só: hidrogênio! Com um próton, ele é o ponto de partida para toda a sua linha de pesquisa no AURORA.',
        'Nossa primeira ficha é do hidrogênio. Z=1 identifica o elemento; o isótopo depende também da quantidade de nêutrons.'
    ],
    en: [
        'This is hydrogen, our base nucleus. Z=1 means exactly one proton; it does not specify the isotope or mass number.',
        'Look at that: hydrogen! With one proton, it is the starting point for your entire AURORA research line.',
        'Our first record is hydrogen. Z=1 identifies the element; the isotope also depends on its number of neutrons.'
    ]
});

class DiscoveryController {
    constructor() {
        this.overlay = document.getElementById('discovery-overlay');
        this.card = document.getElementById('discovery-card');
        this.closeButton = document.getElementById('btn-close-discovery');
        this.queue = [];
        this.active = false;
        this.currentItem = null;
        this.previousFocus = null;
        this.helpButton = document.getElementById('btn-open-tutorial');
        this.abortController = new AbortController();
        this.bind();
    }

    bind() {
        const signal = this.abortController.signal;
        this.closeButton?.addEventListener('click', () => this.close(), { signal });
        window.addEventListener('atomic-tutorial-complete', event => {
            if (!event.detail?.replay) this.maybePresentHydrogen(event.detail?.focusTarget);
        }, { signal });
        this.overlay?.addEventListener('keydown', event => {
            if (!this.active) return;
            if (event.key === 'Escape') { event.preventDefault(); this.close(); return; }
            if (event.key !== 'Tab') return;
            const focusable = [...this.overlay.querySelectorAll('button:not(:disabled), [tabindex="0"]')];
            if (!focusable.length) return;
            const first = focusable[0], last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }, { signal });
    }

    discover(z, triggerElement = document.activeElement, source = 'fusion') {
        const missions = window.missionManager;
        if (!missions || !Number.isInteger(z) || !ATOM_REGISTRY[z]) return false;
        missions.discoveredElementsLifetime ||= new Set([1]);
        if (!AtomicRules.isNewDiscovery(z, missions.discoveredElementsLifetime, source)) return false;
        missions.discoveredElementsLifetime.add(z);
        SaveManager.save();
        window.dispatchEvent(new CustomEvent('atomic-discovery-updated', { detail: { z } }));
        this.queue.push({ z, triggerElement: triggerElement instanceof HTMLElement ? triggerElement : null });
        this.presentNext();
        return true;
    }

    inspect(z, triggerElement = document.activeElement, onClose = null) {
        if (this.active || !Number.isInteger(z) || !ATOM_REGISTRY[z]) return false;
        const known = window.missionManager?.discoveredElementsLifetime;
        if (!(known instanceof Set) || !known.has(z)) return false;
        this.queue.unshift({ z, triggerElement: triggerElement instanceof HTMLElement ? triggerElement : null, inspection: true, onClose });
        this.presentNext();
        return true;
    }

    maybePresentHydrogen(triggerElement = document.getElementById('accelerator-canvas')) {
        const missions = window.missionManager;
        if (!missions || missions.hydrogenCardPresented || window.tutorialManager?.active) return false;
        missions.hydrogenCardPresented = true;
        missions.discoveredElementsLifetime ||= new Set([1]);
        missions.discoveredElementsLifetime.add(1);
        SaveManager.save();
        this.queue.push({ z: 1, triggerElement: triggerElement instanceof HTMLElement ? triggerElement : null });
        this.presentNext();
        return true;
    }

    async presentNext() {
        if (this.active || !this.queue.length) return;
        this.active = true;
        const item = this.queue.shift();
        this.currentItem = item;
        this.previousFocus = item.triggerElement;
        try {
            const element = await ElementEncyclopedia.get(item.z);
            const character = await CharacterRegistry.get(element.presenterCode);
            this.render(element, character);
            const kicker = this.overlay?.querySelector('.discovery-kicker');
            const savedNote = this.overlay?.querySelector('.discovery-footer p');
            if (kicker) kicker.textContent = item.inspection
                ? (typeof i18n !== 'undefined' ? i18n.t('discovery_archive_kicker') : 'CONSULTA AO ARQUIVO DE DESCOBERTAS')
                : (typeof i18n !== 'undefined' ? i18n.t('discovery_kicker') : 'UM NOVO ELEMENTO FOI DESCOBERTO');
            if (savedNote) savedNote.textContent = item.inspection
                ? (typeof i18n !== 'undefined' ? i18n.t('discovery_archive_note') : 'Elemento preservado no arquivo vitalício do AURORA.')
                : (typeof i18n !== 'undefined' ? i18n.t('discovery_saved') : 'Descoberta registrada permanentemente neste save.');
            if (this.closeButton) {
                this.closeButton.textContent = item.inspection
                    ? (typeof i18n !== 'undefined' && i18n.currentLang === 'en' ? 'BACK TO TABLE ◀' : 'VOLTAR À TABELA ◀')
                    : (typeof i18n !== 'undefined' ? i18n.t('discovery_continue') : 'CONTINUAR PESQUISA ▶');
            }
            document.getElementById('screen-hud').inert = true;
            if (this.helpButton) this.helpButton.inert = true;
            this.overlay.classList.remove('hidden');
            this.closeButton.focus({ preventScroll: true });
            const status = document.getElementById('game-status');
            if (status) status.textContent = item.inspection
                ? `Ficha consultada: ${element.name}, Z igual a ${element.z}.`
                : `Novo elemento descoberto: ${element.name}, Z igual a ${element.z}.`;
        } catch (error) {
            console.error('[Combinações Atômicas][descoberta] Falha ao apresentar elemento.', error);
            this.active = false;
            this.presentNext();
        }
    }

    setText(id, value) { const node = document.getElementById(id); if (node) node.textContent = value || '—'; }

    render(element, character) {
        const atomImage = document.getElementById('discovery-atom-image');
        const presenterImage = document.getElementById('discovery-presenter-image');
        atomImage.src = element.image;
        atomImage.alt = `Representação visual de ${element.name}, Z=${element.z}`;
        atomImage.onerror = () => { atomImage.onerror = null; atomImage.src = atomTextures.generateFallback(ATOM_REGISTRY[element.z]); };
        presenterImage.src = character.image;
        presenterImage.alt = `Retrato de ${character.name}`;
        this.setText('discovery-presenter-name', character.name);
        this.setText('discovery-presenter-role', character.role);
        this.setText('discovery-element-name', `${element.name} (${element.symbol})`);
        this.setText('discovery-element-z', `Z=${element.z}`);
        this.setText('discovery-character-line', this.characterLine(element, character.code));
        const facts = [
            ['Família', element.family], ['Grupo / período', element.positionLabel],
            ['Bloco', element.block], ['Massa', element.mass], ['Configuração eletrônica', element.electronConfiguration],
            ['Classificação', element.classification], ['Estado a 25 °C', element.state], ['Fusão / ebulição', element.phaseChange]
        ];
        const list = document.getElementById('discovery-facts');
        list.textContent = '';
        for (const [label, value] of facts) {
            const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
            dt.textContent = label; dd.textContent = value; row.append(dt, dd); list.append(row);
        }
        this.setText('discovery-history', element.discovery);
        this.setText('discovery-occurrence', element.occurrence);
        this.setText('discovery-applications', [element.applications, element.dailyLife].filter(Boolean).join(' '));
        this.setText('discovery-curiosity', element.curiosity);
        this.setText('discovery-safety', element.safety);
    }

    characterLine(element, code) {
        const lang = typeof i18n !== 'undefined' && i18n.currentLang === 'en' ? 'en' : 'pt';
        const pool = element.z === 1
            ? HYDROGEN_DIALOGUES[lang]
            : (DISCOVERY_DIALOGUES[lang][code] || DISCOVERY_DIALOGUES[lang]['01']);
        const selected = pool[Math.floor(Math.random() * pool.length)];
        return typeof selected === 'function' ? selected(element) : selected;
    }

    close() {
        if (!this.active) return;
        const finished = this.currentItem;
        this.currentItem = null;
        this.overlay.classList.add('hidden');
        this.active = false;
        if (this.queue.length) { this.presentNext(); return; }
        if (finished?.inspection) {
            finished.onClose?.();
            return;
        }
        document.getElementById('screen-hud').inert = false;
        if (this.helpButton) this.helpButton.inert = false;
        this.previousFocus?.focus?.({ preventScroll: true });
    }

    destroy() {
        this.abortController.abort();
        this.queue.length = 0;
        this.currentItem = null;
        this.active = false;
        document.getElementById('screen-hud').inert = false;
        if (this.helpButton) this.helpButton.inert = false;
        this.overlay?.classList.add('hidden');
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => { window.discoveryController = new DiscoveryController(); });
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DiscoveryController, DISCOVERY_DIALOGUES, HYDROGEN_DIALOGUES };
}
