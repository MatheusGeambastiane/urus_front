# Urus Frontend

Aplicação Next.js que concentra o backoffice da barbearia Urus. O projeto foi organizado para que as rotas do App Router fiquem enxutas e toda a lógica de cada domínio viva em `src/features`.

## Como rodar

```bash
npm install
npm run dev
```

## Organização das pastas

```
src/
├─ app/                    # Rotas, layouts e loaders do App Router
├─ features/
│  ├─ dashboard/           # Componentes, dados e providers do dashboard
│  │  ├─ components/       # UI específica do dashboard (home, navegação, etc.)
│  │  ├─ data/             # Constantes e mapeamentos (ex.: tabs)
│  │  ├─ providers/        # Contextos como o DashboardProvider
│  │  └─ services/         # Cliente HTTP (createDashboardClient) e erros
│  └─ agenda/              # Funcionalidades do módulo de agenda
│     ├─ components/       # Páginas e componentes de UI do módulo
│     └─ hooks/            # Hooks de dados, ex.: useDashboardAppointments
├─ lib/                    # Configurações e utilitários globais (auth, env, etc.)
├─ providers/              # Providers compartilhados (AuthSessionProvider)
├─ shared/
│  └─ assets/
│     └─ icons/            # Ícones/SVG importados via Next Image
├─ styles/                 # Camadas globais (ex.: globals.css)
└─ types/                  # Tipos globais e declarações (.d.ts)
```

Recursos estáticos seguem o padrão:

- `public/marketing`: imagens institucionais usadas nas telas de login e do dashboard.
- `src/shared/assets/icons`: ícones reutilizáveis importados como módulos (ver `src/shared/assets/icons/index.ts`).

Todos os imports absolutos utilizam o alias `@/*`, mapeado para `src/*` no `tsconfig.json`.

## Fluxo de dados do dashboard

- `src/features/dashboard/services/dashboard-client.ts` centraliza chamadas HTTP, trata erros (`DashboardApiError`) e aplica o token de sessão.
- `src/features/dashboard/providers/dashboard-provider.tsx` apenas orquestra sessão/autenticação e expõe `fetchDashboard`, `accessToken` e `refreshToken` via contexto.
- Hooks específicos (ex.: `useDashboardAppointments`) recebem `fetchDashboard` do contexto e ficam sob o respectivo domínio em `src/features/<feature>/hooks`.

Esse formato facilita adicionar novos domínios: crie uma pasta em `src/features`, exponha componentes/hook/services dali e use-os diretamente nas rotas dentro de `src/app`.
