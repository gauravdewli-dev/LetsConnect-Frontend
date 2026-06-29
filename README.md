# LetsConnect — Frontend

React dashboard for connecting integrations, chatting with the AI assistant, and managing OAuth flows for Gmail, Slack, and Jira.

## Requirements

- Node.js **18+**
- Running [LC-Backend](../LC-Backend/) on the URL configured in `.env`

## Setup

```bash
cd LC-Frontend
cp .env.example .env
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

### Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend base URL (no trailing slash) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Serve production build locally |

## Project structure

```
src/
├── main.tsx                 # Entry, Redux store, router
├── services/
│   └── api.ts               # Axios instance, token refresh, interceptors
├── lib/
│   ├── authSession.ts       # Sync JWT localStorage ↔ Redux
│   ├── connectionCache.ts   # Connection status cache + OAuth in-progress flags
│   └── dashboardTab.ts      # Persist active tab (localStorage + URL)
├── models/
│   └── auth-model/          # Auth slice, sagas, login API
├── routing/
│   ├── routes.tsx           # Route table from page registry
│   └── AuthGuard.tsx        # Protected routes, silent token refresh
└── pages/
    ├── auth-management/     # Login, signup, verify email
    ├── dashboard/           # Main app (graph, chat, developer guide)
    └── success/             # Post-OAuth success tour
```

## Main features

### Dashboard tabs

Three tabs, persisted across reloads via `?tab=` and `localStorage` (`lc-dashboard-tab`):

| Tab | Route param | Component |
|-----|-------------|-----------|
| Connected accounts | `dashboard` | Integration graph (React Flow) |
| Text chat | `chat` | AI chat UI |
| Developer guide | `developer` | Slack/Jira setup instructions |

### Integration graph

- Drag-and-drop nodes: **Gmail**, **Slack**, **Jira** → **LetsConnect** hub.
- Connect: calls `GET /api/integrations/{provider}/connect-url` then redirects to OAuth (no JWT in URL).
- Disconnect: `DELETE /api/{provider}`; Slack also clears chat and uninstalls the workspace app.
- Status from Redux `connections` slice; cached in `localStorage` for fast first paint.

### Text chat

- Loads history on mount: `GET /api/chat/messages`.
- Sends messages: `POST /api/chat` (server loads agent context from Mongo — client does not send full history).
- Shows **Web** / **Slack** labels on messages from shared conversation.
- Skeleton loader while history loads; retry on failure.
- Slack connect/disconnect refreshes or clears chat automatically.

## State management

### Redux

| Slice | Purpose |
|-------|---------|
| `auth` | JWT, user profile, login loading/errors |
| `connections` | Integration status, connecting/disconnect UI state |

### Sagas (`redux-saga`)

- **Auth:** login → fetch `/auth/me`
- **Connections:** `triggerInitializeConnections` — status fetch, optional profile backfill (max 2 requests)

### Auth & session

- Tokens in `localStorage`: `token`, `refresh_token`
- Axios interceptor refreshes on `401` and retries once
- `persistAuthTokens()` keeps Redux in sync after refresh
- `AuthGuard` attempts silent refresh before redirecting to login
- Connect/disconnect cycles do **not** require re-login while refresh token is valid

## API client

Dashboard API helpers live in `src/pages/dashboard/api.ts`:

```typescript
getStatus()
backfillConnectionProfiles()
getIntegrationConnectUrl("gmail" | "slack" | "jira")
getChatMessages({ limit?, before? })
postChat({ message, conversation_id? })
disconnectGmail() / disconnectSlack() / disconnectJira()
```

All use the shared `apiService` from `src/services/api.ts`.

## Routing

Pages are registered under `src/pages/` and flattened in `routing/routes.tsx`.

| Path | Public | Description |
|------|--------|-------------|
| `/login` | Yes | Login / signup |
| `/` | No | Dashboard (tab from query) |
| `/success` | Yes | OAuth return + onboarding tour |
| `/privacy`, `/terms` | Yes | Legal pages |

Protected routes wrap content in `AuthGuard` → shows skeleton while `/auth/me` loads.

## UI stack

- **React 19** + **TypeScript**
- **Vite 6**
- **Tailwind CSS 4**
- **Radix UI** (shadcn-style atoms in `src/atoms/ui/`)
- **React Flow** (`@xyflow/react`) — integration graph
- **Lucide** icons

## Chat UI components

```
pages/dashboard/components/chat/
├── TextChat.tsx              # Main chat page
├── ChatMessages.tsx          # User/assistant bubbles, typing indicator
├── ChatHistorySkeleton.tsx   # Loading skeleton
├── MessageBlockRenderer.tsx  # Rich blocks (email, Slack, Jira)
├── parseMessage.ts           # Parse agent markdown into blocks
└── blocks/                   # EmailCard, SlackDraftCard, JiraIssueCard, etc.
```

## Local development tips

1. Start **backend** before frontend.
2. After backend env changes, restart uvicorn.
3. If API calls fail with CORS, verify `FRONTEND_URL` in backend `.env` matches `http://localhost:5173`.
4. Slack events need a public backend URL — use ngrok and update Slack app Event URL.
5. Hard refresh (`Cmd+Shift+R`) if Vite env vars change.

## Build & deploy

```bash
npm run build
```

Output: `dist/`. Serve as static files; configure hosting to SPA-fallback to `index.html` for client routes.

Set production `VITE_API_URL` to your deployed API origin at **build time** (Vite embeds env vars in the bundle).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank dashboard after login | Check network tab for `/auth/me`; log in again if tokens expired |
| `Invalid token` during connect | Fixed by connect-url flow — pull latest; ensure backend is running |
| Chat empty after Slack disconnect | Expected — disconnect clears Mongo history for that user |
| Tab resets on reload | Should persist via `?tab=chat`; check `lc-dashboard-tab` in localStorage |
| Graph positions lost | Stored in `letsconnect-graph-positions` in localStorage |

## Related docs

- [Backend README](../LC-Backend/README.md) — API, OAuth, MongoDB, agent
- [Root README](../README.md) — monorepo overview
