'use strict';

/**
 * Registro central dos personagens. Os arquivos Markdown em dados/dados_personagens
 * continuam sendo a fonte editorial; os fallbacks mantêm a demo funcional
 * quando ela é aberta diretamente pelo sistema de arquivos.
 */
class CharacterRegistry {
    static entries = Object.freeze({
        '01': { image: ASSET_PATHS.characterImage('01_aris_thorne.jpg'), profile: ASSET_PATHS.characterProfile('01'), name: 'Dr.ª Aris Thorne', role: 'Líder de Pesquisa e Síntese Elemental', origin: 'Nairóbi, Quênia / Comunidade Científica Internacional', personality: 'Determinada, serena e profundamente inspiradora.' },
        '02': { image: ASSET_PATHS.characterImage('02_kaelen_echo_rostova.jpg'), profile: ASSET_PATHS.characterProfile('02'), name: 'Kaelen Echo Rostova', role: 'Analista de Redes e Dados Quânticos' },
        '03': { image: ASSET_PATHS.characterImage('03_aruna_patel.jpg'), profile: ASSET_PATHS.characterProfile('03'), name: 'Dr.ª Aruna Patel', role: 'Bioquímica Teórica e Síntese Orgânica' },
        '04': { image: ASSET_PATHS.characterImage('04_lucas_lux_vance.jpg'), profile: ASSET_PATHS.characterProfile('04'), name: 'Lucas Lux Vance', role: 'Engenheiro de Feixes e Manipulação de Energia' },
        '05': { image: ASSET_PATHS.characterImage('05_anya_tanaka.jpg'), profile: ASSET_PATHS.characterProfile('05'), name: 'Anya Tanaka', role: 'Especialista em Isótopos e Estabilidade de Rede' },
        '06': { image: ASSET_PATHS.characterImage('06_pip_nguyen.jpg'), profile: ASSET_PATHS.characterProfile('06'), name: 'Pip Nguyen', role: 'Manutenção Robótica e Microengenharia' },
        '07': { image: ASSET_PATHS.characterImage('07_jaciara_kaingang.jpg'), profile: ASSET_PATHS.characterProfile('07'), name: 'Jaciara', role: 'Oficial de Contenção e Bioproteção' },
        '08': { image: ASSET_PATHS.characterImage('08_elias_mendes.jpg'), profile: ASSET_PATHS.characterProfile('08'), name: 'Dr. Elias Mendes', role: 'Termodinâmica e Reações Exotérmicas' },
        '09': { image: ASSET_PATHS.characterImage('09_aisha_khan_.jpg'), profile: ASSET_PATHS.characterProfile('09'), name: 'Aisha Khan', role: 'Engenheira de Sistemas Fotônicos e Interfaces' },
        '10': { image: ASSET_PATHS.characterImage('10_tumo_dlamini.jpg'), profile: ASSET_PATHS.characterProfile('10'), name: 'Dr. Tumo Dlamini', role: 'Síntese Mineral e Cristalogênese' }
    });

    static cache = new Map();

    static parse(markdown, fallback) {
        const lines = String(markdown || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const heading = (lines[0] || '').split(/\s+—\s+/);
        const valueAfter = label => {
            const line = lines.find(item => item.toLowerCase().startsWith(label.toLowerCase()));
            return line ? line.slice(line.indexOf(':') + 1).trim() : '';
        };
        return {
            ...fallback,
            name: heading[0] || fallback.name,
            role: heading.slice(1).join(' — ') || fallback.role,
            origin: valueAfter('Origem:') || fallback.origin || '',
            laboratoryRole: valueAfter('O que faz no laboratório:') || '',
            personality: valueAfter('Aspiração e Personalidade:') || fallback.personality || '',
            markdown: String(markdown || '')
        };
    }

    static async get(code) {
        const key = String(code).padStart(2, '0');
        if (this.cache.has(key)) return this.cache.get(key);
        const fallback = this.entries[key];
        if (!fallback) throw new Error(`Personagem inexistente: ${key}`);
        let character = { code: key, ...fallback };
        try {
            const response = await fetch(fallback.profile, { cache: 'no-cache' });
            if (response.ok) character = { code: key, ...this.parse(await response.text(), fallback) };
        } catch (error) {
            console.info('[Combinações Atômicas][personagem] Perfil Markdown indisponível; usando dados locais.', { code: key, error: error.message });
        }
        this.cache.set(key, character);
        return character;
    }
}

window.CharacterRegistry = CharacterRegistry;
