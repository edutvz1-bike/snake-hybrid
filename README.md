# Snake Hybrid

Jogo Snake inspirado no clássico Nokia, com visual retrô moderno, controles para teclado e celular, sons gerados no navegador, recorde local e ranking global via Cloudflare D1.

## Estrutura

- `public/`: site estático (HTML, CSS e JavaScript).
- `functions/api/`: endpoints da Cloudflare Pages Functions.
- `migrations/`: estrutura inicial do banco D1.
- `wrangler.toml`: configuração do projeto Cloudflare.

## Rodar localmente

O jogo abre diretamente ao abrir `public/index.html`, mas o ranking online exige Cloudflare Pages Functions e D1.

Para testar localmente com Wrangler:
1. Instale Node.js (versão LTS).
2. Instale Wrangler: `npm install -g wrangler`
3. Na pasta do projeto, configure o banco D1 seguindo a seção abaixo.
4. Execute `wrangler pages dev public`.

## Publicar no GitHub

1. Crie um repositório no GitHub chamado `snake-hybrid`.
2. Envie todos os arquivos desta pasta para a raiz do repositório (não envie apenas a pasta `public`).
3. Mantenha o repositório público ou conecte sua conta GitHub à Cloudflare.

## Configurar o ranking online com Cloudflare D1

1. Entre no painel Cloudflare: https://dash.cloudflare.com/
2. Abra **Workers & Pages → D1 SQL Database** e crie um banco chamado `snake-hybrid-db`.
3. Copie o **Database ID** exibido pelo Cloudflare.
4. Abra `wrangler.toml` e substitua `COLE-AQUI-O-DATABASE-ID` pelo ID real.
5. No banco D1, abra **Console** e execute o conteúdo de `migrations/0001_create_scores.sql`.
6. No painel Cloudflare, abra **Workers & Pages → Create application → Pages → Connect to Git**.
7. Escolha o repositório `snake-hybrid`.
8. Em configurações de build, deixe o comando de build vazio e defina **Build output directory** como `public`.
9. Depois de criar o projeto Pages, vá em **Settings → Functions → D1 database bindings**.
10. Adicione o binding com variável `DB` e selecione o banco `snake-hybrid-db`.
11. Salve e faça um novo deploy.

> Importante: o binding `DB` é o que conecta as Pages Functions ao banco. O `wrangler.toml` também documenta essa associação para uso com Wrangler. Se você criar o projeto pelo painel, confira o binding nas configurações de Pages.

## Como funciona

- Recorde pessoal: `localStorage` no navegador/dispositivo.
- Sons: Web Audio API, sem arquivos externos.
- Ranking: `GET /api/leaderboard`.
- Envio de pontuação: `POST /api/scores`.

## Próximas melhorias recomendadas

A versão inicial valida nome e pontuação no servidor, mas um jogo público precisa de proteção adicional contra pontuações forjadas e spam. Para uma versão de produção, implemente validação de partidas no servidor, limites de requisição (rate limiting) e/ou Turnstile. O ranking atual é uma tabela de melhores pontuações por nome, não uma identidade autenticada.
