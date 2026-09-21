/**
 * ARQUIVO: js/atoms.js
 * FINALIDADE: Base de dados atômica dos 118 elementos químicos (IUPAC).
 *             Mapeia prótons, símbolos, massas atômicas, nomes com/sem acento
 *             e provê gerenciador de texturas com fallback procedural SVG/Canvas
 *             à prova de falhas assíncronas.
 * DEPENDÊNCIAS: Nenhuma (Módulo Base).
 */

const PERIODIC_ELEMENTS_DATA = [
    { z: 1, s: "H", m: 1.008, n_pt: "hidrogênio", n_clean: "hidrogenio", c: "#4ce6e6" },
    { z: 2, s: "He", m: 4.0026, n_pt: "hélio", n_clean: "helio", c: "#9b59b6" },
    { z: 3, s: "Li", m: 6.94, n_pt: "lítio", n_clean: "litio", c: "#e74c3c" },
    { z: 4, s: "Be", m: 9.0122, n_pt: "berílio", n_clean: "berilio", c: "#2ecc71" },
    { z: 5, s: "B", m: 10.81, n_pt: "boro", n_clean: "boro", c: "#e67e22" },
    { z: 6, s: "C", m: 12.011, n_pt: "carbono", n_clean: "carbono", c: "#7f8c8d" },
    { z: 7, s: "N", m: 14.007, n_pt: "nitrogênio", n_clean: "nitrogenio", c: "#3498db" },
    { z: 8, s: "O", m: 15.999, n_pt: "oxigênio", n_clean: "oxigenio", c: "#1abc9c" },
    { z: 9, s: "F", m: 18.998, n_pt: "flúor", n_clean: "fluor", c: "#27ae60" },
    { z: 10, s: "Ne", m: 20.180, n_pt: "neônio", n_clean: "neonio", c: "#e91e63" },
    { z: 11, s: "Na", m: 22.990, n_pt: "sódio", n_clean: "sodio", c: "#f39c12" },
    { z: 12, s: "Mg", m: 24.305, n_pt: "magnésio", n_clean: "magnesio", c: "#16a085" },
    { z: 13, s: "Al", m: 26.982, n_pt: "alumínio", n_clean: "aluminio", c: "#bdc3c7" },
    { z: 14, s: "Si", m: 28.085, n_pt: "silício", n_clean: "silicio", c: "#7f8c8d" },
    { z: 15, s: "P", m: 30.974, n_pt: "fósforo", n_clean: "fosforo", c: "#d35400" },
    { z: 16, s: "S", m: 32.06, n_pt: "enxofre", n_clean: "enxofre", c: "#f1c40f" },
    { z: 17, s: "Cl", m: 35.45, n_pt: "cloro", n_clean: "cloro", c: "#2ecc71" },
    { z: 18, s: "Ar", m: 39.948, n_pt: "argônio", n_clean: "argonio", c: "#8e44ad" },
    { z: 19, s: "K", m: 39.098, n_pt: "potássio", n_clean: "potassio", c: "#9b59b6" },
    { z: 20, s: "Ca", m: 40.078, n_pt: "cálcio", n_clean: "calcio", c: "#e67e22" },
    { z: 21, s: "Sc", m: 44.956, n_pt: "escândio", n_clean: "escandio", c: "#95a5a6" },
    { z: 22, s: "Ti", m: 47.867, n_pt: "titânio", n_clean: "titanio", c: "#7f8c8d" },
    { z: 23, s: "V", m: 50.942, n_pt: "vanádio", n_clean: "vanadio", c: "#95a5a6" },
    { z: 24, s: "Cr", m: 51.996, n_pt: "cromo", n_clean: "cromo", c: "#3498db" },
    { z: 25, s: "Mn", m: 54.938, n_pt: "manganês", n_clean: "manganes", c: "#8e44ad" },
    { z: 26, s: "Fe", m: 55.845, n_pt: "ferro", n_clean: "ferro", c: "#e67e22" },
    { z: 27, s: "Co", m: 58.933, n_pt: "cobalto", n_clean: "cobalto", c: "#2980b9" },
    { z: 28, s: "Ni", m: 58.693, n_pt: "níquel", n_clean: "niquel", c: "#16a085" },
    { z: 29, s: "Cu", m: 63.546, n_pt: "cobre", n_clean: "cobre", c: "#d35400" },
    { z: 30, s: "Zn", m: 65.38, n_pt: "zinco", n_clean: "zinco", c: "#bdc3c7" },
    { z: 31, s: "Ga", m: 69.723, n_pt: "gálio", n_clean: "galio", c: "#3498db" },
    { z: 32, s: "Ge", m: 72.630, n_pt: "germânio", n_clean: "germanio", c: "#7f8c8d" },
    { z: 33, s: "As", m: 74.922, n_pt: "arsênio", n_clean: "arsenio", c: "#2ecc71" },
    { z: 34, s: "Se", m: 78.971, n_pt: "selênio", n_clean: "selenio", c: "#9b59b6" },
    { z: 35, s: "Br", m: 79.904, n_pt: "bromo", n_clean: "bromo", c: "#c0392b" },
    { z: 36, s: "Kr", m: 83.798, n_pt: "criptônio", n_clean: "criptonio", c: "#1abc9c" },
    { z: 37, s: "Rb", m: 85.468, n_pt: "rubídio", n_clean: "rubidio", c: "#e74c3c" },
    { z: 38, s: "Sr", m: 87.62, n_pt: "estrôncio", n_clean: "estroncio", c: "#e67e22" },
    { z: 39, s: "Y", m: 88.906, n_pt: "ítrio", n_clean: "itrio", c: "#f39c12" },
    { z: 40, s: "Zr", m: 91.224, n_pt: "zircônio", n_clean: "zirconio", c: "#95a5a6" },
    { z: 41, s: "Nb", m: 92.906, n_pt: "nióbio", n_clean: "niobio", c: "#3498db" },
    { z: 42, s: "Mo", m: 95.95, n_pt: "molibdênio", n_clean: "molibdenio", c: "#8e44ad" },
    { z: 43, s: "Tc", m: 98, n_pt: "tecnécio", n_clean: "tecnecio", c: "#2ecc71" },
    { z: 44, s: "Ru", m: 101.07, n_pt: "rutênio", n_clean: "rutenio", c: "#27ae60" },
    { z: 45, s: "Rh", m: 102.91, n_pt: "ródio", n_clean: "rodio", c: "#e67e22" },
    { z: 46, s: "Pd", m: 106.42, n_pt: "paládio", n_clean: "paladio", c: "#bdc3c7" },
    { z: 47, s: "Ag", m: 107.87, n_pt: "prata", n_clean: "prata", c: "#ecf0f1" },
    { z: 48, s: "Cd", m: 112.41, n_pt: "cádmio", n_clean: "cadmio", c: "#f1c40f" },
    { z: 49, s: "In", m: 114.82, n_pt: "índio", n_clean: "indio", c: "#9b59b6" },
    { z: 50, s: "Sn", m: 118.71, n_pt: "estanho", n_clean: "estanho", c: "#95a5a6" },
    { z: 51, s: "Sb", m: 121.76, n_pt: "antimônio", n_clean: "antimonio", c: "#34495e" },
    { z: 52, s: "Te", m: 127.60, n_pt: "telúrio", n_clean: "telurio", c: "#16a085" },
    { z: 53, s: "I", m: 126.90, n_pt: "iodo", n_clean: "iodo", c: "#8e44ad" },
    { z: 54, s: "Xe", m: 131.29, n_pt: "xenônio", n_clean: "xenonio", c: "#2980b9" },
    { z: 55, s: "Cs", m: 132.91, n_pt: "césio", n_clean: "cesio", c: "#d35400" },
    { z: 56, s: "Ba", m: 137.33, n_pt: "bário", n_clean: "bario", c: "#27ae60" },
    { z: 57, s: "La", m: 138.91, n_pt: "lantânio", n_clean: "lantanio", c: "#f39c12" },
    { z: 58, s: "Ce", m: 140.12, n_pt: "cério", n_clean: "cerio", c: "#e67e22" },
    { z: 59, s: "Pr", m: 140.91, n_pt: "praseodímio", n_clean: "praseodimio", c: "#f1c40f" },
    { z: 60, s: "Nd", m: 144.24, n_pt: "neodímio", n_clean: "neodimio", c: "#2ecc71" },
    { z: 61, s: "Pm", m: 145, n_pt: "promécio", n_clean: "promecio", c: "#1abc9c" },
    { z: 62, s: "Sm", m: 150.36, n_pt: "samário", n_clean: "samario", c: "#3498db" },
    { z: 63, s: "Eu", m: 151.96, n_pt: "európio", n_clean: "europio", c: "#9b59b6" },
    { z: 64, s: "Gd", m: 157.25, n_pt: "gadolínio", n_clean: "gadolinio", c: "#e74c3c" },
    { z: 65, s: "Tb", m: 158.93, n_pt: "térbio", n_clean: "terbio", c: "#e67e22" },
    { z: 66, s: "Dy", m: 162.50, n_pt: "disprósio", n_clean: "disprosio", c: "#f39c12" },
    { z: 67, s: "Ho", m: 164.93, n_pt: "hólmio", n_clean: "holmio", c: "#f1c40f" },
    { z: 68, s: "Er", m: 167.26, n_pt: "érbio", n_clean: "erbio", c: "#2ecc71" },
    { z: 69, s: "Tm", m: 168.93, n_pt: "túlio", n_clean: "tulio", c: "#9b59b6" },
    { z: 70, s: "Yb", m: 173.05, n_pt: "itérbio", n_clean: "iterbio", c: "#1abc9c" },
    { z: 71, s: "Lu", m: 174.97, n_pt: "lutécio", n_clean: "lutecio", c: "#3498db" },
    { z: 72, s: "Hf", m: 178.49, n_pt: "háfnio", n_clean: "hafnio", c: "#95a5a6" },
    { z: 73, s: "Ta", m: 180.95, n_pt: "tântalo", n_clean: "tantalo", c: "#7f8c8d" },
    { z: 74, s: "W", m: 183.84, n_pt: "tungstênio", n_clean: "tungstenio", c: "#34495e" },
    { z: 75, s: "Re", m: 186.21, n_pt: "rênio", n_clean: "renio", c: "#2980b9" },
    { z: 76, s: "Os", m: 190.23, n_pt: "ósmio", n_clean: "osmio", c: "#16a085" },
    { z: 77, s: "Ir", m: 192.22, n_pt: "irídio", n_clean: "iridio", c: "#d35400" },
    { z: 78, s: "Pt", m: 195.08, n_pt: "platina", n_clean: "platina", c: "#ecf0f1" },
    { z: 79, s: "Au", m: 196.97, n_pt: "ouro", n_clean: "ouro", c: "#f1c40f" },
    { z: 80, s: "Hg", m: 200.59, n_pt: "mercúrio", n_clean: "mercurio", c: "#bdc3c7" },
    { z: 81, s: "Tl", m: 204.38, n_pt: "tálio", n_clean: "talio", c: "#9b59b6" },
    { z: 82, s: "Pb", m: 207.2, n_pt: "chumbo", n_clean: "chumbo", c: "#7f8c8d" },
    { z: 83, s: "Bi", m: 208.98, n_pt: "bismuto", n_clean: "bismuto", c: "#2ecc71" },
    { z: 84, s: "Po", m: 209, n_pt: "polônio", n_clean: "polonio", c: "#e74c3c" },
    { z: 85, s: "At", m: 210, n_pt: "astato", n_clean: "astato", c: "#c0392b" },
    { z: 86, s: "Rn", m: 222, n_pt: "radônio", n_clean: "radonio", c: "#8e44ad" },
    { z: 87, s: "Fr", m: 223, n_pt: "frâncio", n_clean: "francio", c: "#d35400" },
    { z: 88, s: "Ra", m: 226, n_pt: "rádio", n_clean: "radio", c: "#27ae60" },
    { z: 89, s: "Ac", m: 227, n_pt: "actínio", n_clean: "actinio", c: "#f39c12" },
    { z: 90, s: "Th", m: 232.04, n_pt: "tório", n_clean: "torio", c: "#e67e22" },
    { z: 91, s: "Pa", m: 231.04, n_pt: "protactínio", n_clean: "protactinio", c: "#f1c40f" },
    { z: 92, s: "U", m: 238.03, n_pt: "urânio", n_clean: "uranio", c: "#2ecc71" },
    { z: 93, s: "Np", m: 237, n_pt: "netúnio", n_clean: "netunio", c: "#1abc9c" },
    { z: 94, s: "Pu", m: 244, n_pt: "plutônio", n_clean: "plutonio", c: "#e74c3c" },
    { z: 95, s: "Am", m: 243, n_pt: "amerício", n_clean: "americio", c: "#9b59b6" },
    { z: 96, s: "Cm", m: 247, n_pt: "cúrio", n_clean: "curio", c: "#3498db" },
    { z: 97, s: "Bk", m: 247, n_pt: "berquélio", n_clean: "berquelio", c: "#e67e22" },
    { z: 98, s: "Cf", m: 251, n_pt: "califórnio", n_clean: "californio", c: "#f39c12" },
    { z: 99, s: "Es", m: 252, n_pt: "einstênio", n_clean: "einstenio", c: "#a6e22e" },
    { z: 100, s: "Fm", m: 257, n_pt: "férmio", n_clean: "fermio", c: "#2ecc71" },
    { z: 101, s: "Md", m: 258, n_pt: "mendelévio", n_clean: "mendelevio", c: "#1abc9c" },
    { z: 102, s: "No", m: 259, n_pt: "nobélio", n_clean: "nobelio", c: "#3498db" },
    { z: 103, s: "Lr", m: 266, n_pt: "laurêncio", n_clean: "laurencio", c: "#9b59b6" },
    { z: 104, s: "Rf", m: 267, n_pt: "rutherfórdio", n_clean: "rutherfordio", c: "#e74c3c" },
    { z: 105, s: "Db", m: 268, n_pt: "dúbnio", n_clean: "dubnio", c: "#e67e22" },
    { z: 106, s: "Sg", m: 269, n_pt: "seabórgio", n_clean: "seaborgio", c: "#f39c12" },
    { z: 107, s: "Bh", m: 270, n_pt: "bóhrio", n_clean: "bohrio", c: "#f1c40f" },
    { z: 108, s: "Hs", m: 277, n_pt: "hássio", n_clean: "hassio", c: "#2ecc71" },
    { z: 109, s: "Mt", m: 278, n_pt: "meitnério", n_clean: "meitnerio", c: "#1abc9c" },
    { z: 110, s: "Ds", m: 281, n_pt: "darmstádio", n_clean: "darmstadio", c: "#3498db" },
    { z: 111, s: "Rg", m: 282, n_pt: "roentgênio", n_clean: "roentgenio", c: "#9b59b6" },
    { z: 112, s: "Cn", m: 285, n_pt: "copernício", n_clean: "copernicio", c: "#e74c3c" },
    { z: 113, s: "Nh", m: 286, n_pt: "nihônio", n_clean: "nihonio", c: "#e67e22" },
    { z: 114, s: "Fl", m: 289, n_pt: "fleróvio", n_clean: "flerovio", c: "#f39c12" },
    { z: 115, s: "Mc", m: 290, n_pt: "moscóvio", n_clean: "moscovio", c: "#f1c40f" },
    { z: 116, s: "Lv", m: 293, n_pt: "livermório", n_clean: "livermorio", c: "#2ecc71" },
    { z: 117, s: "Ts", m: 294, n_pt: "tenessino", n_clean: "tenessino", c: "#1abc9c" },
    { z: 118, s: "Og", m: 294, n_pt: "oganessônio", n_clean: "oganessonio", c: "#4ce6e6" }
];

