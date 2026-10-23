# Eletrosom Ebikes

Loja e catálogo de veículos elétricos (motos, scooters, bikes e triciclos) de
Cotriguaçu-MT. O site é construído com Next.js (App Router), TypeScript, Tailwind
CSS v4, Supabase e deploy na Vercel.

> Domínio futuro: `www.eletroscoortes.com`. Até o apontamento do domínio, o
> ambiente da Vercel continua ativo. A URL pública é configurada por
> `NEXT_PUBLIC_SITE_URL`.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts úteis

```bash
npm run build          # valida a compilação de produção
npm run convert:motos  # converte os PNGs de public/motos para WebP (qualidade 85)
npm run brand:assets   # regenera logo, ícone e imagem Open Graph
npm run import:soollar # importa as imagens oficiais da Soollar para WebP
npm run import:soollar:full # importa as 71 imagens do catálogo completo
npm run scan:soollar   # autentica na Soollar e gera o inventário completo
npm run db:seed        # envia produtos e variações para o Supabase
```

Para remover os PNGs originais após a conversão:

```bash
npm run convert:motos -- --delete-originals
```

## Catálogo

Os modelos ficam em `src/data/produtos-loja.json`, agrupados por veículo com uma
lista de variações de cor. Cada variação possui nome, cor hexadecimal, imagem,
slug antigo (para preservar links já compartilhados) e o campo
`disponibilidade`, que aceita `pronta_entrega` ou `sob_pedido`.

O catálogo completo tem **29 modelos e 94 variações**, sendo **17 variações com
pronta entrega** e as restantes sob pedido. As imagens oficiais ficam em
`public/motos/` no formato WebP.

Os cards da vitrine exibem foto quadrada, nome do modelo, amostras de cor, badge
de disponibilidade e o botão "VER DETALHES". O badge e a mensagem de WhatsApp
mudam junto com a cor selecionada. A ficha técnica completa fica na página
`/produto/[slug]`.

## Estoque e painel administrativo

Em `/admin`, cada cor pode ser alternada entre **Pronta Entrega** e **Sob Pedido**
com um clique na coluna "Disponibilidade por cor" ou no formulário de edição. O
formulário também permite adicionar, remover e editar as cores do modelo.

O painel guarda alterações no `localStorage` e também está preparado para a
persistência no Supabase. A migração do banco está em
`supabase/migrations/20261022_produto_variacoes.sql`.

> A `SUPABASE_SERVICE_ROLE_KEY` permite ler/escrever na Data API, mas **não executa
> DDL**. Para criar a tabela `produto_variacoes`, aplique a migração pelo SQL
> Editor do Supabase ou por uma conexão Postgres com a senha do banco. Depois rode
> `npm run db:seed`.

## Deploy

O projeto está preparado para a Vercel. Configure as variáveis de
`.env.example` no painel do projeto. Quando o novo domínio for apontado, basta
definir `NEXT_PUBLIC_SITE_URL=https://www.eletroscoortes.com`.
