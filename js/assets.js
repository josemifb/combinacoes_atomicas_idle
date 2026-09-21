'use strict';

/** Catálogo único dos recursos editoriais e visuais do projeto. */
const ASSET_PATHS = Object.freeze({
    images: 'imagens', data: 'dados',
    atoms: 'imagens/atomos', characters: 'imagens/personagens',
    backgrounds: 'imagens/telas_fundo', currencies: 'imagens/moedas', icons: 'imagens/icones',
    historyImages: 'imagens/fragmentos_da_história',
    characterData: 'dados/dados_personagens', elementData: 'dados/dados_elementos', historyData: 'dados/fragmentos_da_historia',
    // Compatibilidade: nos módulos anteriores, image() era usado por moedas.
    image(name) { return `${this.currencies}/${name}`; },
    atomImage(z, cleanName) { return `${this.atoms}/${z}_${cleanName}.png`; },
    characterImage(file) { return `${this.characters}/${file}`; },
    characterProfile(code) { return `${this.characterData}/${String(code).padStart(2, '0')}_descricao.md`; },
    currencyImage(file) { return `${this.currencies}/${file}`; },
    icon(file) { return `${this.icons}/${file}`; },
    historyImage(file) { return `${this.historyImages}/${file}`; },
    historyProfile(file) { return `${this.historyData}/${file}`; }
});
globalThis.ASSET_PATHS = ASSET_PATHS;
if (typeof module === 'object' && module.exports) module.exports = ASSET_PATHS;
