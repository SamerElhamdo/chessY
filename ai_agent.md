

# 🤖 AI Agent Specification — chessY

## 🏷️ Project Overview
**ChessY** is an Arabic online chess platform designed for Syrian and Arab players.  
It includes:
- Web version (React)
- Mobile version (Expo React Native)
- Backend (Django + DRF + Channels + Redis + PostgreSQL)

The system should provide a **real-time chess experience** with matchmaking, ELO rating, authentication, and Arabic RTL UI.

---

## 🧱 Tech Stack

### 🖥 Backend (API)
- **Framework:** Django 5 + Django REST Framework
- **Realtime:** Django Channels (WebSocket) + Redis Pub/Sub
- **Database:** PostgreSQL
- **Tasks:** Celery + Redis broker
- **Authentication:** JWT (using SimpleJWT or Djoser)
- **Matchmaking:** Celery worker for queued pairing logic
- **Chess Logic:** `python-chess` for move validation & FEN/PGN handling
- **Deployment:** Dockerized + Gunicorn + Nginx
- **Testing:** pytest + coverage

### 🌐 Web Frontend
- **Framework:** React + TypeScript + Vite
- **UI:** TailwindCSS + shadcn/ui + RTL support
- **State:** React Query + Zustand
- **Routing:** React Router
- **Language:** Arabic (default RTL) + English toggle
- **Components:** Chessboard, Move List, Timer, Chat, Matchmaking, Profile

### 📱 Mobile App
- **Framework:** Expo (latest SDK 52+) + React Native + TypeScript
- **Navigation:** expo-router
- **Networking:** React Query + Axios
- **Storage:** expo-secure-store (JWT) + AsyncStorage
- **UI:** Tailwind RN + RTL layout via I18nManager
- **Notifications:** expo-notifications (optional)
- **WebSocket:** native `WebSocket` or `expo-websocket`
- **Expo Dev Client** for local testing and **EAS Build** for production
- **Supported Platforms:** Android & iOS

---

## 🔐 Authentication & Users
- Register / Login with email or username
- JWT (access + refresh)
- User model includes:
  - username
  - email
  - rating (ELO, default 1200)
  - stats (wins, losses, draws)
  - avatar, bio
- `@/api/auth/` endpoints for register/login/logout/refresh/me

---

## ♟️ Game & Matchmaking System

### Models
- **User**
- **Game**
  - white_user, black_user
  - status: waiting / live / finished / aborted
  - FEN, PGN
  - time_control {base, increment}
  - moves_count
  - winner
  - started_at / ended_at
- **Move**
  - move_no, san, uci, fen_after, is_check, is_mate
- **MatchmakingTicket**
  - user, time_control, rating_range, created_at, expires_at
- **ChatMessage**
  - sender, game_id, text, timestamp

### Logic
- Matchmaking queue stored in Redis (sorted by waiting time and ELO proximity)
- Celery worker checks queue every 2 seconds and pairs players
- Server enforces move legality using `python-chess`
- Game state persisted in PostgreSQL, live broadcasted via Channels
- ELO rating recalculated at game end:

E = 1 / (1 + 10^((R_opp - R_player)/400))
R’ = R + K * (S - E)

---

## 🌍 WebSocket Protocols

### `/ws/lobby`
- Broadcasts: player count, queue updates, tournaments

### `/ws/matchmaking`
- Events:
- `{type:"matched", game_id, white, black}`
- `{type:"queue_update", count}`

### `/ws/game/{game_id}`
- Client → Server: `{type:"move", uci:"e2e4"}`
- Server → Client:
- `{type:"move_applied", fen, san, move_no}`
- `{type:"game_over", result:"1-0|0-1|1/2-1/2"}`
- `{type:"clock_update", white_ms, black_ms}`

---

## 🧮 ELO & Fair Play
- K-factor dynamic (32 → 16 based on games played)
- Anti-cheat MVP: AFK detection, move time anomalies
- Optional integration with Stockfish API for analysis later

---

## 🧠 UI/UX Guidelines

### General
- Arabic RTL layout (default)
- Dark & Light themes
- Primary colors:  
- Background: `#0F172A`  
- Accent: `#F59E0B` (gold)  
- Board dark: `#1E293B`  
- Board light: `#E2E8F0`
- Fonts: **Cairo**, **Tajawal**

### Web Pages
- `/` Lobby overview
- `/play` Choose time control
- `/game/:id` Board + Chat
- `/profile/:username` User stats
- `/login`, `/register`
- `/tournaments` List of events

### Mobile Screens
- Lobby
- Quick Play
- Game (real-time)
- Profile
- Settings
- Login / Register

---

## 🧩 Monorepo Structure

shamchess/
│
├── apps/
│   ├── backend/         # Django API + Channels
│   ├── web/             # React Frontend
│   └── mobile/          # Expo React Native
│
├── packages/
│   ├── ui/              # shared UI components (if needed)
│   └── lib/             # shared utils, types, hooks
│
├── infra/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── traefik/
│
├── ai_agent.md          # this file
├── .env.example
└── README.md

---

## 🧰 DevOps & Deployment
- Docker Compose: `backend`, `web`, `db`, `redis`, `worker`, `nginx`
- `.env.example`:
  ```env
  DJANGO_SECRET_KEY=...
  DATABASE_URL=postgres://postgres:postgres@db:5432/shamchess
  REDIS_URL=redis://redis:6379/0
  ALLOWED_HOSTS=*
  JWT_SECRET=...

	•	GitHub Actions:
	•	Lint + Tests + Build + Deploy
	•	Deployment targets: Render / Fly.io / DigitalOcean / VPS self-hosted

⸻

🧪 Testing
	•	Backend: pytest (ELO, matchmaking, illegal moves)
	•	Web: Cypress (match flow tests)
	•	Mobile: Jest + RTL
	•	WS Tests: simple async move simulation test

⸻

📚 Documentation
	•	Auto-generated Swagger via DRF Spectacular
	•	README with setup instructions:

docker compose up


	•	Mermaid diagrams for ERD + WS events
	•	Example PGN viewer and shareable links

⸻

🧩 Output Instructions (for Codex / Cursor)

When generating:
	•	Scaffold all three apps under /apps/
	•	Generate models, serializers, views, consumers, routes
	•	Create React components for chess UI and lobby
	•	Create Expo screens with working WebSocket
	•	Include Docker Compose, README, and .env.example
	•	Output should be fully runnable locally with docker compose up

⸻

🧠 Language and Comments
	•	جميع التعليقات داخل الكود بالإنجليزية التقنية، لكن الواجهة عربية افتراضيًا.
	•	لا تُنتج placeholder code — أضف فقط كود حقيقي قابل للتشغيل.
	•	أي جزء غير متاح من المكتبات استخدم بديله الأنسب المستقر.

⸻

🏁 Goal

يجب أن ينتج المشروع بعد التوليد ما يلي:
	•	يعمل API، الويب، والموبايل متكاملين سوية.
	•	يمكن تسجيل الدخول، البحث عن خصم، اللعب، وحساب التصنيف.
	•	واجهة عربية جميلة احترافية.
	•	بنية كود منظمة ومهيأة للتوسع والتطوير المستقبلي.

⸻

🧩 chessY — شطرنج الشام
بُني بأحدث التقنيات، وبفخر عربي 🇸🇾♟️

---

