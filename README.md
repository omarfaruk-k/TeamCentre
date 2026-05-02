# Team Hub

> A collaborative workspace for teams to manage goals, track action items, and stay aligned — in real time.

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js)
![Express](https://img.shields.io/badge/Express.js-grey?style=flat-square&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?style=flat-square&logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)
![Railway](https://img.shields.io/badge/Deployed_on_Railway-0B0D0E?style=flat-square&logo=railway)

---

## Live Demo

| Service | URL |
|---------|-----|
| **Web App** | https://your-web.up.railway.app |
| **API** | https://your-api.up.railway.app |

**Demo account** — ready to explore, no sign-up needed:
```
Email:    b@b.com, c@c.com, d@d.com
Password for all: pass
```

---

## What It Does

Team Hub gives teams a single shared space to:

- **Set goals** with milestones, owners, due dates, and a live progress feed
- **Post announcements** with rich-text formatting, emoji reactions, and threaded comments
- **Track action items** on a drag-and-drop Kanban board or a sortable list view
- **Stay in sync** — Socket.io pushes every update live, and the sidebar shows who's online right now
- **Analyse progress** — a dashboard with stats cards and a goal completion chart, plus a one-click CSV export

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | [Turborepo](https://turbo.build/) |
| Frontend | [Next.js 14](https://nextjs.org/) — App Router, JavaScript |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| State management | [Zustand](https://zustand-demo.pmnd.rs/) |
| Backend | [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) |
| Database | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| Auth | JWT — access (15 min) + refresh (7 d) tokens in `httpOnly` cookies |
| Real-time | [Socket.io](https://socket.io/) |
| File storage | [Cloudinary](https://cloudinary.com/) — avatar uploads |
| Deployment | [Railway](https://railway.app/) — frontend & backend as separate services |

---

## Monorepo Structure

```
team-hub/
├── apps/
│   ├── web/                        # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (auth)/             # /login  /register
│   │   │   └── (dashboard)/        # all protected pages
│   │   ├── components/
│   │   │   ├── ui/                 # Button, Card, Modal, Badge, Toast …
│   │   │   ├── layout/             # Sidebar, TopNav, WorkspaceSwitcher
│   │   │   ├── goals/              # GoalCard, GoalForm, MilestoneList, ActivityFeed
│   │   │   ├── action-items/       # KanbanBoard, ActionItemCard, ActionItemForm
│   │   │   ├── announcements/      # AnnouncementCard, AnnouncementForm, ReactionBar
│   │   │   └── dashboard/          # StatsCard, GoalCompletionChart
│   │   ├── stores/                 # Zustand — authStore, workspaceStore, goalStore …
│   │   ├── hooks/                  # useSocket, useWorkspaceAccent, useOnlineMembers
│   │   └── lib/                    # axios instance, socket.io client, utilities
│   │
│   └── api/                        # Express REST API
│       ├── src/
│       │   ├── routes/             # auth, workspaces, goals, announcements, actionItems …
│       │   ├── middleware/         # authenticate.js, requireRole.js, errorHandler.js
│       │   ├── controllers/        # one file per route group
│       │   ├── services/           # business logic called by controllers
│       │   ├── lib/                # prisma.js, jwt.js, cloudinary.js
│       │   └── sockets/            # workspaceSocket.js — all Socket.io handlers
│       └── prisma/
│           ├── schema.prisma
│           └── seed.js
│
├── packages/
│   └── shared/                     # shared enums and constants
│
├── turbo.json
├── package.json
└── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL running locally (or a connection string to a hosted instance)
- A free [Cloudinary](https://cloudinary.com/) account

### 1. Clone and install

```bash
git clone https://github.com/your-username/team-hub.git
cd team-hub
npm install          # installs all workspaces via Turborepo
```

### 2. Set up environment variables

Copy the example files and fill in your values:

```bash
cp apps/api/.env.example      apps/api/.env
cp apps/web/.env.example      apps/web/.env.local
```

See the [Environment Variables](#environment-variables) section below for every key and what it does.

### 3. Set up the database

```bash
cd apps/api
npx prisma migrate dev --name init     # creates tables
npx prisma db seed                     # seeds demo account + sample data
```

### 4. Run the dev servers

From the repo root:

```bash
npm run dev      # starts both apps concurrently via Turborepo
```

| App | URL |
|-----|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |

---

## Environment Variables

### Backend — `apps/api/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ✅ | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES` | ✅ | Access token lifetime (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES` | ✅ | Refresh token lifetime (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | ✅ | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | ✅ | From your Cloudinary dashboard |
| `CLIENT_URL` | ✅ | Frontend origin for CORS (e.g. `http://localhost:3000`) |
| `PORT` | — | Defaults to `4000` |

### Frontend — `apps/web/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Base URL of the Express API |
| `NEXT_PUBLIC_SOCKET_URL` | ✅ | Socket.io server URL (usually the same as the API URL) |

---

## Advanced Features

Two advanced features were implemented for this submission:

### ⚡ 2. Optimistic UI

Every user action feels instant — the UI updates immediately before the server responds.

- **Kanban drag-and-drop** — cards move to the new column at once; if the API call fails, the card snaps back
- **Emoji reactions** — toggling a reaction is reflected immediately in the count
- **Milestone toggles** — checked/unchecked state updates without a loading delay
- **New action items** — appear in the list right away with a subtle "saving…" indicator

The pattern is consistent across all Zustand stores: save a snapshot → apply optimistic update → on error, restore snapshot and show a toast.

```js
// Example from actionItemStore.js
moveItem: (id, newStatus) => {
  const snapshot = get().items
  set(state => ({
    items: state.items.map(i => i.id === id ? { ...i, status: newStatus } : i)
  }))
  api.patch(`/action-items/${id}`, { status: newStatus }).catch(() => {
    set({ items: snapshot })
    toast.error('Failed to update. Please try again.')
  })
}
```

### 🔐 4. Advanced RBAC

A permission matrix enforced on both the backend (middleware) and frontend (hidden UI elements — not just disabled buttons).

| Action | Admin | Member |
|--------|:-----:|:------:|
| Edit workspace settings | ✅ | ❌ |
| Invite / remove members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |
| Post / pin / delete announcements | ✅ | ❌ |
| Delete goals or action items | ✅ | ❌ |
| Export CSV | ✅ | ❌ |
| Create / edit goals & milestones | ✅ | ✅ |
| Create / update action items | ✅ | ✅ |
| React & comment on announcements | ✅ | ✅ |
| View analytics dashboard | ✅ | ✅ |

Backend uses a `requireRole` middleware that checks the `WorkspaceMember` table on every protected route. Frontend reads the current member's role from `workspaceStore` and conditionally renders admin-only controls.

---

## Key Design Decisions

### Workspace accent colour

Each workspace has a custom accent colour (violet, blue, teal, rose, amber, or slate). Switching workspaces re-themes the entire interface — the sidebar tint, active nav highlight, button colours, focus rings, and top nav border all update via CSS custom properties set by the `useWorkspaceAccent` hook.

```js
document.documentElement.style.setProperty('--accent', accentColor)
document.documentElement.style.setProperty('--accent-subtle', accentColor + '10')
document.documentElement.style.setProperty('--accent-muted',  accentColor + '20')
```

### Auth flow

Access tokens (15 min) and refresh tokens (7 days) are stored in `httpOnly` cookies — never in `localStorage`. The axios instance has an interceptor that transparently calls `/auth/refresh` on any 401 and retries the original request, so users are never interrupted mid-session.

### Real-time events

Every write operation in the API emits a Socket.io event to the relevant workspace room. The frontend `useSocket` hook subscribes to these events and updates Zustand stores directly, so all open tabs and all connected users see changes without refreshing.

| Event | Trigger |
|-------|---------|
| `announcement:created` | New announcement posted |
| `reaction:updated` | Emoji added or removed |
| `comment:created` | New comment on an announcement |
| `goal:updated` | Goal status, milestones, or updates changed |
| `actionItem:updated` | Action item moved or edited |
| `member:online / offline` | Member connects or disconnects |
| `notification:new` | @mention triggered (user-specific room) |

---

## API Endpoints

All routes are prefixed with `/api`. The `:id` segments are path parameters 
sent in the HTTP request — these are **not** frontend page URLs.
Frontend pages are flat: `/goals`, `/announcements`, `/action-items`, etc.
The active workspace ID is passed to the API via the request path, resolved 
from Zustand's `workspaceStore` on the client.

| Resource | Base path |
|----------|-----------|
| Auth | `/api/auth` |
| Workspaces | `/api/workspaces` |
| Goals | `/api/workspaces/:id/goals` |
| Milestones | `/api/workspaces/:id/goals/:gid/milestones` |
| Announcements | `/api/workspaces/:id/announcements` |
| Action Items | `/api/workspaces/:id/action-items` |
| Members | `/api/workspaces/:id/members` |
| Analytics | `/api/workspaces/:id/analytics` |

---

## Deployment (Railway)

The project deploys as two separate Railway services inside one Railway project, sharing a single PostgreSQL plugin.

1. Create a new Railway project and add a **PostgreSQL** plugin — `DATABASE_URL` is injected automatically.
2. Add a service for `apps/api` and set the root directory to `apps/api`.
3. Add a service for `apps/web` and set the root directory to `apps/web`.
4. Set all environment variables in each service's variable panel (see table above).
5. After the first deploy, run the seed script once via Railway's shell:
   ```bash
   npx prisma db seed
   ```

---

## Known Limitations

- **Search** — the global search bar in the top nav is UI-only in the current version; full-text search across goals and announcements is planned.
- **@Mention notifications** — in-app notification badges are fully wired; email delivery via Nodemailer is not yet configured.
- **Attachment uploads** — Cloudinary integration covers avatar uploads; file attachments on action items are not yet implemented.
- **Offline support** — there is no service worker or write queue; the app requires an active internet connection.

---

## License

MIT