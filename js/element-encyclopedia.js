'use strict';

/**
 * ENCICLOPÉDIA DOS ELEMENTOS
 * Converte os Markdown editoriais em fatos estruturados para as fichas. O
 * catálogo embarcado é o fallback quando fetch não está disponível.
 */

class ElementEncyclopedia {
    static cache = new Map();
    static markdownExceptions = Object.freeze({ 97: 'Berquelio', 117: 'Tenessino' });
    static presenterSets = Object.freeze({
        '01': new Set([1, 26, 82, 118]),
        '02': new Set([2, 10, 18, 36, 54, 86]),
        '03': new Set([6, 7, 8, 15, 16, 20, 30, 34, 53]),
        '04': new Set([13, 22, 24, 27, 28, 29, 41, 42, 47, 74, 75, 77, 78, 79]),
        '05': new Set([43, 61, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117]),
        '07': new Set([33, 48, 80, 81, 83, 84, 85, 87, 88]),
        '08': new Set([3, 9, 11, 17, 19, 35, 37, 55]),
        '09': new Set([5, 14, 31, 32, 49, 50, 51, 52]),
        '10': new Set([4, 12, 21, 38, 39, 40, 56, 57, 58, 59, 60, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73])
    });

    static presenterFor(z) {
        for (const [code, values] of Object.entries(this.presenterSets)) if (values.has(z)) return code;
        return '06';
    }

    static markdownPath(atom) {
        const clean = this.markdownExceptions[atom.protons]
            || atom.nameClean.charAt(0).toUpperCase() + atom.nameClean.slice(1);
        return `${ASSET_PATHS.atoms}/${String(atom.protons).padStart(3, '0')}_${clean}_${atom.symbol}.md`;
    }

    static clean(value = '') {
        return String(value).replace(/\*\*/g, '').replace(/^[-~]\s*/, '').trim();
    }

    static parseSections(markdown) {
        const sections = {};
        let current = '';
        for (const raw of String(markdown).split(/\r?\n/)) {
            const heading = raw.match(/^##\s+(.+)/);
            if (heading) { current = heading[1].trim(); sections[current] = []; continue; }
            if (current && raw.trim()) sections[current].push(this.clean(raw.replace(/^[-*]\s*/, '')));
        }
        return Object.fromEntries(Object.entries(sections).map(([key, lines]) => [key, lines.join(' ')]));
    }

    static blockFor(z, group) {
        if ((z >= 57 && z <= 71) || (z >= 89 && z <= 103)) return 'f';
        if (z === 2 || group <= 2) return 's';
        if (group >= 13) return 'p';
        return 'd';
    }

    static familyFor(group, classification, z) {
        if (z >= 57 && z <= 71) return 'Lantanídeos';
        if (z >= 89 && z <= 103) return 'Actinídeos';
        const families = { 1: 'Metais alcalinos', 2: 'Metais alcalino-terrosos', 13: 'Família do boro', 14: 'Família do carbono', 15: 'Pnictogênios', 16: 'Calcogênios', 17: 'Halogênios', 18: 'Gases nobres' };
        return families[group] || classification || 'Metal de transição';
    }

    static safetyFor(z, classification, sections) {
        if (z >= 84 || /radioativ/i.test(classification + sections.Curiosidade)) return 'Radioativo: requer controle radiológico e manipulação especializada.';
        if ([9, 17, 33, 35, 48, 80, 81, 82].includes(z)) return 'Pode ser tóxico ou corrosivo em determinadas formas químicas; exposição exige controle.';
        return 'Riscos dependem da forma química, da dose e da via de exposição.';
    }

    static parse(markdown, atom) {
        const table = {};
        for (const match of String(markdown).matchAll(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/gm)) {
            const key = this.clean(match[1]);
            if (key !== 'Propriedade' && key !== '---') table[key] = this.clean(match[2]);
        }
        const sections = this.parseSections(markdown);
        const positionText = table['Grupo / Período'] || '';
        const position = positionText.match(/(.+?)\s*\/\s*(\d+)/);
        const group = position && /^\d+$/.test(position[1].trim()) ? Number(position[1]) : 0;
        const period = position ? Number(position[2]) : 0;
        const classification = table.Classificação || 'Classificação não informada';
        return {
            z: atom.protons, symbol: atom.symbol, name: atom.namePt, image: atom.imagePath,
            mass: table['Massa atômica'] || atom.massDisplay,
            electronConfiguration: table['Distribuição eletrônica'] || 'Não informada',
            group, period, positionLabel: positionText || 'Dados limitados', classification,
            family: this.familyFor(group, classification, atom.protons),
            block: this.blockFor(atom.protons, group),
            state: table['Estado a 25 °C'] || 'Não informado',
            phaseChange: table['Fusão / Ebulição'] || 'Dados limitados',
            discovery: sections.Descoberta || 'Registro histórico não informado.',
            occurrence: sections['Abundância e ocorrência'] || 'Ocorrência não informada.',
            applications: sections.Aplicações || 'Sem aplicações consolidadas informadas.',
            dailyLife: sections['No dia a dia'] || '',
            curiosity: sections.Curiosidade || '',
            safety: this.safetyFor(atom.protons, classification, sections),
            presenterCode: this.presenterFor(atom.protons),
            sourcePath: this.markdownPath(atom)
        };
    }

    static fallback(atom, error) {
        return {
            z: atom.protons, symbol: atom.symbol, name: atom.namePt, image: atom.imagePath,
            mass: `${atom.massDisplay} u`, electronConfiguration: 'Dados em atualização', group: 0, period: 0,
            classification: 'Elemento químico', family: 'Família em atualização', block: '—', state: 'Dados em atualização',
            phaseChange: 'Dados em atualização', discovery: 'Perfil histórico temporariamente indisponível.',
            occurrence: 'Consulte novamente quando o arquivo enciclopédico estiver disponível.', applications: 'Dados em atualização.',
            dailyLife: '', curiosity: '', safety: 'Riscos dependem da forma química, dose e exposição.',
            presenterCode: this.presenterFor(atom.protons), sourcePath: this.markdownPath(atom), loadError: error?.message || 'indisponível'
        };
    }

    static async get(z) {
        if (this.cache.has(z)) return this.cache.get(z);
        const atom = ATOM_REGISTRY[z];
        if (!atom) throw new Error(`Elemento inexistente: Z=${z}`);
        let entry;
        const embedded = globalThis.ELEMENT_PROFILE_MARKDOWN?.[z];
        if (embedded) {
            entry = this.parse(embedded, atom);
            this.cache.set(z, entry);
            return entry;
        }
        try {
            const response = await fetch(this.markdownPath(atom), { cache: 'no-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            entry = this.parse(await response.text(), atom);
        } catch (error) {
            console.warn('[Combinações Atômicas][enciclopédia] Perfil indisponível.', { z, error: error.message });
            entry = this.fallback(atom, error);
        }
        this.cache.set(z, entry);
        return entry;
    }
}

globalThis.ElementEncyclopedia = ElementEncyclopedia;
if (typeof module === 'object' && module.exports) module.exports = ElementEncyclopedia;
