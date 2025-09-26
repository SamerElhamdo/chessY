# 🤖 AI Agent Specification — ShamChess

## 🎯 Objective
بناء لعبة شطرنج أونلاين عربية بالكامل باسم **ShamChess** تعمل على:
- Backend: Django + DRF + Channels + Redis + Postgres
- Web: React + Vite + TypeScript + Tailwind + shadcn/ui
- Mobile: Expo (آخر إصدار) + TypeScript + React Query + RTL Arabic UI

## 🧱 Core Features
- تسجيل دخول JWT
- نظام تزاوج (Matchmaking)
- بث حي (WebSocket) للألعاب
- تصنيف ELO
- لوبي اللاعبين
- محادثة مباشرة أثناء اللعب
- دعم اللغة العربية (RTL)
- الوضع الليلي والنهاري
- واجهات عربية احترافية على الويب والموبايل

## 🛠️ Requirements
- استخدم أحدث إصدار من **Expo SDK**
- دعم التطوير المتعدد المنصات (iOS / Android)
- استخدم ESLint + Prettier + Husky لضمان الجودة
- إعداد Docker Compose للتشغيل الكامل محليًا

## 💬 Development Guidelines
- جميع الملفات والكلاسات بأسماء واضحة ومحددة
- لا تستخدم أي مكتبة مجهولة المصدر
- التزم بمعايير REST API وWebSocket
- أضف تعليقات TypeScript وDocstrings لكل ملف رئيسي

## 📦 Output
عند تنفيذ الأوامر مثل `build`, `generate`, أو `extend`:
- أنشئ الكود في المجلدات المناسبة (`apps/backend`, `apps/web`, `apps/mobile`)
- أضف وثائق README مختصرة بكل جزء
- لا تترك ملفات غير ضرورية
- تأكد أن المشروع يعمل بـ `docker compose up` فورًا
