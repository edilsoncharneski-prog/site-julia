# STATUS DO PROJETO - ELETROSOM EBIKES

**Data:** 23/10/2026  
**Repositório:** `https://github.com/edilsoncharneski-prog/site-julia.git` (Branch `main`)  
**Status do Build:** Compilação 100% validada (`next build` com Turbopack e TypeScript sem erros).

---

## 1. O QUE ESTÁ IMPLEMENTADO E PERSISTIDO

1. **Remoção Completa de "Oficina":**
   - Nenhuma menção a oficina própria ou assistência local em todo o site.
   - Diferenciais oficiais ativos: *"Até 12x no Cartão | Pronta Entrega + Encomenda | Garantia de Fábrica"*.

2. **Catálogo Completo (~70 itens / 29 modelos / 94 variações de cores):**
   - Todas as variações agrupadas por modelo com seletor de cores (color swatches) estilo concessionária Mova.
   - 97 imagens transparentes tratadas em `.webp` de alta resolução em `public/motos/`.

3. **Regras de Estoque e Disponibilidade (17 Pronta Entrega Exatos):**
   - As 17 variações físicas da loja oficial marcadas como `pronta_entrega` tanto em `src/data/produtos-loja.json` quanto no banco Supabase (`produto_variacoes`):
     1. **Scooter Capuccino 1000W:** Bege, Rosa/Bege, Verde/Bege, Vermelho/Bege, Cinza (5)
     2. **Scooter Shark 1000W:** Amarelo, Vermelho (2)
     3. **Scooter H9 1000W:** Preto/Prata (1)
     4. **Scooter B3 1000W:** Preto (1)
     5. **Scooter T1 1000W:** Azul Camaleão, Verde Camaleão, Vermelho/Prata (3)
     6. **Bike JSL 1000W:** Preto/Marrom (1)
     7. **Scooter Harley 1000W:** Azul, Branco, Preto, Vermelho (4)
   - Todas as demais 77 variações estão configuradas como `sob_pedido`.

4. **Ficha Técnica Completa da Soollar:**
   - Extraídos todos os campos técnicos da Soollar (Marca, Linha, Motor Elétrico, Bateria, Velocidade Máxima, Autonomia, Tempo de Recarga, Capacidade máxima de carga, Painel, Freios Dianteiro/Traseiro, Pneus/Rodas, Alarme, Controlador, Carregador, Entre-eixos, Dimensões e Peso Líquido).
   - Renderizados dinamicamente na página de detalhes do veículo `/produto/[slug]` no grid moderno da Mova.

5. **Vídeos de Apresentação (Google Drive Embed):**
   - 18 modelos possuem vídeos oficiais de apresentação capturados da Soollar e salvos na coluna `video_url` do Supabase.
   - Renderizados em iframe responsivo 16:9 no formato `/preview` em `/produto/[slug]`. Quando o veículo não possui vídeo, a seção é ocultada automaticamente.

6. **Painel Administrativo (`/admin`):**
   - Gerenciamento direto com chamadas à Data API do Supabase via Server Actions.
   - Alternância em tempo real entre Pronta Entrega e Sob Pedido com revalidação automática de rotas.
