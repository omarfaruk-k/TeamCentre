# TeamCentre

> A real-time collaborative workspace for teams to manage goals, track action items, and stay aligned.

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![Express](https://img.shields.io/badge/Express.js-grey?style=flat-square&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?style=flat-square&logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)
![Railway](https://img.shields.io/badge/Deployed_on_Railway-0B0D0E?style=flat-square&logo=railway)

---

## Live Demo

| Service | URL |
|---------|-----|
| **Web App** | https://teamcentre.up.railway.app |
| **API** | https://teamcentre-backedend.up.railway.app |

**Demo accounts — ready to explore, no sign-up needed:**
```
Email:    b@b.com / c@c.com / d@d.com
Password: pass
```

---

## What It Does

TeamCentre gives teams a single shared space to:

- **Set and track goals** with milestones, progress bars, owners, due dates, and a live activity feed
- **Manage action items** on a drag-and-drop Kanban board or sortable list view
- **Post announcements** with emoji reactions, threaded comments, and pinning
- **Stay in sync** — Socket.io pushes every update live across all open sessions
- **Get notified** — in-app and email notifications for mentions, assignments, and workspace events
- **Analyse progress** — dashboard with stats cards, area charts, donut charts, and CSV export

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | [Turborepo](https://turbo.build/) |
| Frontend | [Next.js 16](https://nextjs.org/) — App Router, JavaScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + CSS variables |
| State management | [Zustand](https://zustand-demo.pmnd.rs/) |
| Backend | [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) |
| Database | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| Auth | JWT — access (15 min) + refresh (7 d) tokens in `httpOnly` cookies |
| Real-time | [Socket.io](https://socket.io/) |
| File storage | [Cloudinary](https://cloudinary.com/) — avatar uploads |
| Email | [Nodemailer](https://nodemailer.com/) — SMTP via Gmail |
| Deployment | [Railway](https://railway.app/) — frontend & backend as separate services |

---

## Monorepo Structure

```
team-hub/
├── apps/
│   ├── web/                        # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/             # login, register, OTP, forgot/reset password
│   │   │   └── (dashboard)/        # all protected pages
│   │   ├── components/
│   │   │   └── layout/             # Sidebar, TopNav, WorkspaceSwitcher, UserMenu
│   │   ├── stores/                 # Zustand — auth, workspace, goal, actionItem,
│   │   │                           #           announcement, notification
│   │   ├── hooks/                  # useSocket, useWorkspaceAccent, useOnlineMembers,
│   │   │                           # useTheme
│   │   └── lib/                    # axios instance, socket.io client
│   │
│   └── api/                        # Express REST API
│       ├── src/
│       │   ├── routes/             # auth, workspaces, goals, announcements,
│       │   │                       # actionItems, notifications, analytics
│       │   ├── middleware/         # authenticate.js, requireRole.js
│       │   ├── lib/                # prisma.js, jwt.js, notify.js, mailer.js
│       │   └── sockets/            # workspaceSocket.js
│       └── prisma/
│           ├── schema.prisma
│           └── seed.js
│
├── turbo.json
├── package.json
└── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL running locally
- A free [Cloudinary](https://cloudinary.com/) account
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for email

### 1. Clone and install

```bash
git clone https://github.com/omarfaruk-k/TeamCentre
cd team-hub
npm install
```

### 2. Set up environment variables

```bash
cp apps/api/.env.example   apps/api/.env
cp apps/web/.env.example   apps/web/.env.local
```

### 3. Set up the database

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run the dev servers

```bash
npm run dev
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
| `JWT_ACCESS_EXPIRES` | ✅ | Access token lifetime e.g. `15m` |
| `JWT_REFRESH_EXPIRES` | ✅ | Refresh token lifetime e.g. `7d` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | ✅ | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | ✅ | From your Cloudinary dashboard |
| `CLIENT_URL` | ✅ | Frontend origin for CORS |
| `MAIL_USER` | ✅ | Gmail address for sending emails |
| `MAIL_PASS` | ✅ | Gmail app password |
| `PORT` | — | Defaults to `4000` |

### Frontend — `apps/web/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Base URL of the Express API |
| `NEXT_PUBLIC_SOCKET_URL` | ✅ | Socket.io server URL |

---

## Features

### 🔐 Authentication
- Email + password registration and login
- Email verification via 6-digit OTP (10 min expiry, 5 attempt limit, 60s resend cooldown)
- Forgot password → OTP → reset password flow
- JWT access (15 min) + refresh (7 day) tokens in `httpOnly` cookies
- Transparent token refresh via axios interceptor — users are never interrupted mid-session
- Password strength indicator on register
- Show/hide password toggle

### 🏢 Workspaces
- Multi-workspace support — users can belong to multiple workspaces
- Role-based access control — Admin and Member roles
- Custom accent colour per workspace — themes the entire interface
- Invite members by email, change roles, remove members
- Workspace persistence across page reloads via localStorage

### 🎯 Goals
- Create goals with title, description, status, due date, and owner
- Four statuses — On Track, At Risk, Completed, Cancelled
- Milestones with checkbox completion — automatically recalculates goal progress
- Progress bar updated in real-time via Socket.io
- Activity feed — post progress updates with @mention support
- Linked action items shown in goal detail sidebar
- Admin can edit and delete goals

### 📋 Action Items
- Drag-and-drop Kanban board — To Do, In Progress, Done
- List view alternative with sortable columns
- Priority levels — High, Medium, Low
- Assignee, due date, and goal linking
- Real-time card updates across all sessions via Socket.io

### 📢 Announcements
- Admin-only posting with title and content
- Pin important announcements to the top
- Emoji reactions — 👍 ❤️ 🎉 🔥 👀
- Threaded comments with @mention support
- Side-by-side layout — announcement content left, comments right
- Mobile: comments toggle on/off below the announcement

### 🔔 Notifications
- In-app notification bell with unread count badge
- Real-time delivery via Socket.io user rooms
- Email notifications via Nodemailer for:
  - Workspace invitations
  - @mentions in comments and goal updates
  - Goal ownership assignment
  - Goal status changes
  - Action item assignments
- Mark all as read, click to navigate to relevant page

### 📊 Dashboard & Analytics
- Stats cards — total goals, completed this week, overdue goals, open action items
- Goal completion area chart — 8-week trend
- Goal status donut chart
- Action item status donut chart
- Overdue items panel
- Recent activity feed
- Active goals with inline progress bars
- Recent announcements preview
- CSV export (admin only)

### 👥 Members
- Member list with online presence indicators
- Invite by email, change role, remove member
- Online now panel showing currently active members
- Real-time online/offline status via Socket.io

### 🎨 UI & Experience
- Dark/light theme toggle with system preference detection on first load
- Live theme sync — follows OS preference changes unless manually overridden
- Workspace accent colour applied globally via CSS custom properties
- SVG logo with automatic dark/light variant switching
- Dotted background with accent glow orbs on auth pages
- Full mobile responsiveness — sidebar drawer, horizontal Kanban scroll, stacked layouts
- Lucide icons throughout

---

## Key Design Decisions

### CSS variable theming
All colours are CSS custom properties. Switching workspaces or toggling dark/light mode updates variables on `<html>` — every component reacts instantly with no re-renders.

### Real-time architecture
One persistent Socket.io connection per user session. All write operations emit to the relevant workspace room. The `useSocket` hook subscribes once in `DashboardLayout` and updates Zustand stores directly.

| Event | Trigger |
|-------|---------|
| `announcement:created` | New announcement posted |
| `reaction:updated` | Emoji added or removed |
| `comment:created` | New comment |
| `goal:updated` | Milestone toggled, progress recalculated |
| `goal:update:added` | New activity posted |
| `actionItem:updated` | Item moved or edited |
| `member:online/offline` | Member connects or disconnects |
| `notification:new` | User-specific notification (own socket room) |

### Optimistic UI
Every user action feels instant. The pattern across all Zustand stores: save snapshot → apply optimistic update → on error, restore snapshot.

### RBAC
Permission matrix enforced on both backend (`requireRole` middleware checking `WorkspaceMember` table) and frontend (admin-only UI elements hidden, not just disabled).

| Action | Admin | Member |
|--------|:-----:|:------:|
| Invite / remove members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |
| Post / pin / delete announcements | ✅ | ❌ |
| Delete goals or action items | ✅ | ❌ |
| Export CSV | ✅ | ❌ |
| Edit goals and milestones | ✅ | ✅ |
| Create / update action items | ✅ | ✅ |
| React and comment | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

---

## API Endpoints

All routes prefixed with `/api`.

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
| Notifications | `/api/notifications` |

---

## Deployment (Railway)

1. Create a Railway project and add a **PostgreSQL** plugin
2. Add a service for `apps/api` — set root directory to `apps/api`
3. Add a service for `apps/web` — set root directory to `apps/web`
4. Set all environment variables in each service's variable panel
5. After first deploy, run the seed script via Railway shell:
```bash
npx prisma db seed
```

---

## License

MIT