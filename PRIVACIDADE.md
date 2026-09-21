# Privacidade e armazenamento local

## Resumo

Combinações Atômicas Idle não exige cadastro e não mantém um servidor próprio
de contas. O progresso do jogo é armazenado localmente pelo navegador no
dispositivo utilizado.

## Dados mantidos no navegador

A aplicação pode guardar localmente:

- nome escolhido pelo jogador;
- moedas, fótons e melhorias;
- missões e nível atual;
- prestígios realizados;
- elementos descobertos;
- fragmentos históricos desbloqueados e lidos;
- tema, idioma e conclusão do tutorial;
- horários necessários para calcular ganhos offline.

Esses dados são usados somente para restaurar a sessão e o progresso do jogo.
Na implementação atual, eles não são enviados a um servidor próprio do projeto.

## Perda e recuperação

Não existe sincronização em nuvem nem mecanismo remoto de recuperação. O
progresso poderá ser perdido de forma definitiva se a pessoa:

- apagar os dados, cookies ou armazenamento do site;
- utilizar ferramentas de limpeza do navegador;
- reinstalar ou redefinir o navegador;
- trocar de navegador, perfil ou dispositivo;
- usar navegação privada, dependendo das regras do navegador;
- bloquear ou limitar o `localStorage`;
- perder o dispositivo ou os arquivos locais.

O projeto não consegue recuperar um save removido do navegador.

## Conexões externas

O progresso não é enviado intencionalmente para serviços externos. Entretanto,
a versão atual carrega fontes tipográficas do Google Fonts. Essa requisição de
recurso pode fornecer ao provedor informações técnicas normalmente presentes
em conexões web, como endereço IP, navegador e horário da solicitação, conforme
as políticas do próprio provedor.

Servidores ou plataformas usados por terceiros para hospedar uma cópia do jogo
também podem manter seus próprios registros técnicos. Essas práticas não são
controladas pelo código do jogo e devem ser informadas por quem realizar a
hospedagem.

## Inteligência artificial

O uso de inteligência artificial ocorreu durante o desenvolvimento. A
aplicação não envia o nome, save ou ações do jogador a um modelo de IA durante
a execução normal do jogo.

## Recomendações

- Não utilize informações pessoais ou sensíveis como nome de jogador.
- Não dependa do save local como única cópia de algo importante.
- Leia a política da plataforma que estiver hospedando o jogo.
- Em dispositivos compartilhados, outras pessoas com acesso ao mesmo perfil do
  navegador podem acessar ou apagar o progresso.

## Alterações futuras

Se uma versão futura introduzir contas, telemetria, sincronização, publicidade
ou serviços de terceiros, este documento deverá ser atualizado antes da
publicação dessa funcionalidade.

© 2026 José Miguel.