const ATOM_REGISTRY = {};

// Elementos sem peso atômico padrão usam, na exibição, o número de massa
// entre colchetes do radionuclídeo de referência (convenção IUPAC).
const RADIOACTIVE_MASS_NUMBERS = {43:97,61:145,84:209,85:210,86:222,87:223,88:226,89:227,93:237,94:244,95:243,96:247,97:247,98:251,99:252,100:257,101:258,102:259,103:266,104:267,105:268,106:269,107:270,108:277,109:278,110:281,111:282,112:285,113:286,114:289,115:290,116:293,117:294,118:294};

PERIODIC_ELEMENTS_DATA.forEach(elem => {
    ATOM_REGISTRY[elem.z] = {
        id: elem.z,
        protons: elem.z,
        symbol: elem.s,
        mass: elem.m,
        massValue: elem.m,
        massDisplay: RADIOACTIVE_MASS_NUMBERS[elem.z] ? `[${RADIOACTIVE_MASS_NUMBERS[elem.z]}]` : String(elem.m),
        color: elem.c,
        namePt: elem.n_pt,
        nameClean: elem.n_clean,
        baseCost: Math.floor(10 * Math.pow(elem.z, 1.35)),
        imagePath: ASSET_PATHS.atomImage(elem.z, elem.n_clean),
        candidates: [ASSET_PATHS.atomImage(elem.z, elem.n_clean)]
    };
});

