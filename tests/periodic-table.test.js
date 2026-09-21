'use strict';
const assert = require('node:assert/strict');
const { PERIODIC_CATEGORIES, PERIODIC_CATEGORY_ORDER, PERIODIC_CATEGORY_BY_Z, periodicPosition, completedPeriodicCategories } = require('../js/periodic-table.js');

assert.equal(PERIODIC_CATEGORY_ORDER.length, 10, 'A tabela deve possuir dez conquistas de famílias.');
const classified = PERIODIC_CATEGORY_ORDER.flatMap(key => PERIODIC_CATEGORIES[key]);
assert.equal(classified.length, 118, 'As famílias devem cobrir os 118 elementos sem lacunas.');
assert.equal(new Set(classified).size, 118, 'Nenhum elemento pode pertencer a duas conquistas.');
assert.deepEqual([...new Set(classified)].sort((a, b) => a - b), Array.from({ length: 118 }, (_, i) => i + 1));

const coordinates = new Set();
for (let z = 1; z <= 118; z++) {
    assert.ok(PERIODIC_CATEGORY_BY_Z[z], `Elemento Z=${z} sem categoria.`);
    const position = periodicPosition(z);
    assert.ok(position, `Elemento Z=${z} sem posição.`);
    assert.ok(position.column >= 1 && position.column <= 18, `Coluna inválida para Z=${z}.`);
    assert.ok(position.row >= 1 && position.row <= 9, `Linha inválida para Z=${z}.`);
    const key = `${position.row}:${position.column}`;
    assert.ok(!coordinates.has(key), `Posição duplicada em ${key}.`);
    coordinates.add(key);
}

const onlyAlkali = new Set(PERIODIC_CATEGORIES.alkali);
assert.deepEqual(completedPeriodicCategories(onlyAlkali), ['alkali']);
const almostAll = new Set(Array.from({ length: 117 }, (_, i) => i + 1));
assert.equal(completedPeriodicCategories(almostAll).length, 9, 'Sem Og, gases nobres ainda não estão completos.');
const all = new Set(Array.from({ length: 118 }, (_, i) => i + 1));
assert.equal(completedPeriodicCategories(all).length, 10);

console.log('Tabela periódica: 118 posições únicas, dez categorias exclusivas e conquistas verificadas.');
