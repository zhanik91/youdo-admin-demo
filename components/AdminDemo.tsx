"use client";
import React, { useMemo, useState, useEffect, createContext, useContext } from "react";

// I18n
const langs:any = {
  ru: {
    brand: "Admin Demo",
    nav: { dashboard: "Панель", catalog: "Каталог", kyc: "KYC", payments: "Платежи", settings: "Настройки", analytics: "Аналитика" },
    actions: { create: "Новая запись", export: "Экспорт CSV", import: "Импорт CSV", bulkDelete: "Удалить выбранные", save: "Сохранить", approve: "Одобрить", reject: "Отклонить", view: "Открыть", logout: "Выйти" },
    policy: {
      title: "Политики платформы",
      dailyLimit: "Лимит откликов в день",
      weeklyLimit: "Лимит откликов в неделю",
      freeBeforeKyc: "Бесплатных откликов до KYC",
      escrowThreshold: "Порог обязательного эскроу (₸)",
      riskyNeedKyc: "Рисковые категории требуют KYC сразу",
      saveOk: "Политики сохранены"
    },
    catalog: { title: "Категории и подкатегории", risky: "Рисковая", addCategory: "Добавить категорию", addSub: "Добавить подкатегорию" },
    kyc: { title: "Очередь верификации", level: "Уровень", doc: "Удостоверение", selfie: "Селфи", status: "Статус" },
    payments: { title: "Платежи (эмулятор эскроу)", create: "Создать холд", orderId: "Заказ", amount: "Сумма", customer: "Заказчик", performer: "Исполнитель", state: "Статус", hold: "Hold", capture: "Capture", refund: "Refund" },
    analytics: { title: "Тесты и метрики", run: "Запустить тесты" },
    common: { search: "Поиск…", light: "Светлая", dark: "Тёмная", itemsPerPage: "На странице", total: "Всего", page: "Стр.", of: "из" },
  },
  kk: {
    brand: "Админ Демо",
    nav: { dashboard: "Панель", catalog: "Каталог", kyc: "Тексеру", payments: "Төлемдер", settings: "Баптаулар", analytics: "Аналитика" },
    actions: { create: "Жаңа жазба", export: "CSV экспорт", import: "CSV импорт", bulkDelete: "Таңдалғанды жою", save: "Сақтау", approve: "Бекіту", reject: "Қайтару", view: "Ашу", logout: "Шығу" },
    policy: {
      title: "Платформа саясаты",
      dailyLimit: "Күніне жауап шектеуі",
      weeklyLimit: "Аптасына жауап шектеуі",
      freeBeforeKyc: "KYC дейін тегін жауап саны",
      escrowThreshold: "Эскроу міндетті шегі (₸)",
      riskyNeedKyc: "Қауіпті санаттарда KYC міндетті",
      saveOk: "Саясат сақталды"
    },
    catalog: { title: "Санаттар", risky: "Қауіпті", addCategory: "Санат қосу", addSub: "Ішкі санат қосу" },
    kyc: { title: "Верификация кезегі", level: "Деңгей", doc: "Құжат", selfie: "Селфи", status: "Күйі" },
    payments: { title: "Эскроу төлемдері", create: "Hold жасау", orderId: "Тапсырыс", amount: "Сома", customer: "Тапсырыс беруші", performer: "Орындаушы", state: "Күй", hold: "Hold", capture: "Capture", refund: "Refund" },
    analytics: { title: "Тесттер", run: "Тесттерді іске қосу" },
    common: { search: "Іздеу…", light: "Жарық", dark: "Қараңғы", itemsPerPage: "Бетте", total: "Барлығы", page: "Бет", of: "/" },
  }
};
const I18nCtx = createContext<any>({ lang: 'ru', setLang: (v:string) => {}, t: (k:string) => k });
function I18nProvider({ children }:{ children:React.ReactNode }){
  const [lang, setLang] = useState<string>(()=>{ try { return localStorage.getItem('lang') || 'ru'; } catch { return 'ru'; }});
  useEffect(()=>{ try { localStorage.setItem('lang', lang); } catch {} }, [lang]);
  const t = (key:string) => key.split('.').reduce((o:any,k:string)=> (o && o[k]!==undefined) ? o[k] : key, langs[lang]);
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}
function useI18n(){ return useContext(I18nCtx); }

