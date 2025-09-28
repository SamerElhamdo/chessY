# ✅ خطة مشروع ShamChess

## 🧱 Backend (Django)
- [x] Initialize Django project structure under `apps/backend`
- [x] Configure Django settings (PostgreSQL, Redis, Channels, DRF, SimpleJWT)
- [x] Implement custom `User` model with rating and profile fields
- [x] Create models for `Game`, `Move`, `MatchmakingTicket`, and `ChatMessage`
- [x] Integrate `python-chess` utilities for move validation and FEN/PGN handling
- [x] Implement authentication endpoints (register, login, refresh, me)
- [x] Implement REST endpoints for lobby, games, matchmaking queue
- [x] Implement Channels routing and consumers for lobby, matchmaking, and games
- [x] Configure Celery app with tasks for matchmaking pairing and ELO updates
- [x] Seed initial data fixtures and admin setup

## 🌐 Frontend Web (React)
- [ ] Scaffold Vite + React + TypeScript project under `apps/web`
- [ ] Configure TailwindCSS, shadcn/ui, and RTL support with Arabic localization
- [ ] Implement global layout with theme toggle and Arabic typography
- [ ] Build lobby page with live updates and matchmaking controls
- [ ] Build game page with chessboard, move list, chat, and timers
- [ ] Build authentication pages (login, register) with API integration
- [ ] Build profile and tournaments pages with data fetching via React Query
- [ ] Implement Zustand stores and WebSocket hooks for real-time updates

## 📱 Mobile (Expo)
- [ ] Initialize Expo SDK 52+ project under `apps/mobile`
- [ ] Configure expo-router, TypeScript, and Tailwind RN with RTL support
- [ ] Implement authentication flow with SecureStore token handling
- [ ] Build lobby and quick play screens with WebSocket integration
- [ ] Build game screen with chessboard, move list, and chat
- [ ] Build profile and settings screens with Arabic UI
- [ ] Integrate push notification scaffolding via `expo-notifications`

## 🔌 WebSocket & Matchmaking
- [ ] Define shared protocol/types package under `packages/lib`
- [ ] Implement matchmaking queue using Redis sorted sets
- [ ] Implement Celery worker logic for pairing players
- [ ] Implement game state broadcasting and clock updates via Channels
- [ ] Write integration tests for WebSocket flows

## 🧩 UI/UX & Arabic RTL
- [ ] Add shared Arabic typography and theme tokens under `packages/ui`
- [ ] Ensure RTL support for web and mobile layouts
- [ ] Add chessboard theming aligned with ShamChess palette
- [ ] Provide language toggle (Arabic/English) for web and mobile

## 🧰 DevOps & Docker
- [ ] Create Dockerfiles for backend, web, mobile, worker, and nginx
- [ ] Create docker-compose setup with PostgreSQL, Redis, Celery, and Traefik/Nginx
- [ ] Add GitHub Actions workflow for linting, tests, and builds
- [ ] Provide environment configuration via `.env.example`
- [ ] Add production-ready nginx configuration under `infra/`

## 🧪 Testing & Docs
- [ ] Configure pytest with coverage for backend
- [ ] Add frontend testing setup (Vitest + React Testing Library) and Cypress scaffolding
- [ ] Add mobile testing setup (Jest + RTL)
- [ ] Document setup and usage in `README.md`
- [ ] Generate API schema and Swagger docs using DRF Spectacular
- [ ] Add Mermaid diagrams for ERD and WebSocket flows
