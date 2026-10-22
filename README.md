# MPTour

Site estático da MPTour, casa de roteiros privativos em Foz do Iguaçu. Esta primeira versão é uma home editorial. Quase todo o conteúdo é **PLACEHOLDER** — textos, legendas e fotografias. Não há preços.

O WhatsApp oficial não é placeholder. Ele vive num único lugar, `src/config/whatsapp.ts` (`+55 45 9927-2309`, `https://wa.me/554599272309`), e todos os CTAs — inclusive o formulário de orçamento que ainda não existe — devem usar `whatsappHref(locale, message?)`. As mensagens pré-preenchidas estão em português, espanhol e inglês.

## Rodar

```bash
npm ci
npm run dev
npm run verify
```

`verify` roda lint, Prettier, `astro check` e os testes. Os testes fazem o build duas vezes: em `/` e em `/mptour`.

## Endereço

- `https://mptour.github.io/` quando o repositório se chamar `mptour.github.io` (`BASE_PATH=/`).
- `https://mptour.github.io/mptour/` enquanto o repositório for `mptour`.

O workflow `.github/workflows/deploy.yml` escolhe o `base` pelo nome do repositório. No GitHub, a origem do Pages precisa ser **GitHub Actions**. Localmente, `npm run dev` e `npm run preview` usam `/`.

Para ver o modo project site:

```bash
BASE_PATH=/mptour npm run build
BASE_PATH=/mptour npm run preview
```

## Idiomas

Português é o padrão, em `/`. `/es/` está em espanhol (usted, para quem vem da Argentina ou do Paraguai) e `/en/` está em inglês. Os dois entram no índice, sem aviso de tradução e sem `noindex`.

## Como testar

O site usa `trailingSlash: 'always'`. Sem a barra no final, o preview não entrega a página.

```bash
npm run build
npm run preview
```

- http://127.0.0.1:4321/
- http://127.0.0.1:4321/es/
- http://127.0.0.1:4321/en/
- http://127.0.0.1:4321/creditos/

A navegação aponta para `/#territorios`, `/#experiencias`, `/#como-funciona` e `/#plan` (em `/es/` e `/en/`, o mesmo com o prefixo do idioma). Não existe uma página solta para essas seções.

## Fotografias

Arquivos provisórios do Wikimedia Commons, um por uso: o mosaico e os cards não repetem a mesma foto. Os créditos ficam em `/creditos/`, fora do rodapé. O hero continua uma foto grande da Garganta do Diabo. Por cima, quem aceita movimento vê um clipe mudo: 1280×720 nas telas largas e um corte 720×1280 abaixo de 840px. Os arquivos estão em `public/media/` e os créditos em `/creditos/`. Trocar a foto é substituir os arquivos em `src/assets/` e `public/og.jpg`.