const defaultPolicy = { dailyLimit: 5, weeklyLimit: 20, freeBeforeKyc: 3, escrowThreshold: 50000, riskyNeedKyc: true };
function usePolicy():[any, (v:any)=>void]{
  const [policy, setPolicy] = useState<any>(()=>{
    try { const saved = JSON.parse(localStorage.getItem('policy')||'null'); return saved || defaultPolicy; } catch { return defaultPolicy; }
  });
  useEffect(()=>{ try { localStorage.setItem('policy', JSON.stringify(policy)); } catch {} }, [policy]);
  return [policy, setPolicy];
}

// Business rules
export function canReply({ isKycPassed, usedToday, usedWeek, categoryIsRisky }:{ isKycPassed:boolean, usedToday:number, usedWeek:number, categoryIsRisky:boolean }, policy:any){
  if (policy.riskyNeedKyc && categoryIsRisky && !isKycPassed) return { ok: false, reason: 'needKyc' as const };
  if (!isKycPassed && usedWeek >= policy.freeBeforeKyc) return { ok: false, reason: 'needKycAfterFree' as const };
  if (usedToday >= policy.dailyLimit) return { ok: false, reason: 'dailyLimit' as const };
  if (usedWeek >= policy.weeklyLimit) return { ok: false, reason: 'weeklyLimit' as const };
  return { ok: true as const };
}
export function needEscrow({ amount }:{ amount:number }, policy:any){ return amount >= policy.escrowThreshold; }

const initialCatalog = [
  { name: 'Курьерские услуги', risky: true, subs: ['Пеший курьер', 'Курьер на авто', 'Купить и доставить', 'Срочная доставка', 'Доставка продуктов', 'Доставка из ресторанов', 'Курьер на день', 'Другая посылка'] },
  { name: 'Ремонт и строительство', risky: true, subs: ['Мастер на час','Ремонт под ключ','Сантехнические работы','Электромонтажные работы','Отделочные работы','Потолки','Полы','Плиточные работы','Сборка и ремонт мебели','Двери и замки','Окна, остекление, балконы','Фасадные работы','Отопление/водоснабжение/канализация','Изоляционные работы','Строительно-монтажные','Крупное строительство','Охранные системы','Вскрытие замков','Другое'] },
  { name: 'Грузоперевозки', risky: true, subs: ['Переезды','Пассажирские','Строительные грузы','Вывоз мусора','Эвакуаторы','Междугородные','Грузчики','Перевозка продуктов','Манипулятор','Другой груз'] },
  { name: 'Уборка и помощь по хозяйству', risky: false, subs: ['Поддерживающая уборка','Генеральная уборка','Мытьё окон','Вынос мусора','Швея','Приготовление еды','Глажка белья','Химчистка','Уход за животными','Сад/огород','Сиделки','Няни','Санитарные работы','Другое'] },
  { name: 'Виртуальный помощник', risky: false, subs: ['Работа с текстом','Переводчик','Поиск информации','Числовые данные','Презентации','Расшифровка аудио/видео','Размещение на площадках','Помощь SMM','Реклама и продвижение','Обзвон','Личный помощник','Другое'] },
  { name: 'Компьютерная помощь', risky: true, subs: ['Ремонт компьютеров','Установка ОС/ПО','Удаление вирусов','Интернет и Wi‑Fi','Замена комплектующих','Восстановление данных','Ремонт оргтехники','Консультации и обучение','Другое'] },
  { name: 'Мероприятия и промо', risky: false, subs: ['Помощь на мероприятиях','Раздача материалов','Тайный покупатель','Разнорабочий','Промоутер','Ведущий/аниматор','Промо‑модель','Мерчендайзер','Комплектовщик','Другое'] },
  { name: 'Дизайн', risky: false, subs: ['Логотипы','Фирстиль/визитки','Иллюстрации','Дизайн сайтов/приложений','Баннеры/соцсети','3D/анимация','Инфографика/иконки','Наружная реклама','Архитектура/интерьер','Дизайн одежды','Другое'] },
  { name: 'Разработка ПО', risky: false, subs: ['Сайт под ключ','Мобильные приложения','Программирование','Поддержка сайта','1C','Лендинги','Верстка','Скрипты и боты','Другое'] },
  { name: 'Фото/видео/аудио', risky: false, subs: ['Фотосъёмка','Видеосъёмка','Запись аудио','Обработка фото','Видео под ключ','Модели','Монтаж/цветокоррекция','Оцифровка','Другое'] },
  { name: 'Установка и ремонт техники', risky: true, subs: ['Холодильники','Стиральные/сушильные','Посудомоечные','Эл. плиты и панели','Газовые плиты','Духовые шкафы','Вытяжки','Климатическая техника','Водонагреватели/бойлеры','Швейные машины','Пылесосы','Утюги/уход за одеждой','Кофемашины','СВЧ','Мелкая техника','Уход за телом','Строительная/садовая техника','Другое'] },
  { name: 'Юр. и бух. помощь', risky: false, subs: ['Бухгалтерские услуги','Налоги','Нотариальные','Оформление документов','Адвокат','Регистрация/ликвидация','Жалобы/иски','Договоры','Юр. консультация','Юр. сопровождение','Тендеры','Кадры/делопроизводство','Другое'] },
  { name: 'Репетиторы и обучение', risky: false, subs: ['Русский язык','Английский','Французский','Немецкий','Испанский','Другие языки','Математика и физика','Биология и химия','История и обществознание','География и экономика','Информатика/программирование','Школа и младшие классы','Музыка/танцы/арт','Помощь студентам','Логопеды','Спорт','Автоинструкторы','Другое'] },
  { name: 'Ремонт транспорта', risky: true, subs: ['ТО автомобиля','Диагностика/ремонт ДВС/КПП/ходовой','Кондиционирование','Кузовной ремонт','Автоэлектрика','Стёкла/тонировка','Шиномонтаж','Мойка/химчистка','Тюнинг','Помощь на дороге','Мотосервис','Другое'] },
];

