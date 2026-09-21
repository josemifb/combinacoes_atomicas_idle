# Como contribuir com a Build 1

Este projeto usa HTML, CSS e JavaScript sem framework ou etapa obrigatória de
compilação. Para desenvolver localmente, execute na raiz:

```bash
python -m http.server 8765
```

Abra `http://localhost:8765` e mantenha o console do navegador visível durante
as alterações.

## Mapa mental do código

```text
index.html e css/             Interface
        ↓
intro.js / history.js         Fluxos de telas
        ↓
missions.js / fusion.js       Progressão e interação
        ↓
rules.js                      Regras puras e limites
        ↓
hardening.js                  Save, migração e ciclo de vida
        ↓
dados/ e imagens/             Conteúdo editorial
```

`engine.js` desenha e anima a AURORA. `periodic-table.js`, `discovery.js` e
`history.js` leem o progresso permanente, mas não devem conceder moedas ou
concluir missões durante a renderização.

## Conteúdo gerado

Não edite manualmente:

- `js/element-profiles.generated.js`;
- `js/history-fragments.generated.js`.

Depois de alterar os Markdown, execute:

```bash
node tests/build-element-profiles.js
node tests/build-history-fragments.js
```

## Verificação obrigatória

```bash
node tests/rules.test.js
node tests/discovery.test.js
node tests/periodic-table.test.js
node tests/verify-static.js
```

Além disso, valide o jogo em desktop, janela compacta, celular em retrato e
celular em paisagem. Teste os dois temas, teclado, prestígio e recarregamento.

## Regras que não podem ser quebradas

- Uma compra não equivale a uma descoberta por fusão.
- Prestígio não apaga descobertas, história ou módulos pós-ferro.
- A câmara possui exatamente oito slots.
- Resultados nunca ultrapassam `Z=118`.
- Os dois módulos devem alcançar o mesmo Tier para liberar uma faixa.
- Toda mudança no schema do save exige versão, migração e teste.
- Desktop e compra rápida móvel devem chamar a mesma operação econômica.

## Comentários

Explique a intenção e a regra de negócio, não apenas a sintaxe. Novos módulos
devem começar com um resumo de responsabilidade; funções que alterem save,
economia ou progressão devem documentar entradas, efeitos e invariantes.
