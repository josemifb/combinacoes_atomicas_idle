'use strict';
const assert=require('node:assert/strict');
global.ASSET_PATHS=require('../js/assets.js');
const Encyclopedia=require('../js/element-encyclopedia.js');
const {DISCOVERY_DIALOGUES,HYDROGEN_DIALOGUES}=require('../js/discovery.js');
const presenters=new Set();
for(let z=1;z<=118;z++){const code=Encyclopedia.presenterFor(z);assert.match(code,/^(0[1-9]|10)$/);presenters.add(code);}
assert.equal(presenters.size,10,'Os dez personagens devem apresentar ao menos um elemento');
const markdown=`# Carbono (C) — Nº 6
| Propriedade | Valor |
|---|---|
| Símbolo | **C** |
| Número atômico (Z) | 6 |
| Massa atômica | 12,011 u |
| Distribuição eletrônica | [He] 2s² 2p² |
| Grupo / Período | 14 / 2 |
| Classificação | Não metal |
| Estado a 25 °C | Sólido |
| Fusão / Ebulição | sublima |
## Descoberta
- Conhecido desde a pré-história
## Abundância e ocorrência
Presente na vida.
## Aplicações
Aço e grafite.
## Curiosidade
Possui alótropos.`;
const entry=Encyclopedia.parse(markdown,{protons:6,symbol:'C',namePt:'carbono',nameClean:'carbono',massDisplay:'12.011',imagePath:'x.png'});
assert.equal(entry.family,'Família do carbono');assert.equal(entry.block,'p');assert.equal(entry.positionLabel,'14 / 2');assert.equal(entry.presenterCode,'03');assert.match(entry.discovery,/pré-história/);
for(const lang of ['pt','en']){
    assert.equal(HYDROGEN_DIALOGUES[lang].length,3,`Hidrogênio deve ter três falas em ${lang}`);
    for(const code of presenters){
        const lines=DISCOVERY_DIALOGUES[lang][code];
        assert.ok(Array.isArray(lines),`Apresentador ${code} sem falas em ${lang}`);
        assert.ok(lines.length>=3,`Apresentador ${code} precisa de pelo menos três falas em ${lang}`);
        for(const line of lines)assert.equal(typeof line({name:'Hélio',symbol:'He',z:2}),'string');
    }
}
console.log('Descobertas: mapeamento dos 118 elementos, dez apresentadores e parser enciclopédico verificados.');
