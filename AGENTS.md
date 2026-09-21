# Diretrizes Técnicas e de Branding — Sandra Carlos Consultoria Imobiliária

Este documento serve como memória permanente e guia de regras de design, branding, arquitetura e convenções técnicas para qualquer assistente de código a operar neste repositório.

---

## 1. Identidade de Marca & Branding

- **Nome Oficial**: Sandra Carlos Consultoria Imobiliária
- **Atuação**: Consultora imobiliária no concelho de Pombal, Portugal e região circundante.
- **Diferencial & Posicionamento**: Mais de 11 anos de experiência, dedicação, rigor, proximidade e compromisso no acompanhamento de famílias e investidores na compra e venda de imóveis.
- **Afiliação & Licença**:
  - Licença AMI: **15766**
  - Rede parceira: **Expertimo Portugal** (`/expertimo-logo.png`)
  - Distinção: **Agente Pro** (`/agente-pro.png`)
- **Contactos Oficiais**:
  - Telefone & WhatsApp: `+351 965881547` (`https://wa.me/351965881547`)
  - E-mail: `sandra.carlos@expertimo.eu`
  - Instagram: `@sandracarlosimobiliaria` (`https://instagram.com/sandracarlosimobiliaria`)

---

## 2. Paleta de Cores & Design Tokens

A estética do projeto segue o conceito de **Quiet Luxury / Editorial de Arquitetura**:

| Token | Código Hexadecimal | Aplicação Principal |
| :--- | :--- | :--- |
| **Canvas Principal** | `#faf8f5` | Fundo geral da aplicação (off-white quente e acolhedor) |
| **Canvas Secundário** | `#fcfbf9` / `#FDF7F6` | Fundo de secções alternadas e cartões limpos |
| **Castanho Assinatura (Escuro)** | `#36210f` / `#321f12` | Títulos primários, seletores, botões principais, cabeçalhos escuros |
| **Castanho Profundo** | `#422502` | Faixa de voltar ao topo em detalhe do imóvel e detalhes finos |
| **Bege Areia / Editorial** | `#d8be9e` | Fundo do rodapé principal (Footer) |
| **Borda do Rodapé** | `#c5ab8d` | Divisores e linhas no rodapé |
| **Dourado Ocre / Accent** | `#b38b59` / `#b87d1d` | Subtítulos de categoria, detalhes de luxo, ícones de destaque |
| **Dourado Vibrante** | `#D6920B` | Setas e apontamentos interativos em fundos escuros |
| **Texto Primário** | `#1c1917` (Stone-900) | Títulos e parágrafos de alta legibilidade |
| **Texto Secundário** | `#57534e` (Stone-600) | Metadados, descrições, etiquetas |
| **Bordas Neutras** | `#e7e5e4` / `#ede5e3` | Divisores subtis entre secções |

---

## 3. Tipografia & Hierarquia de Texto

As fontes estão configuradas em `index.html` e `src/index.css`:

1. **Serifas Editoriais de Luxo**:
   - `Cormorant Garamond`, `Bodoni Moda`, `Cinzel`
   - Uso: Títulos de imóveis, citações, monogramas, selos de destaque ("VENDIDO", "RESERVADO", "NOVIDADE").
2. **Sans-Serif Moderna & Funcional**:
   - `Plus Jakarta Sans`
   - Uso: Textos corridos, botões, filtros, navegação, tabelas técnicas, formulários e metadados.
3. **Regras de Tracking e Caixas**:
   - Rótulos e eyebrows sempre em caixa alta com espaçamento alargado: `tracking-[0.20em]` a `tracking-[0.35em]`.
   - Textos de botões em uma única linha (sem quebra ou hifenização).

---

## 4. Princípios Estéticos & Regras "Anti-Slop"

- **Sem clichés de IA**: Proibido usar gradientes de roxo/azul, botões com sombras neon/glow, ou efeitos de vidro translúcido exagerados em fundo escuro.
- **Cantos e Formas**: Preferência por cantos retos (`rounded-none` ou `rounded-sm`/`rounded-md` max 6-8px). Nunca usar cartões tipo "bolha" com raios de 24px+ em blocos de conteúdo.
- **Contraste & Espaço Negativo**: Margens generosas (`py-20`, `px-6 sm:px-12 lg:px-20`), divisores finos de 1px e hierarquia clara por escala tipográfica em vez de caixas dentro de caixas.
- **Proteção de Imagens**: Proteção contra arrastar e guardar acidentalmente (`user-drag: none`, menu de contexto protegido em fotos de imóveis).

---

## 5. Estrutura de Pastas e Ficheiros

