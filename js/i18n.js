/**
 * ARQUIVO: js/i18n.js
 * FINALIDADE: Textos bilíngues sincronizados com o Mercado Quântico.
 */

const translations = {
    pt: {
        title_main: "COMBINAÇÕES ATÔMICAS IDLE",
        subtitle_main: "LABORATÓRIO DE ACELERAÇÃO QUÂNTICA",
        btn_start: "INICIAR EXPERIMENTO",
        btn_resume: "RETOMAR PROGRESSO",
        btn_new_game: "NOVO EXPERIMENTO",
        lbl_language: "Idioma do Sistema",
        lbl_theme: "Tema da Interface",
        speaker_name: "DRA. ARIS THORNE",
        speaker_role: "Líder de Pesquisa e Síntese Elemental",
        placeholder_name: "Insira seu nome de cientista...",
        btn_next: "AVANÇAR ▶",
        btn_enter_lab: "AVANÇAR PARA O LABORATÓRIO ▶",
        dialogue_1: "Saudações! Sou a Dr.ª Aris Thorne, líder de Pesquisa e Síntese Elemental do complexo. Coordeno nossas combinações de núcleos e os experimentos de maior risco.",
        dialogue_2: "Antes de energizarmos o Anel AURORA, preciso registrar suas credenciais. Qual é o seu nome?",
        dialogue_welcome: "Bem-vindo ao projeto, {name}. Vou acompanhar sua primeira operação e mostrar como transformar um núcleo de hidrogênio em uma linha de pesquisa completa.",
        tutorial_next: "AVANÇAR ▶",
        tutorial_finish: "INICIAR JOGO ▶",
        tutorial_help_label: "Rever tutorial guiado",
        tutorial_1: "Este é o Anel de Síntese AURORA. Clique nele ou pressione Espaço para gerar capital; os núcleos em circulação também produzem renda ao cruzar cada detector.",
        tutorial_2: "Na Câmara de Síntese ficam seus núcleos. Selecione dois slots compatíveis para combiná-los. Novos slots são liberados conforme o nível do anel aumenta.",
        tutorial_3: "Em Melhorias e Injeção você abastece a câmara e aperfeiçoa a operação: o injetor alcança núcleos maiores, os quadrupolos aumentam a velocidade e os detectores elevam a renda.",
        tutorial_4: "A Missão Principal conduz o avanço do laboratório e do seu nível. Ela registra objetivos reais da rodada, incluindo combinações específicas quando forem exigidas.",
        tutorial_5: "A Missão Secundária oferece desafios opcionais e fótons extras. O objetivo sempre respeita aquilo que seu laboratório já consegue realizar.",
        tutorial_6: "No Mercado Quântico, os pulsos temporários aceleram resultados; Expansão Offline e Sorte Quântica são melhorias permanentes. O núcleo-base H também permite formar resultados de número atômico ímpar.",
        tutorial_7: "Sua Câmara já recebeu H — Z=1. Gere capital, injete outro núcleo e faça sua primeira combinação. O AURORA está sob seu comando — boa pesquisa!",
        
        tag_user: "OPERADOR",
        tag_level: "NÍVEL",
        tag_prestige_box: "PRESTÍGIO",
        tag_primary_mission: "MISSÃO PRINCIPAL",
        tag_secondary_mission: "MISSÃO SECUNDÁRIA",
        tag_coins: "CAPITAL QUÂNTICO",
        btn_config: "SISTEMA",
        
        title_accelerator: "ANEL DE SÍNTESE AURORA",
        status_active: "ATIVO",
        title_fusion: "CÂMARA DE SÍNTESE",
        
        title_upgrades: "MELHORIAS & INJEÇÃO",
        upgrade_speed: "Quadrupolos Magnéticos",
        upgrade_detector: "Estação de Detecção",
        
        title_shop: "MERCADO QUÂNTICO",
        shop_buy_proton: "Núcleo-base H — Z=1",
        badge_proton: "Matéria-Prima",
        btn_buy: "INJETAR",
        discovery_kicker: "UM NOVO ELEMENTO FOI DESCOBERTO",
        discovery_saved: "Descoberta registrada permanentemente neste save.",
        discovery_continue: "CONTINUAR PESQUISA ▶",
        discovery_archive_kicker: "CONSULTA AO ARQUIVO DE DESCOBERTAS",
        discovery_archive_note: "Elemento preservado no arquivo vitalício do AURORA.",
        periodic_kicker: "ARQUIVO VITALÍCIO DO AURORA",
        periodic_title: "TABELA PERIÓDICA DAS DESCOBERTAS",
        periodic_discovered: "elementos descobertos",
        periodic_achievements: "CONQUISTAS DA TABELA",
        periodic_open: "Abrir Tabela Periódica das Descobertas",
        periodic_complete: "COMPLETO",

        shop_offline_cap: "Expansão Offline",
        shop_luck: "Sorte Quântica",
        shop_timeskip: "Salto Temporal",

        title_recovery: "PROTOCOLO DE RECUPERAÇÃO",
        desc_recovery: "A injeção manual de emergência só é autorizada se a câmara estiver 100% vazia e desprovida de átomos.",
        btn_emergency_inject: "INJETAR H — Z=1 DE EMERGÊNCIA",
        btn_reset_save: "⚠️ REINICIAR SAVE DO ZERO",

        modal_system_title: "TERMINAL DE CONTROLE & PRESTÍGIO",
        prestige_title: "ASCENSÃO QUÂNTICA (PRESTÍGIO)",
        prestige_desc: "Reinicia a câmara de síntese e as melhorias operacionais em troca de um multiplicador permanente por nível LV."
    },
    en: {
        title_main: "ATOMIC COMBINATIONS IDLE",
        subtitle_main: "QUANTUM ACCELERATION LABORATORY",
        btn_start: "START EXPERIMENT",
        btn_resume: "RESUME EXPERIMENT",
        btn_new_game: "NEW EXPERIMENT",
        lbl_language: "System Language",
        lbl_theme: "Interface Theme",
        speaker_name: "DR. ARIS THORNE",
        speaker_role: "Research and Elemental Synthesis Lead",
        placeholder_name: "Enter researcher name...",
        btn_next: "PROCEED ▶",
        btn_enter_lab: "PROCEED TO LABORATORY ▶",
        dialogue_1: "Greetings! I am Dr. Aris Thorne, the complex's Research and Elemental Synthesis Lead. I coordinate our nucleus combinations and highest-risk experiments.",
        dialogue_2: "Before powering the AURORA Ring, I need to register your credentials. What is your name?",
        dialogue_welcome: "Welcome to the project, {name}. I will guide your first operation and show you how to turn one hydrogen nucleus into a complete research line.",
        tutorial_next: "CONTINUE ▶",
        tutorial_finish: "START GAME ▶",
        tutorial_help_label: "Replay guided tutorial",
        tutorial_1: "This is the AURORA Synthesis Ring. Click it or press Space to generate capital; orbiting nuclei also earn income whenever they cross a detector.",
        tutorial_2: "Your nuclei stay in the Synthesis Chamber. Select two compatible slots to combine them. New slots become available as the ring level rises.",
        tutorial_3: "Upgrades & Injection supplies the chamber and improves operations: the injector reaches larger nuclei, quadrupoles increase speed, and detectors raise income.",
        tutorial_4: "The Primary Mission guides laboratory and level progression. It tracks real actions from the current run, including specific combinations when requested.",
        tutorial_5: "The Secondary Mission offers optional challenges and extra photons. Its target always respects what your laboratory can currently achieve.",
        tutorial_6: "In the Quantum Market, temporary pulses speed up results; Offline Expansion and Quantum Luck are permanent. Base H also lets you form odd atomic-number results.",
        tutorial_7: "Your Chamber already contains H — Z=1. Generate capital, inject another nucleus, and make your first combination. AURORA is under your command—good research!",
        
        tag_user: "OPERATOR",
        tag_level: "LEVEL",
        tag_prestige_box: "PRESTIGE",
        tag_primary_mission: "PRIMARY MISSION",
        tag_secondary_mission: "SECONDARY BOUNTY",
        tag_coins: "QUANTUM CAPITAL",
        btn_config: "SYSTEM",
        
        title_accelerator: "AURORA SYNTHESIS RING",
        status_active: "ONLINE",
        title_fusion: "SYNTHESIS CHAMBER",
        
        title_upgrades: "UPGRADES & INJECTION",
        upgrade_speed: "Magnetic Quadrupoles",
        upgrade_detector: "Detection Station",
        
        title_shop: "QUANTUM MARKET",
        shop_buy_proton: "Base nucleus H — Z=1",
        badge_proton: "Raw Material",
        btn_buy: "INJECT",
        discovery_kicker: "A NEW ELEMENT HAS BEEN DISCOVERED",
        discovery_saved: "Discovery permanently recorded in this save.",
        discovery_continue: "CONTINUE RESEARCH ▶",
        discovery_archive_kicker: "DISCOVERY ARCHIVE RECORD",
        discovery_archive_note: "Element preserved in AURORA's lifetime archive.",
        periodic_kicker: "AURORA LIFETIME ARCHIVE",
        periodic_title: "PERIODIC TABLE OF DISCOVERIES",
        periodic_discovered: "elements discovered",
        periodic_achievements: "TABLE ACHIEVEMENTS",
        periodic_open: "Open Periodic Table of Discoveries",
        periodic_complete: "COMPLETE",

        shop_offline_cap: "Offline Expansion",
        shop_luck: "Quantum Luck",
        shop_timeskip: "Time Skip",

        title_recovery: "RECOVERY PROTOCOL",
        desc_recovery: "Manual emergency injection is only authorized if the synthesis chamber is completely empty.",
        btn_emergency_inject: "INJECT EMERGENCY H — Z=1",
        btn_reset_save: "⚠️ WIPE SAVE FROM SCRATCH",

        modal_system_title: "CONTROL & PRESTIGE TERMINAL",
        prestige_title: "QUANTUM ASCENSION (PRESTIGE)",
        prestige_desc: "Resets the synthesis chamber and operational upgrades in exchange for a permanent multiplier per LV level."
    }
};

class I18nManager {
    constructor() {
        try {
            this.currentLang = localStorage.getItem('particle_idle_lang') || 'pt';
        } catch (e) {
            this.currentLang = 'pt';
        }
    }

    t(key, params = {}) {
        let text = (translations[this.currentLang] && translations[this.currentLang][key]) 
            || (translations['pt'] && translations['pt'][key]) 
            || key;

        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
        });

        return text;
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            try {
                localStorage.setItem('particle_idle_lang', lang);
            } catch (e) {}
            this.updateDOM();
        }
    }

    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        document.title = this.currentLang === 'pt'
            ? 'Combinações Atômicas Idle — Anel de Síntese AURORA'
            : 'Atomic Combinations Idle — AURORA Synthesis Ring';
        window.dispatchEvent(new CustomEvent('atomic-language-change', { detail: { lang: this.currentLang } }));
    }
}

const i18n = new I18nManager();
