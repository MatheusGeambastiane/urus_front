This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testes automáticos do frontend

A suíte E2E usa Playwright e inicia sozinha uma instância isolada do Next.js e
uma API simulada. Ela não grava dados no backend real.

Na primeira execução, instale o Chromium e as dependências do sistema:

```bash
npx playwright install --with-deps chromium
```

Para executar todos os testes em modo headless:

```bash
npm run test:e2e
```

Para abrir a interface do Playwright e acompanhar os testes no navegador:

```bash
npm run test:e2e:ui
```

Também é possível executar diretamente em uma janela visível com
`npm run test:e2e:headed`. Em falhas, vídeos, screenshots e traces ficam em
`test-results/`, e o relatório HTML em `playwright-report/`.

## Login Google do dashboard

Configure no ambiente do backoffice:

```env
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
```

Cadastre no cliente OAuth do Google a URI de callback do backoffice:

- `http://localhost:3000/api/auth/callback/google`
- `https://backoffice.urusbarbearia.com.br/api/auth/callback/google`

O backend deve usar o mesmo client id em `GOOGLE_OAUTH2_CLIENT_ID`. Esse fluxo
somente autentica e vincula contas staff existentes; ele nunca cria usuários.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
