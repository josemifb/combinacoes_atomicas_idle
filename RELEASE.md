# Combinações Atômicas Idle — Build 1.1

**Data:** 21 de setembro de 2026  
**Direção e autoria:** José Miguel

## Sobre esta versão

Combinações Atômicas Idle é um jogo incremental educacional para navegador. O
jogador administra o Anel de Síntese AURORA, realiza combinações abstratas de
núcleos, descobre os 118 elementos e acompanha momentos da História da Química.

A Build 1.1 consolida o conteúdo público da primeira versão e corrige a
apresentação em celulares, tablets, notebooks e janelas compactadas.

## Recursos principais

- progressão por 50 missões e ciclos de prestígio;
- Tabela Periódica vitalícia com 118 elementos e insígnias por famílias;
- 13 fragmentos da História da Química desbloqueados por prestígio;
- diálogos históricos com personagens e imagens em pixel art;
- fichas enciclopédicas de descoberta;
- síntese pós-ferro com AURORA e dois módulos complementares;
- ganhos ativos, passivos e offline;
- Mercado Quântico com melhorias temporárias e permanentes;
- temas claro e escuro;
- suporte a teclado, foco, redução de movimento e interface responsiva;
- persistência local sem cadastro ou conta remota.

## Alterações da Build 1.1

### Linha do tempo

- novo cenário `tela_fundo_linha_tempo.jpg` com camada de contraste;
- cards bloqueados mais harmonizados com o cenário;
- botão histórico adaptado ao tema claro;
- ícone histórico ampliado para melhor reconhecimento.

### Interface compacta e móvel

- corrigido o corte que tornava Melhorias e Injeções inacessíveis;
- fluxo vertical rolável para viewports estreitos;
- barra inferior fixa com Mercado Quântico e compra direta de H;
- mercado móvel centralizado com seis utilidades em grade 2 × 3 ou 3 × 2;
- núcleo-base removido do interior do mercado móvel para evitar duplicação;
- reserva de espaço para barra móvel, área segura e crédito global.

### Refinamentos

- ícones das moedas ampliados;
- espaçamento interno do card do núcleo-base aprimorado;
- botão de injeção redimensionado;
- contrastes revisados nos temas claro e escuro.

## Persistência

O progresso é salvo no `localStorage` do navegador. Não há conta, nuvem ou
recuperação remota. Apagar os dados do site, trocar de navegador ou usar uma
sessão privada pode eliminar o progresso de forma irreversível.

## Como executar

Na raiz do projeto:

```bash
python -m http.server 8765
```

Depois, abra `http://localhost:8765`.

## Avisos

O jogo utiliza uma abstração lúdica baseada no número atômico e não é um
simulador de física nuclear. O projeto foi desenvolvido com apoio de
inteligência artificial generativa e pode conter erros. Consulte
`DECLARACAO.md` e `PRIVACIDADE.md` para detalhes.

© 2026 José Miguel. Projeto disponibilizado para acesso público.
