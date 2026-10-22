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
```

Para remover os PNGs originais após a conversão:

```bash
npm run convert:motos -- --delete-originals
```

## Catálogo

Os modelos ficam em `src/data/produtos-loja.json`, agrupados por veículo com uma
lista de variações de cor. Cada variação possui nome, cor hexadecimal, imagem e o
slug antigo (para preservar links já compartilhados). Os cards da vitrine exibem
apenas foto quadrada, nome do modelo, amostras de cor e o botão "VER DETALHES".
A ficha técnica completa fica na página `/produto/[slug]`.

## Deploy

O projeto está preparado para a Vercel. Configure as variáveis de
`.env.example` no painel do projeto. Quando o novo domínio for apontado, basta
definir `NEXT_PUBLIC_SITE_URL=https://www.eletroscoortes.com`.