const seedOrders = [
  { id: 1012, customer: "Arai LTD",        status: "Paid",     total: 125000, date: "2025-09-20" },
  { id: 1013, customer: "Tekeli-Komek",     status: "Pending",  total:  78000, date: "2025-09-19" },
  { id: 1014, customer: "Jetisu Market",    status: "Refunded", total:  23000, date: "2025-09-18" },
  { id: 1015, customer: "FireSafe KZ",      status: "Paid",     total: 315000, date: "2025-09-17" },
  { id: 1016, customer: "Altair & Aldiyar", status: "Paid",     total:  99000, date: "2025-09-15" },
];
const seedKyc = [
  { id: 'U-1001', name: 'Ержан К.', level: 'L1', doc: true,  selfie: true,  status: 'pending' },
  { id: 'U-1002', name: 'Алия С.',  level: 'L1', doc: true,  selfie: false, status: 'pending' },
  { id: 'U-1003', name: 'Нурлан Ш.',level: 'L1', doc: false, selfie: false, status: 'pending' },
];

const seedPayments = [
  { id: 'P-2001', orderId: 1013, amount: 78000, customer: 'Tekeli-Komek', performer: 'Ержан К.', state: 'hold' },
  { id: 'P-2002', orderId: 1015, amount: 315000, customer: 'FireSafe KZ', performer: 'Алия С.', state: 'captured' },
];
const chartData = [35, 42, 31, 54, 60, 48, 72, 68, 75, 82, 77, 91];
const INPUT_CLASS = "w-full rounded-xl bg-slate-100/70 dark:bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-indigo-400";