```
/
├── index.html                       # Entry-point HTML com metatags SEO e fontes Google
├── metadata.json                    # Nome, descrição e capabilities do applet
├── package.json                     # Dependências (React 19, Tailwind v4, Motion, Lucide)
├── vite.config.ts                   # Configuração Vite com plugin Tailwind v4
├── public/                          # Ativos públicos (logos, avatar, fotos hero)
│   ├── expertimo-logo.png           # Logo Expertimo
│   ├── agente-pro.png               # Badge Agente Pro
│   ├── logo.png                     # Logo principal Sandra Carlos
│   └── sandra.jpg                   # Fotografia profissional da consultora
├── src/
│   ├── main.tsx                     # Ponto de montagem React
│   ├── App.tsx                      # Orquestrador de estado global, rotas e modais
│   ├── index.css                    # Tailwind CSS v4, animação dinâmica do cabeçalho
│   ├── types.ts                     # Interfaces TypeScript (Property, TipArticle, etc.)
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── Header.tsx               # Cabeçalho com logo dinâmico reativo ao scroll
│   │   ├── Footer.tsx               # Rodapé com contactos, AMI 15766 e logos parceiros
│   │   ├── ContactModal.tsx         # Modal de contacto com formulário direto
│   │   ├── CookieModal.tsx          # Gestão de cookies e consentimento
│   │   ├── FeaturedPropertiesSection.tsx # Secção de imóveis em destaque na Home
│   │   ├── FeaturedSelectorModal.tsx     # Seletor administrativo de destaques
│   │   ├── PropertyMap.tsx          # Mapa Leaflet integrado
│   │   ├── PropertyModal.tsx        # Modal rápido de visualização de imóvel
│   │   └── TipArticleModal.tsx      # Modal de leitura de artigos/dicas
│   ├── pages/                       # Vistas principais
│   │   ├── HomePage.tsx             # Página inicial com hero, biografia, destaques
│   │   ├── HousesPage.tsx           # Catálogo completo de imóveis com filtros
│   │   ├── PropertyDetailPage.tsx   # Ficha completa e detalhada do imóvel
│   │   ├── AboutPage.tsx            # Página biográfica "Sobre Mim"
│   │   ├── TipsPage.tsx             # Dicas e artigos (temporariamente desativado)
│   │   └── NotFoundPage.tsx         # Página 404 personalizada
│   ├── data/
│   │   ├── properties.ts            # Base de dados de imóveis estruturada
│   │   └── tipsData.ts              # Artigos imobiliários e guias
│   └── utils/
│       ├── featuredManager.ts       # Gestão de imóveis em destaque (localStorage)
│       ├── imageProtection.ts       # Script de proteção de cópia de imagens
│       └── seo.ts                   # Atualização dinâmica de título e meta-tags
```

---

## 6. Arquitetura de Navegação & Rotas

- Roteamento SPA nativo sem recarregamento de página via History API:
  - `/` ou `home` → `HomePage`
  - `/casas` → `HousesPage` (catálogo geral de imóveis)
  - `/casas?id=:propertyId` → `PropertyDetailPage` (quando `selectedProperty !== null`)
  - `/sobre` ou `/sobre-mim` → `AboutPage`
  - `/contatos` ou `#contatos` → Scroll suave para secção de contactos
- Sempre que a rota muda, o scroll é forçado instantaneamente para o topo (`window.scrollTo(0, 0)`).

---

## 7. Próximas Implementações Pendentes

1. **Selos de Estado nos Imóveis ("RESERVADO", "NOVIDADE", "VENDIDO")**:
   - Inspirado no exemplo editorial de alta gama (`JUST SOLD`).
   - Tipografia de luxo com serifa (Bodoni/Cinzel/Cormorant), caixa alta, overlay subtil escuro sobre a foto e posicionamento elegante.
   - Suporte na interface de dados (`Property.status` / `badge`).
2. **Widget Flutuante / Pop-up de Contacto no Canto Inferior Direito**:
   - **Regra estrita**: Deve aparecer em **todas as páginas**, **EXCETO** quando o utilizador está dentro da página de detalhe de um imóvel (`!selectedProperty`).
   - **Foco principal**: Conversa direta via WhatsApp (`+351 965881547`).
   - **Responsividade total**: Visível e funcional em Mobile, Tablet, PC, rotação horizontal/vertical, com respeito às safe areas.

---

## 8. Diretriz Permanente: Contexto Específico por Página & SEO de Alta Competência

Em todas as tarefas, prompts e alterações de código, as seguintes diretrizes são de aplicação mandatória:

1. **Ajuste Contextual ao Conteúdo da Página em Edição**:
   - Sempre que se trabalha ou edita o código de uma página específica (`HomePage`, `HousesPage`, `PropertyDetailPage`, `AboutPage`, `TipsPage`, etc.), todas as alterações, textos e metadados devem refletir com precisão cirúrgica o propósito, tema e conteúdo dessa página em concreto.
   - Evitar textos ou metadados genéricos; cada vista deve ter a sua identidade textual e semântica própria.

2. **SEO Competente e Rigoroso em Cada Alteração**:
   - **Hierarquia Semântica**: Estruturação lógica e acessível (`<h1>`, `<h2>`, `<h3>`), sem saltar níveis hierárquicos.
   - **Palavras-chave Locais e de Intenção**: Integrar naturalmente termos de pesquisa imobiliária regional (*Pombal, Leiria, Portugal, consultoria imobiliária, comprar casa, moradias exclusivas, apartamentos, terrenos, investimento imobiliário, AMI 15766*).
   - **Atributos de Imagem para SEO**: Todas as tags `<img>` devem ter atributos `alt` altamente descritivos e contextuais, dimensões explícitas `width` e `height`, e carregamento otimizado (`loading="eager"` para o Hero LCP, `loading="lazy"` para o restante).
   - **Metadados e Schema.org**: Sincronização constante de `title`, `meta description`, Open Graph (`og:*`), Twitter Cards e marcação JSON-LD rica (ex.: `RealEstateAgent`, `SingleFamilyResidence`, `BreadcrumbList`, `Article`).
   - **Performance e Core Web Vitals**: Formatos modernos (`.webp`), prevenção de Content Layout Shift (CLS), tempos de resposta céleres e acessibilidade WCAG AA.

