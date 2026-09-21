'use strict';

/**
 * Converte os capítulos Markdown em um catálogo JavaScript embutido.
 * Isso permite que a história também funcione quando index.html é aberto por
 * file://, ambiente no qual muitos navegadores bloqueiam fetch de arquivos.
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'dados', 'fragmentos_da_historia');
const imageDir = path.join(root, 'imagens', 'fragmentos_da_história');

function tableValue(markdown, field) {
    const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return (markdown.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+)\\|`, 'i')) || [])[1]?.trim() || '';
}

function parse(file) {
    const markdown = fs.readFileSync(path.join(sourceDir, file), 'utf8');
    const title = (markdown.match(/^#\s+(.+)$/m) || [])[1]?.trim() || file;
    const id = tableValue(markdown, 'ID');
    const order = Number(tableValue(markdown, 'Ordem'));
    const period = tableValue(markdown, 'Período');
    const declaredImage = tableValue(markdown, 'Imagem');
    const base = declaredImage.replace(/\.[^.]+$/, '');
    const actualImage = ['.png', '.jpg', '.jpeg', '.webp'].map(ext => `${base}${ext}`).find(name => fs.existsSync(path.join(imageDir, name))) || declaredImage;
    const summary = (markdown.match(/##\s+Resumo\s*\r?\n+([\s\S]*?)(?=\r?\n##\s+Diálogo)/i) || [])[1]?.trim() || '';
    const dialogueSource = (markdown.match(/##\s+Diálogo\s*\r?\n+([\s\S]*)$/i) || [])[1] || '';
    const dialogue = [];
    const expression = /^###\s+(\d+)\s*$\r?\n([\s\S]*?)(?=^###\s+\d+\s*$|\s*$)/gm;
    let match;
    while ((match = expression.exec(dialogueSource))) dialogue.push({ character: match[1].padStart(2, '0'), text: match[2].trim() });
    if (!id || !Number.isInteger(order) || !dialogue.length) throw new Error(`Fragmento inválido: ${file}`);
    return { id, order, title, period, image: actualImage, summary, dialogue, source: file };
}

const fragments = fs.readdirSync(sourceDir).filter(file => file.endsWith('.md')).map(parse).sort((a, b) => a.order - b.order);
const output = `'use strict';\n/* ARQUIVO GERADO: edite os Markdown e execute tests/build-history-fragments.js. */\nglobalThis.HISTORY_FRAGMENTS = Object.freeze(${JSON.stringify(fragments, null, 2)});\n`;
fs.writeFileSync(path.join(root, 'js', 'history-fragments.generated.js'), output, 'utf8');
console.log(`História gerada: ${fragments.length} fragmentos.`);
