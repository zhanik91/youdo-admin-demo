# YouDo Admin Demo (Next.js 14 + Tailwind)

> Прототип админ-панели маркетплейса услуг (YouDo-подобная модель) с i18n, KYC-очередью и эмулятором эскроу.

## Быстрый старт локально
```bash
# 1) Установите Node 18+
# 2) Установите зависимости (npm или pnpm)
npm install
# 3) Запуск дев-сервера
npm run dev
# Приложение будет на http://localhost:3000
```

## Стек
- Next.js 14 (App Router), React 18
- TailwindCSS
- Без БД (демо-хранилище в localStorage)
- RU/KK i18n каркас

## Куда смотреть
- `components/AdminDemo.tsx` — основной код демо
- `app/page.tsx` — точка входа
- `app/layout.tsx`, `app/globals.css` — шрифт/стили

## Что дальше
- Перенос политик/каталогов/платежей в БД (PostgreSQL via Drizzle)
- Модуль Disputes и антифрод-сигналы
- Подключение PSP с hold/capture
