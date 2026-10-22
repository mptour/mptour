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

Português é o padrão, em `/`. `/es/` e `/en/` existem, mostram o texto em português e um aviso de que a tradução está em preparação, e saem com `noindex`. Os dicionários vazios estão em `src/i18n/es.ts` e `src/i18n/en.ts`.

## Fotografias

São arquivos provisórios do Wikimedia Commons, com crédito no rodapé e no alt (`PLACEHOLDER — …`). O hero usa uma foto da Garganta do Diabo e, em telas largas, um clipe mudo de sete segundos só depois do carregamento. Trocar a mídia é substituir os arquivos em `src/assets/` e `public/og.jpg`.