class AtomTextureManager {
    constructor() {
        this.cache = new Map();
        this.fallbackCache = new Map();
    }

    /**
     * Gera um dataURL SVG nítido para ser usado como fallback caso os arquivos de imagem faltem.
     * Isso impede travamento ou quadrados invisíveis no canvas.
     */
    generateFallback(atomData) {
        if (this.fallbackCache.has(atomData.protons)) {
            return this.fallbackCache.get(atomData.protons);
        }

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
            <defs>
                <radialGradient id="grad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
                    <stop offset="40%" stop-color="${atomData.color}" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="#090d16" stop-opacity="1"/>
                </radialGradient>
            </defs>
            <circle cx="64" cy="64" r="54" fill="url(#grad)" stroke="${atomData.color}" stroke-width="4"/>
            <circle cx="64" cy="64" r="38" fill="none" stroke="rgba(255,255,255,0.4)" stroke-dasharray="4,4" stroke-width="2"/>
            <text x="64" y="70" font-family="'Press Start 2P', monospace" font-size="22" fill="#ffffff" text-anchor="middle" font-weight="bold">${atomData.symbol}</text>
            <text x="64" y="94" font-family="'Share Tech Mono', monospace" font-size="14" fill="#a0aec0" text-anchor="middle">Z=${atomData.protons}</text>
        </svg>`;

        const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        this.fallbackCache.set(atomData.protons, dataUrl);
        return dataUrl;
    }

    /**
     * Carrega texturas com resolvedor multi-caminho e fallback procedural automático.
     * @param {Object} atomData
     * @returns {HTMLImageElement}
     */
    getTexture(atomData) {
        if (!atomData || !atomData.protons) return null;

        if (this.cache.has(atomData.protons)) {
            return this.cache.get(atomData.protons);
        }

        const img = new Image();
        img._isLoaded = false;
        img._isFailed = false;

        let candidateIdx = 0;
        img.onload = () => {
            img._isLoaded = true;
        };

        img.onerror = () => {
            candidateIdx++;
            if (candidateIdx < atomData.candidates.length) {
                img.src = atomData.candidates[candidateIdx];
            } else {
                // Ativa contingência: injeta o SVG procedural no src da imagem
                img._isFailed = true;
                img.onerror = null;
                img.src = this.generateFallback(atomData);
            }
        };
        img.src = atomData.candidates[0];

        this.cache.set(atomData.protons, img);
        return img;
    }
}

const atomTextures = new AtomTextureManager();