export default function AdminDemo(){
  return (
    <I18nProvider>
      <RootApp />
    </I18nProvider>
  );
}
function RootApp(){
  const [authed, setAuthed] = useState<boolean>(()=>{ try { return localStorage.getItem('demo_admin_authed')==='1'; } catch { return false; } });
  if (!authed) return <LoginScreen onLogin={()=>{ try{localStorage.setItem('demo_admin_authed','1');}catch{}; setAuthed(true); }} />;
  return <Dashboard onLogout={()=>{ try{localStorage.removeItem('demo_admin_authed');}catch{}; setAuthed(false); }} />;
}
function LoginScreen({ onLogin }:{ onLogin:()=>void }){
  const { t, lang, setLang } = useI18n();
  const [email, setEmail] = useState<string>("");
  const [pass, setPass]   = useState<string>("");
  const [err, setErr]     = useState<string>("");
  function submit(e:React.FormEvent){ e.preventDefault(); if(!email||!pass){ setErr('Введите e‑mail и пароль'); return; } onLogin(); }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-black flex items-center justify-center p-6 text-slate-100">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t('brand')}</h1>
          <LangSwitcher lang={lang} setLang={setLang} />
        </div>
        {err && <div className="text-sm text-rose-400">{err}</div>}
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm"><span className="text-slate-300">E‑mail</span><input className={INPUT_CLASS} type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="admin@example.com" /></label>
          <label className="grid gap-1 text-sm"><span className="text-slate-300">Пароль</span><input className={INPUT_CLASS} type="password" value={pass} onChange={(e)=>setPass(e.target.value)} placeholder="••••••••" /></label>
        </div>
        <button className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500">Войти</button>
        <p className="text-xs text-slate-400 text-center">Демо‑режим: любые значения пройдут авторизацию</p>
      </form>
    </div>
  );
}
function Dashboard({ onLogout }:{ onLogout:()=>void }){
  const { t, lang, setLang } = useI18n();
  const [dark, setDark] = useState<boolean>(true);
  const [route, setRoute] = useState<string>('dashboard');

  const [policy, setPolicy] = usePolicy();
  const [catalog, setCatalog] = useState<any[]>(initialCatalog);
  const [kyc, setKyc] = useState<any[]>(seedKyc);
  const [payments, setPayments] = useState<any[]>(seedPayments);

  const [q, setQ] = useState<string>("");
  const [sortKey, setSortKey] = useState<"date"|"total"|"id">("date");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [orders, setOrders] = useState<any[]>(seedOrders);

  const filtered = useMemo(() => applyFilterSort(orders, q, sortKey, sortDir), [orders, q, sortKey, sortDir]);

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <header className="sticky top-0 z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="px-4 md:px-6 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
              <div className="font-semibold">{t('brand')}</div>
            </div>
            <nav className="hidden md:flex gap-2 ml-4">
              {['dashboard','catalog','kyc','payments','settings','analytics'].map(r => (
                <button key={r} onClick={()=>setRoute(r)} className={(route===r? 'bg-indigo-600 text-white' : 'bg-slate-100/70 dark:bg-white/10 hover:bg-slate-200/60 dark:hover:bg-white/20') + ' px-3 py-1.5 rounded-xl text-sm'}>
                  {t(`nav.${r}`)}
                </button>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <LangSwitcher lang={lang} setLang={setLang} />
              <button onClick={()=>setDark(!dark)} className="px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-white/10 hover:bg-slate-200/60 dark:hover:bg-white/20">{dark? t('common.light') : t('common.dark')}</button>
              <button onClick={onLogout} className="px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-white/10 hover:bg-slate-200/60 dark:hover:bg-white/20">{t('actions.logout')}</button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-6">
          {route === 'dashboard' && (
            <>
              <KPIRow orders={orders} />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2"><Card title="Доход по месяцам (демо)"><LineChart data={chartData} height={240} /></Card></div>
                <div><Card title="Быстрые действия"><QuickActions /></Card></div>
              </div>
              <Card title="Последние заказы">
                <OrdersTable rows={filtered} sortKey={sortKey} sortDir={sortDir} setSortKey={setSortKey} setSortDir={setSortDir} onEdit={()=>{}} onRemove={()=>{}} />
              </Card>
              <Card title="Политики (демо‑индикаторы)">
                <PolicyIndicators policy={policy} />
              </Card>
            </>
          )}

          {route === 'catalog' && (
            <Card title={t('catalog.title')}>
              <CatalogManager catalog={catalog} setCatalog={setCatalog} />
            </Card>
          )}

          {route === 'kyc' && (
            <Card title={t('kyc.title')}>
              <KYCQueue list={kyc} setList={setKyc} />
            </Card>
          )}

          {route === 'payments' && (
            <Card title={t('payments.title')}>
              <Payments list={payments} setList={setPayments} policy={policy} />
            </Card>
          )}

          {route === 'settings' && (
            <Card title={t('policy.title')}>
              <PolicyEditor policy={policy} setPolicy={setPolicy} />
            </Card>
          )}

          {route === 'analytics' && (
            <Card title={t('analytics.title')}>
              <TestSuite policy={policy} catalog={catalog} />
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function LangSwitcher({ lang, setLang }:{ lang:string, setLang:(v:'ru'|'kk')=>void }){
  return (
    <div className="flex gap-1 bg-slate-100/70 dark:bg-white/10 rounded-xl p-1">
      {(['ru','kk'] as const).map(l => (
        <button key={l} onClick={()=>setLang(l)} className={(lang===l? 'bg-indigo-600 text-white':'') + ' px-2 py-1 rounded-lg text-sm'}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

function KPIRow({ orders }:{ orders:any[] }){
  const total = orders.reduce((s, r) => s + r.total, 0);
  const paid = orders.filter((r) => r.status === "Paid").length;
  const pending = orders.filter((r) => r.status === "Pending").length;
  const refunded = orders.filter((r) => r.status === "Refunded").length;
  const items = [
    { label: "Выручка", value: formatKZT(total), icon: ChartIcon },
    { label: "Оплачено", value: paid, icon: CheckIcon },
    { label: "В ожидании", value: pending, icon: HourIcon },
    { label: "Возвраты", value: refunded, icon: RefundIcon },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((i) => (
        <div key={i.label} className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white"><i.icon /></div>
            <div><div className="text-sm text-slate-500 dark:text-slate-400">{i.label}</div><div className="text-lg font-semibold">{i.value}</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}
function Card({ title, children }:{ title:string, children:React.ReactNode }){
  return <section className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-4 md:p-6 shadow-sm"><h2 className="font-semibold mb-4">{title}</h2>{children}</section>;
}
function QuickActions(){
  return (
    <div className="grid gap-3">
      <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">Создать задачу (demo)</button>
      <button className="px-4 py-2 rounded-xl bg-slate-100/70 dark:bg-white/10 hover:bg-slate-200/60 dark:hover:bg-white/20">Экспорт CSV</button>
      <button className="px-4 py-2 rounded-xl bg-slate-100/70 dark:bg-white/10 hover:bg-slate-200/60 dark:hover:bg-white/20">Импорт CSV</button>
    </div>
  );
}
function LineChart({ data, height = 220, padding = 24 }:{ data:number[], height?:number, padding?:number }){
  const width = 640; const max = Math.max(...data)||1; const min = Math.min(...data)||0; const xStep = (width - padding*2) / (data.length - 1); const yScale = (height - padding*2) / (max - min || 1);
  const points = data.map((v,i)=>[padding + i*xStep, height - padding - (v - min)*yScale]);
  const path = points.map((p,i)=>(i?'L':'M')+p[0]+","+p[1]).join(' ');
  return (
    <div className="overflow-x-auto"><svg width={width} height={height} className="block">
      <g stroke="currentColor" opacity="0.15">{Array.from({length:5},(_,i)=>(<line key={i} x1={padding} x2={width-padding} y1={padding+i*((height-2*padding)/4)} y2={padding+i*((height-2*padding)/4)} />))}</g>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" />
      {points.map((p,i)=>(<circle key={i} cx={p[0]} cy={p[1]} r="3" />))}
    </svg></div>
  );
}
function OrdersTable({ rows, sortKey, sortDir, setSortKey, setSortDir, onEdit, onRemove }:{
  rows:any[], sortKey:"date"|"total"|"id", sortDir:"asc"|"desc", setSortKey:(k:"date"|"total"|"id")=>void, setSortDir:(d:"asc"|"desc")=>void, onEdit:(r:any)=>void, onRemove:(id:number)=>void
}){
  function changeSort(key:"date"|"total"|"id"){ if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('desc'); } }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead><tr className="text-left text-slate-500 dark:text-slate-400">
          <th className="py-2 pr-4">#</th><th className="py-2 pr-4">Клиент</th><th className="py-2 pr-4">Статус</th>
          <th className="py-2 pr-4 cursor-pointer select-none" onClick={()=>changeSort('total')}>Сумма {sortKey==='total' && (sortDir==='asc'?'↑':'↓')}</th>
          <th className="py-2 pr-4 cursor-pointer select-none" onClick={()=>changeSort('date')}>Дата {sortKey==='date' && (sortDir==='asc'?'↑':'↓')}</th><th></th>
        </tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/70 dark:hover:bg-white/5">
              <td className="py-2 pr-4">{r.id}</td><td className="py-2 pr-4">{r.customer}</td>
              <td className="py-2 pr-4"><span className={'px-2 py-1 rounded-lg text-xs ' + (r.status==='Paid'?'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400': r.status==='Pending'?'bg-amber-500/15 text-amber-600 dark:text-amber-400':'bg-rose-500/15 text-rose-600 dark:text-rose-400')}>{r.status}</span></td>
              <td className="py-2 pr-4">{formatKZT(r.total)}</td><td className="py-2 pr-4">{r.date}</td>
              <td className="py-2 pr-4"><div className="flex gap-2"><button onClick={()=>onEdit(r)} className="px-2 py-1 rounded-lg bg-slate-100/70 dark:bg-white/10 hover:bg-slate-200/60 dark:hover:bg-white/20">Редакт.</button><button onClick={()=>onRemove(r.id)} className="px-2 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-500">Удалить</button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function CatalogManager({ catalog, setCatalog }:{ catalog:any[], setCatalog:(v:any)=>void }){
  const { t } = useI18n();
  const [newCat, setNewCat] = useState<string>("");
  const [newSub, setNewSub] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  function addCategory(){ if(!newCat.trim()) return; setCatalog((c:any[]) => [...c, { name: newCat.trim(), risky: false, subs: [] }]); setNewCat(''); setSelectedIndex(catalog.length); }
  function addSub(){ if(!newSub.trim()) return; setCatalog((c:any[]) => c.map((x:any,i:number)=> i===selectedIndex? {...x, subs: [...x.subs, newSub.trim()]} : x)); setNewSub(''); }
  function toggleRisk(i:number){ setCatalog((c:any[]) => c.map((x:any,ix:number)=> ix===i? {...x, risky: !x.risky } : x)); }

  const current = catalog[selectedIndex] || catalog[0];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center gap-2 mb-2"><input value={newCat} onChange={(e)=>setNewCat(e.target.value)} placeholder={t('catalog.addCategory')} className={INPUT_CLASS} /><button onClick={addCategory} className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">+</button></div>
        <ul className="grid gap-1">
          {catalog.map((c:any,i:number)=> (
            <li key={i} className={(i===selectedIndex?'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-700 ':'') + ' border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-3 flex items-center justify-between'}>
              <button onClick={()=>setSelectedIndex(i)} className="text-left">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{c.subs.length} подкатегорий</div>
              </button>
              <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={c.risky} onChange={()=>toggleRisk(i)} /><span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">{t('catalog.risky')}</span></label>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {current && (
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">{current.name}</div>
              {current.risky && <span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs">{t('catalog.risky')}</span>}
            </div>
            <div className="flex items-center gap-2"><input value={newSub} onChange={(e)=>setNewSub(e.target.value)} placeholder={t('catalog.addSub')} className={INPUT_CLASS} /><button onClick={addSub} className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">+</button></div>
            <ul className="grid gap-2">
              {current.subs.map((s:string, idx:number)=> (
                <li key={idx} className="border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-3 flex items-center justify-between">
                  <div>{s}</div>
                  <button onClick={()=> setCatalog((c:any[]) => c.map((x:any,i:number)=> i===selectedIndex? {...x, subs: x.subs.filter((_:any,j:number)=> j!==idx)} : x))} className="px-2 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-500">Удалить</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
function KYCQueue({ list, setList }:{ list:any[], setList:(v:any)=>void }){
  const { t } = useI18n();
  function mutate(id:string, next:'approved'|'rejected'){ setList((arr:any[]) => arr.map((x:any) => x.id===id? {...x, status: next} : x)); }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead><tr className="text-left text-slate-500 dark:text-slate-400"><th>ID</th><th>Имя</th><th>{t('kyc.level')}</th><th>{t('kyc.doc')}</th><th>{t('kyc.selfie')}</th><th>{t('kyc.status')}</th><th></th></tr></thead>
        <tbody>
          {list.map((u:any) => (
            <tr key={u.id} className="border-t border-slate-200/60 dark:border-slate-800/60">
              <td className="py-2 pr-4">{u.id}</td>
              <td className="py-2 pr-4">{u.name}</td>
              <td className="py-2 pr-4">{u.level}</td>
              <td className="py-2 pr-4">{u.doc? '✓' : '—'}</td>
              <td className="py-2 pr-4">{u.selfie? '✓' : '—'}</td>
              <td className="py-2 pr-4">{u.status}</td>
              <td className="py-2 pr-4"><div className="flex gap-2"><button onClick={()=>mutate(u.id,'approved')} className="px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500">Одобрить</button><button onClick={()=>mutate(u.id,'rejected')} className="px-2 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-500">Отклонить</button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Payments({ list, setList, policy }:{ list:any[], setList:(v:any)=>void, policy:any }){
  const { t } = useI18n();
  const [form, setForm] = useState<any>({ orderId: '', amount: '', customer: '', performer: '' });
  function createHold(){
    const amount = +form.amount || 0; if (!amount || !form.orderId) return;
    const id = 'P-' + Math.floor(Math.random()*9000 + 1000);
    setList((l:any[]) => [{ id, orderId: +form.orderId, amount, customer: form.customer||'—', performer: form.performer||'—', state: 'hold' }, ...l]);
    setForm({ orderId: '', amount: '', customer: '', performer: '' });
  }
  function setState(id:string, state:'hold'|'captured'|'refunded'){ setList((l:any[]) => l.map((p:any) => p.id===id? {...p, state} : p)); }
  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-5 gap-2 items-end">
        <label className="grid gap-1 text-sm"><span>{t('payments.orderId')}</span><input className={INPUT_CLASS} value={form.orderId} onChange={e=>setForm({...form, orderId: e.target.value})} /></label>
        <label className="grid gap-1 text-sm"><span>{t('payments.amount')}</span><input className={INPUT_CLASS} type="number" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} /></label>
        <label className="grid gap-1 text-sm"><span>{t('payments.customer')}</span><input className={INPUT_CLASS} value={form.customer} onChange={e=>setForm({...form, customer: e.target.value})} /></label>
        <label className="grid gap-1 text-sm"><span>{t('payments.performer')}</span><input className={INPUT_CLASS} value={form.performer} onChange={e=>setForm({...form, performer: e.target.value})} /></label>
        <button onClick={createHold} className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">{t('payments.create')}</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left text-slate-500 dark:text-slate-400"><th>ID</th><th>{t('payments.orderId')}</th><th>{t('payments.amount')}</th><th>{t('payments.customer')}</th><th>{t('payments.performer')}</th><th>{t('payments.state')}</th><th>Escrow?</th><th></th></tr></thead>
          <tbody>
            {list.map((p:any) => (
              <tr key={p.id} className="border-t border-slate-200/60 dark:border-slate-800/60">
                <td className="py-2 pr-4">{p.id}</td>
                <td className="py-2 pr-4">{p.orderId}</td>
                <td className="py-2 pr-4">{formatKZT(p.amount)}</td>
                <td className="py-2 pr-4">{p.customer}</td>
                <td className="py-2 pr-4">{p.performer}</td>
                <td className="py-2 pr-4">{p.state}</td>
                <td className="py-2 pr-4">{needEscrow({amount: p.amount}, policy) ? 'да' : 'нет'}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <button disabled={p.state!=='hold'} onClick={()=>setState(p.id,'captured')} className={(p.state!=='hold'?'opacity-40 ':'')+"px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"}>{t('payments.capture')}</button>
                    <button disabled={p.state==='refunded'} onClick={()=>setState(p.id,'refunded')} className={(p.state==='refunded'?'opacity-40 ':'')+"px-2 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-500"}>{t('payments.refund')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function PolicyEditor({ policy, setPolicy }:{ policy:any, setPolicy:(v:any)=>void }){
  const { t } = useI18n();
  const [local, setLocal] = useState<any>(policy);
  const [toast, setToast] = useState<string>('');
  function save(){ setPolicy(local); setToast(t('policy.saveOk')); setTimeout(()=>setToast(''), 1500); }
  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label={t('policy.dailyLimit')}><input className={INPUT_CLASS} type="number" value={local.dailyLimit} onChange={e=>setLocal({...local, dailyLimit:+(e.target as HTMLInputElement).value||0})} /></Field>
        <Field label={t('policy.weeklyLimit')}><input className={INPUT_CLASS} type="number" value={local.weeklyLimit} onChange={e=>setLocal({...local, weeklyLimit:+(e.target as HTMLInputElement).value||0})} /></Field>
        <Field label={t('policy.freeBeforeKyc')}><input className={INPUT_CLASS} type="number" value={local.freeBeforeKyc} onChange={e=>setLocal({...local, freeBeforeKyc:+(e.target as HTMLInputElement).value||0})} /></Field>
        <Field label={t('policy.escrowThreshold')}><input className={INPUT_CLASS} type="number" value={local.escrowThreshold} onChange={e=>setLocal({...local, escrowThreshold:+(e.target as HTMLInputElement).value||0})} /></Field>
        <label className="flex items-center gap-2"><input type="checkbox" checked={local.riskyNeedKyc} onChange={e=>setLocal({...local, riskyNeedKyc: (e.target as HTMLInputElement).checked})} /><span>{t('policy.riskyNeedKyc')}</span></label>
      </div>
      <div className="flex justify-end"><button onClick={save} className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">Сохранить</button></div>
      {toast && <div className="text-emerald-600 text-sm">{toast}</div>}
    </div>
  );
}
function PolicyIndicators({ policy }:{ policy:any }){
  const samples = [
    { title: 'Новый исполнитель без KYC (2/день, 2/нед)', ctx: { isKycPassed:false, usedToday:2, usedWeek:2, categoryIsRisky:false } },
    { title: 'Новый исполнитель без KYC (5/день, 6/нед)', ctx: { isKycPassed:false, usedToday:5, usedWeek:6, categoryIsRisky:false } },
    { title: 'Рисковая категория без KYC', ctx: { isKycPassed:false, usedToday:0, usedWeek:0, categoryIsRisky:true } },
    { title: 'KYC пройден, лимиты на границе', ctx: { isKycPassed:true, usedToday:policy.dailyLimit-1, usedWeek:policy.weeklyLimit-1, categoryIsRisky:true } },
  ];
  return (
    <ul className="grid md:grid-cols-2 gap-3">
      {samples.map((s,i)=>{ const r = canReply(s.ctx as any, policy); return (
        <li key={i} className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 p-3">
          <div className="font-medium mb-1">{s.title}</div>
          <div className={r.ok? 'text-emerald-600' : 'text-rose-600'}>{r.ok? 'Можно откликаться' : 'Нельзя: ' + (r as any).reason}</div>
        </li>
      );})}
    </ul>
  );
}
function TestSuite({ policy, catalog }:{ policy:any, catalog:any[] }){
  const { t } = useI18n();
  const [results, setResults] = useState<any[]>([]);
  function run(){
    const out:any[] = [];
    const r1 = canReply({ isKycPassed:false, usedToday:0, usedWeek:policy.freeBeforeKyc, categoryIsRisky:false }, policy);
    out.push({ name: 'FreeBeforeKYC threshold', pass: r1.ok===false && (r1 as any).reason==='needKycAfterFree' });
    const r2 = canReply({ isKycPassed:true, usedToday:policy.dailyLimit, usedWeek:0, categoryIsRisky:false }, policy);
    const r3 = canReply({ isKycPassed:true, usedToday:0, usedWeek:policy.weeklyLimit, categoryIsRisky:false }, policy);
    out.push({ name: 'Daily limit', pass: r2.ok===false && (r2 as any).reason==='dailyLimit' });
    out.push({ name: 'Weekly limit', pass: r3.ok===false && (r3 as any).reason==='weeklyLimit' });
    const r4 = canReply({ isKycPassed:false, usedToday:0, usedWeek:0, categoryIsRisky:true }, policy);
    out.push({ name: 'Risky requires KYC', pass: policy.riskyNeedKyc ? (r4.ok===false && (r4 as any).reason==='needKyc') : r4.ok===true });
    const e1 = needEscrow({ amount: policy.escrowThreshold - 1 }, policy) === false;
    const e2 = needEscrow({ amount: policy.escrowThreshold }, policy) === true;
    out.push({ name: 'Escrow threshold boundary', pass: e1 && e2 });
    const keys = ['Курьерские услуги','Ремонт и строительство','Грузоперевозки'];
    out.push({ name: 'Catalog seed contains key groups', pass: keys.every(k => catalog.find((c:any)=>c.name===k)) });
    setResults(out);
  }
  useEffect(run, []);
  return (
    <div className="space-y-3">
      <button onClick={run} className="px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-white/10 hover:bg-slate-200/60 dark:hover:bg-white/20">{t('analytics.run')}</button>
      <ul className="grid gap-2">
        {results.map((r,i)=>(<li key={i} className="flex items-center gap-3"><span className={(r.pass?'bg-emerald-600':'bg-rose-600')+' text-white text-xs px-2 py-1 rounded-lg'}>{r.pass?'PASS':'FAIL'}</span><span className="font-medium">{r.name}</span></li>))}
      </ul>
    </div>
  );
}

export function applyFilterSort(list:any[], q:string, sortKey:"date"|"total"|"id" = "date", sortDir:"asc"|"desc" = "desc") {
  const text = (q || "").trim().toLowerCase(); let x = [...list];
  if (text) x = x.filter((r) => String(r.id).includes(text) || r.customer.toLowerCase().includes(text) || r.status.toLowerCase().includes(text));
  const dir = sortDir === "asc" ? 1 : -1;
  x.sort((a:any, b:any) => { if (sortKey === "total") { if (a.total !== b.total) return (a.total - b.total) * dir; const d = new Date(a.date).getTime() - new Date(b.date).getTime(); if (d !== 0) return d * dir; return (a.id - b.id) * dir; }
    if (sortKey === "id") { if (a.id !== b.id) return (a.id - b.id) * dir; const d = new Date(a.date).getTime() - new Date(b.date).getTime(); if (d !== 0) return d * dir; return (a.total - b.total) * dir; }
    const d = new Date(a.date).getTime() - new Date(b.date).getTime(); if (d !== 0) return d * dir; if (a.id !== b.id) return (a.id - b.id) * dir; return (a.total - b.total) * dir; });
  return x;
}
function Field({ label, children }:{ label:string, children:React.ReactNode }){ return (<label className="grid gap-1 text-sm"><span className="text-slate-500 dark:text-slate-400">{label}</span>{children}</label>); }
function formatKZT(n:number){ try { return new Intl.NumberFormat('ru-RU', { style:'currency', currency:'KZT', maximumFractionDigits: 0 }).format(n); } catch { return n + ' ₸'; } }
function ChartIcon(){return <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><rect x="7" y="8" width="3" height="8"/><rect x="12" y="6" width="3" height="10"/><rect x="17" y="10" width="3" height="6"/></svg>}
function CheckIcon(){return <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>}
function HourIcon(){return <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 3"/></svg>}
function RefundIcon(){return <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9a4 4 0 1 0 0 8h8"/><path d="M7 7l-3 3 3 3"/></svg>}
