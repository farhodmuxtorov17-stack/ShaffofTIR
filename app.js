// ShaffofTIR v4 — Clean Vue 3 SFC-style, developer-ready
// Stack: Vue 3.4 + VueRouter 4 (self-contained, no CDN beyond these two)
'use strict';
const { createApp, ref, reactive, computed, watch, onMounted, onUnmounted, provide, inject, defineComponent, nextTick } = Vue;
const { createRouter, createWebHashHistory, useRouter, useRoute } = VueRouter;

// ────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────
const STORE_KEY = Symbol('store');
const WEAPONS = ['AK-74','AK-74M','AK-74U','SVD Dragunov','Makarov PM','PKM'];
const REGIONS = {
  'Toshkent shahri':      ['Mirobod','Yunusobod','Chilonzor','Sergeli'],
  'Toshkent viloyati':    ['Yuqorichirchiq','Qibray'],
  'Samarqand viloyati':   ['Samarqand','Payariq','Urgut'],
  "Farg'ona viloyati":    ["Farg'ona","Marg'ilon"],
  'Andijon viloyati':     ['Andijon','Asaka'],
  'Buxoro viloyati':      ['Buxoro','Kogon'],
};
const BATTALIONS = ["1-motoo'chi batalon","2-motoo'chi batalon","3-motoo'chi batalon","Maxsus batalon","Shtab"];

// ────────────────────────────────────────────────────────────
// ICONS (inline SVG strings)
// ────────────────────────────────────────────────────────────
const I = {
  target:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  dashboard:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
  sessions:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  tir:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`,
  users:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  weapon:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 16h16v-3H4v3zm8-6V4H8l-4 6h16l-2-4h-6z"/></svg>`,
  book:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  report:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>`,
  camera:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  compare:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="8 3 4 7 8 11"/><line x1="4" y1="7" x2="20" y2="7"/><polyline points="16 21 20 17 16 13"/><line x1="20" y1="17" x2="4" y2="17"/></svg>`,
  settings:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  help:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  bell:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  sun:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  logout:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  search:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  plus:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  x:          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  check:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  eye:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  play:       `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  download:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  filter:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  activity:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  grid:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  maximize:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
  user:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  shield:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  globe:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  zap:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  trending:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  map:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  instructor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>`,
};
function icon(name, cls='') {
  return `<span class="${cls}" style="display:inline-flex;align-items:center;width:1em;height:1em">${I[name]||''}</span>`;
}

// ────────────────────────────────────────────────────────────
// STORE
// ────────────────────────────────────────────────────────────
const store = reactive({
  user: null,
  token: null,
  theme: 'light',
  lang: 'ru',

  employees: [
    {id:'e01',name:'Алиев Бахтиёр У.',rank:'Капитан',pos:'Командир взвода',region:'Toshkent viloyati',district:'Yuqorichirchiq',battalion:"1-motoo'chi batalon",phone:'+998901112233',status:'ACTIVE',qual:'EXPERT',sessions:24,avg:78,faceId:true},
    {id:'e02',name:'Рахимов Жасур Т.',rank:'Лейтенант',pos:'Командир отделения',region:'Toshkent viloyati',district:'Yuqorichirchiq',battalion:"1-motoo'chi batalon",phone:'+998902223344',status:'ACTIVE',qual:'INTERMEDIATE',sessions:18,avg:71,faceId:true},
    {id:'e03',name:'Юлдашев Дилшод А.',rank:'Сержант',pos:'Стрелок',region:'Toshkent viloyati',district:'Qibray',battalion:"2-motoo'chi batalon",phone:'+998903334455',status:'ACTIVE',qual:'EXPERT',sessions:32,avg:85,faceId:true},
    {id:'e04',name:'Хасанов Отабек Р.',rank:'Рядовой',pos:'Стрелок',region:'Toshkent viloyati',district:'Yuqorichirchiq',battalion:"1-motoo'chi batalon",phone:'+998904445566',status:'ACTIVE',qual:'BEGINNER',sessions:4,avg:48,faceId:false},
    {id:'e05',name:'Махмудов Сардор Б.',rank:'Ст. сержант',pos:'Зам. ком. взвода',region:'Toshkent viloyati',district:'Yuqorichirchiq',battalion:"1-motoo'chi batalon",phone:'+998905556677',status:'ACTIVE',qual:'EXPERT',sessions:45,avg:91,faceId:true},
    {id:'e06',name:'Каримов Азиз У.',rank:'Ефрейтор',pos:'Стрелок-снайпер',region:'Samarqand viloyati',district:'Samarqand',battalion:"3-motoo'chi batalon",phone:'+998906667788',status:'ACTIVE',qual:'EXPERT',sessions:38,avg:88,faceId:true},
    {id:'e07',name:'Эргашев Бекзод Т.',rank:'Рядовой',pos:'Стрелок',region:'Toshkent viloyati',district:'Qibray',battalion:"2-motoo'chi batalon",phone:'+998907778899',status:'RESERVE',qual:'BEGINNER',sessions:1,avg:38,faceId:false},
    {id:'e08',name:'Тошматов Фирдавс Ш.',rank:'Старшина',pos:'Старший инструктор',region:'Toshkent shahri',district:'Mirobod',battalion:'Shtab',phone:'+998908889900',status:'ACTIVE',qual:'EXPERT',sessions:120,avg:95,faceId:true},
  ],

  sessions: [
    {id:'s01',empId:'e05',empName:'Махмудов С.Б.',date:'2026-07-22',time:'09:00',lane:'Дорожка 1',weapon:'PKM',shots:20,hits:18,score:91,type:'MAIN'},
    {id:'s02',empId:'e03',empName:'Юлдашев Д.А.',date:'2026-07-22',time:'10:00',lane:'Дорожка 2',weapon:'AK-74',shots:10,hits:8,score:87,type:'MAIN'},
    {id:'s03',empId:'e06',empName:'Каримов А.У.',date:'2026-07-22',time:'11:00',lane:'Дорожка 3',weapon:'SVD Dragunov',shots:5,hits:2,score:38,type:'TEST'},
    {id:'s04',empId:'e01',empName:'Алиев Б.У.',date:'2026-07-21',time:'14:00',lane:'Дорожка 1',weapon:'AK-74',shots:10,hits:8,score:78,type:'MAIN'},
    {id:'s05',empId:'e08',empName:'Тошматов Ф.Ш.',date:'2026-07-21',time:'15:00',lane:'Дорожка 2',weapon:'PKM',shots:20,hits:19,score:95,type:'MAIN'},
    {id:'s06',empId:'e02',empName:'Рахимов Ж.Т.',date:'2026-07-20',time:'09:00',lane:'Дорожка 1',weapon:'AK-74U',shots:10,hits:7,score:71,type:'MAIN'},
  ],

  lanes: [
    {id:'l01',name:'Дорожка 1',dist:'100м · STANDARD',emp:'e05',empName:'Махмудов С.Б.',weapon:'PKM (Пулемёт)',shots:7,score:62,status:'BUSY',camOnline:true},
    {id:'l02',name:'Дорожка 2',dist:'100м · STANDARD',emp:'e03',empName:'Юлдашев Д.А.',weapon:'AK-74',shots:10,score:87,status:'BUSY',camOnline:true},
    {id:'l03',name:'Дорожка 3',dist:'300м · SILHOUETTE',emp:'e06',empName:'Каримов А.У.',weapon:'SVD Dragunov',shots:4,score:38,status:'BUSY',camOnline:true},
    {id:'l04',name:'Дорожка 4',dist:'100м · STANDARD',emp:null,empName:null,weapon:null,shots:0,score:0,status:'FREE',camOnline:false},
    {id:'l05',name:'Дорожка 5',dist:'100м · STANDARD',emp:'e07',empName:'Алиев Б.У.',weapon:'AK-74',shots:3,score:25,status:'BUSY',camOnline:true},
    {id:'l06',name:'Дорожка 6',dist:'50м · CIRCLE',emp:null,empName:null,weapon:null,shots:0,score:0,status:'MAINTENANCE',camOnline:false},
  ],

  cameras: [
    {id:'c01',name:'Дорожка 1 — A',lane:'Дорожка 1',ip:'192.168.1.64',res:'1280×720',status:'online',rec:true},
    {id:'c02',name:'Дорожка 1 — B',lane:'Дорожка 1',ip:'192.168.1.65',res:'1280×720',status:'online',rec:false},
    {id:'c03',name:'Дорожка 2 — A',lane:'Дорожка 2',ip:'192.168.1.66',res:'1280×720',status:'online',rec:true},
    {id:'c04',name:'Дорожка 2 — B',lane:'Дорожка 2',ip:'192.168.1.67',res:'1920×1080',status:'offline',rec:false},
    {id:'c05',name:'Дорожка 3 — A',lane:'Дорожка 3',ip:'192.168.1.68',res:'1920×1080',status:'online',rec:true},
    {id:'c06',name:'Дорожка 3 — B',lane:'Дорожка 3',ip:'192.168.1.69',res:'1920×1080',status:'online',rec:false},
    {id:'c07',name:'Дорожка 4 — A',lane:'Дорожка 4',ip:'192.168.1.70',res:'1280×720',status:'offline',rec:false},
    {id:'c08',name:'Командная зона',lane:'Командная',ip:'192.168.1.72',res:'1920×1080',status:'online',rec:true},
    {id:'c09',name:'Оружейная',lane:'Оружейная',ip:'192.168.1.73',res:'1280×720',status:'online',rec:false},
  ],

  protocols: [
    {id:'p01',empId:'e05',date:'2026-07-22',weapon:'PKM',shots:20,hits:18,score:91,signed:true},
    {id:'p02',empId:'e03',date:'2026-07-22',weapon:'AK-74',shots:10,hits:8,score:87,signed:true},
    {id:'p03',empId:'e06',date:'2026-07-22',weapon:'SVD Dragunov',shots:5,hits:2,score:38,signed:false},
    {id:'p04',empId:'e01',date:'2026-07-21',weapon:'AK-74',shots:10,hits:8,score:78,signed:true},
    {id:'p05',empId:'e08',date:'2026-07-21',weapon:'PKM',shots:20,hits:19,score:95,signed:true},
    {id:'p06',empId:'e02',date:'2026-07-20',weapon:'AK-74U',shots:10,hits:7,score:71,signed:false},
  ],

  notifications: [
    {id:'n01',title:'Новый запрос',desc:'Махмудов С. забронировал Дорожку 1 на 11:00',time:'5 мин назад',type:'info',read:false},
    {id:'n02',title:'Сессия завершена',desc:'Юлдашев Д. — 87 баллов',time:'1 ч назад',type:'success',read:false},
    {id:'n03',title:'Протокол не подписан',desc:'Каримов А. протокол ожидает подписи',time:'2 ч назад',type:'warning',read:false},
    {id:'n04',title:'Камера offline',desc:'Дорожка 2 — Камера B не отвечает',time:'3 ч назад',type:'error',read:true},
  ],

  settings: {
    lang: 'ru',
    notifications: true,
    vis3d: true,
    faceId: true,
    autoProtocol: true,
    cameraRes: '1280x720',
    theme: 'light',
    timezone: 'UTC+5',
    backupAuto: false,
    apiKey: 'sk_stir_••••••••••••••••',
  },

  get isAuth() { return !!this.user && !!this.token; },
  get unread() { return this.notifications.filter(n=>!n.read).length; },
  empById(id) { return this.employees.find(e=>e.id===id); },

  login(email, password) {
    const users = [
      {email:'manager@shaffoftir.uz',password:'manager123',name:'Тешабаев Жасур',role:'MANAGER',rank:'Полковник'},
      {email:'instructor@shaffoftir.uz',password:'inst123',name:'Каримов Бахтиёр',role:'INSTRUCTOR',rank:'Майор'},
      {email:'employee@shaffoftir.uz',password:'emp123',name:'Эргашев Шерзод',role:'EMPLOYEE',rank:'Сержант'},
    ];
    const u = users.find(x=>x.email===email&&x.password===password);
    if (!u) return false;
    this.user = {email:u.email,name:u.name,role:u.role,rank:u.rank};
    this.token = 'tok_'+Date.now();
    try { localStorage.setItem('stir_auth', JSON.stringify({user:this.user,token:this.token})); } catch(e){}
    return true;
  },
  logout() {
    this.user=null; this.token=null;
    try { localStorage.removeItem('stir_auth'); } catch(e){}
  },
  markAllRead() { this.notifications.forEach(n=>n.read=true); },
  toggleTheme() {
    this.theme = this.theme==='light'?'dark':'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    try { localStorage.setItem('stir_theme', this.theme); } catch(e){}
  },
  canAccess(page) {
    if (!this.user) return false;
    const map = {
      MANAGER:   ['dashboard','range','sessions','employees','training','cameras','compare','reports','settings','profile','help'],
      INSTRUCTOR:['dashboard','range','sessions','employees','training','cameras','compare','reports','settings','profile','help'],
      EMPLOYEE:  ['sessions','training','profile','help'],
    };
    return (map[this.user.role]||[]).includes(page);
  },
});

// Init
try {
  const s = localStorage.getItem('stir_auth');
  if (s) { const d=JSON.parse(s); store.user=d.user; store.token=d.token; }
  const t = localStorage.getItem('stir_theme');
  if (t) { store.theme=t; document.documentElement.setAttribute('data-theme',t); }
} catch(e){}

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────
function qualBadge(q) {
  const m={EXPERT:'badge-green',ADVANCED:'badge-blue',INTERMEDIATE:'badge-amber',BEGINNER:'badge-gray'};
  return m[q]||'badge-gray';
}
function scoreBadge(s) {
  if(s>=90) return 'badge-green';
  if(s>=75) return 'badge-blue';
  if(s>=60) return 'badge-amber';
  return 'badge-red';
}
function now() { return new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); }
function fmtTime() { return new Date().toISOString().slice(11,19); }

// ────────────────────────────────────────────────────────────
// COMPONENTS
// ────────────────────────────────────────────────────────────

// --- SVG Icon component ---
const SvgIcon = {
  props: ['n','size'],
  template: `<span :style="{display:'inline-flex',width:size||'16px',height:size||'16px',alignItems:'center'}" v-html="$options.icons[n]||''"></span>`,
  icons: I,
};

// --- Shooter Canvas Animation ---
const ShooterCanvas = {
  props: { lane: Object, active: Boolean },
  setup(props) {
    const canvasRef = ref(null);
    const holes = ref([]);
    const shooterX = ref(40);
    const flash = ref(null);
    let timer = null;
    let frameId = null;

    function draw() {
      const c = canvasRef.value;
      if (!c) return;
      const ctx = c.getContext('2d');
      const W = c.width, H = c.height;

      ctx.clearRect(0,0,W,H);

      // Background gradient (night range)
      const bg = ctx.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,'#0a1a14');
      bg.addColorStop(0.6,'#0d2018');
      bg.addColorStop(1,'#060e09');
      ctx.fillStyle = bg;
      ctx.fillRect(0,0,W,H);

      // Ground
      ctx.fillStyle = '#0a1a0a';
      ctx.fillRect(0, H*0.75, W, H*0.25);

      // Target rings (right side)
      const tx = W * 0.78, ty = H * 0.42;
      const radii = [44,34,24,14,6];
      const colors = ['rgba(255,255,255,.08)','rgba(255,255,255,.1)','rgba(255,255,255,.13)','rgba(16,185,129,.3)','rgba(16,185,129,.6)'];
      radii.forEach((r,i) => {
        ctx.beginPath();
        ctx.arc(tx,ty,r,0,Math.PI*2);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Target center dot
      ctx.beginPath();
      ctx.arc(tx,ty,4,0,Math.PI*2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Distance line
      ctx.strokeStyle = 'rgba(16,185,129,.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4,8]);
      ctx.beginPath();
      ctx.moveTo(W*0.25, H*0.76);
      ctx.lineTo(W*0.85, H*0.76);
      ctx.stroke();
      ctx.setLineDash([]);

      // Shooter silhouette
      const sx = W * (shooterX.value/100);
      const sy = H * 0.55;
      ctx.fillStyle = '#1a3a2a';
      // Body
      ctx.beginPath();
      ctx.ellipse(sx, sy+18, 7, 20, 0, 0, Math.PI*2);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.arc(sx, sy-8, 8, 0, Math.PI*2);
      ctx.fill();
      // Weapon barrel
      ctx.fillStyle = '#0d2018';
      ctx.fillRect(sx+6, sy, 28, 4);

      // Muzzle flash
      if (flash.value) {
        const now2 = Date.now();
        if (now2 - flash.value.t < 120) {
          ctx.beginPath();
          ctx.arc(sx+34, sy+2, 7, 0, Math.PI*2);
          ctx.fillStyle = `rgba(255,200,50,${1-(now2-flash.value.t)/120})`;
          ctx.fill();
        } else {
          flash.value = null;
        }
      }

      // Bullet holes on target
      holes.value.forEach(h => {
        ctx.beginPath();
        ctx.arc(tx+h.dx, ty+h.dy, 3, 0, Math.PI*2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tx+h.dx, ty+h.dy, 5, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(16,185,129,.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // HUD text
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(16,185,129,.7)';
      ctx.fillText(`ВЫСТР: ${props.lane.shots}`, 8, 14);
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.fillText(`БАЛЛЫ: ${props.lane.score}`, 8, 28);

      frameId = requestAnimationFrame(draw);
    }

    function shoot() {
      if (!props.active || props.lane.status !== 'BUSY') return;
      // Add bullet hole
      const r = 38;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * r;
      holes.value.push({ dx: Math.cos(angle)*dist, dy: Math.sin(angle)*dist });
      if (holes.value.length > 20) holes.value.shift();
      // Flash
      flash.value = { t: Date.now() };
      // Move shooter slightly
      shooterX.value = 35 + Math.random() * 10;
    }

    onMounted(() => {
      draw();
      if (props.active && props.lane.status === 'BUSY') {
        // Randomize initial holes
        for(let i=0;i<Math.min(props.lane.hits||0,8);i++) {
          const a=Math.random()*Math.PI*2, d=Math.random()*36;
          holes.value.push({dx:Math.cos(a)*d,dy:Math.sin(a)*d});
        }
        const interval = 1500 + Math.random()*2000;
        timer = setInterval(shoot, interval);
      }
    });
    onUnmounted(() => {
      if (timer) clearInterval(timer);
      if (frameId) cancelAnimationFrame(frameId);
    });

    return { canvasRef };
  },
  template: `<canvas ref="canvasRef" style="width:100%;height:100%;display:block" :width="320" :height="180"></canvas>`
};

// --- Camera Feed Simulation ---
const CamFeed = {
  props: { cam: Object, size: { default: 'normal' } },
  setup(props) {
    const canvasRef = ref(null);
    let frameId = null;
    let t = 0;

    function drawOnline() {
      const c = canvasRef.value;
      if (!c) return;
      const ctx = c.getContext('2d');
      const W = c.width, H = c.height;
      t += 0.02;

      // Background
      const bg = ctx.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,'#08120a');
      bg.addColorStop(1,'#04080a');
      ctx.fillStyle = bg;
      ctx.fillRect(0,0,W,H);

      // Scanline effect
      for(let y=0;y<H;y+=2) {
        ctx.fillStyle = 'rgba(0,0,0,.03)';
        ctx.fillRect(0,y,W,1);
      }

      // Noise/grain
      if (Math.random() > 0.6) {
        ctx.fillStyle = `rgba(16,185,129,${Math.random()*.04})`;
        ctx.fillRect(Math.random()*W, Math.random()*H, Math.random()*40+10, 1);
      }

      // Moving scan line
      const scanY = ((t*30) % H);
      const grad = ctx.createLinearGradient(0, scanY-4, 0, scanY+4);
      grad.addColorStop(0,'rgba(16,185,129,0)');
      grad.addColorStop(0.5,'rgba(16,185,129,.15)');
      grad.addColorStop(1,'rgba(16,185,129,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY-4, W, 8);

      // Grid lines (surveillance camera look)
      ctx.strokeStyle = 'rgba(16,185,129,.04)';
      ctx.lineWidth = 0.5;
      for(let x=0;x<W;x+=W/8){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=H/6){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

      // Center crosshair
      ctx.strokeStyle = 'rgba(16,185,129,.15)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(W/2-10,H/2); ctx.lineTo(W/2+10,H/2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W/2,H/2-10); ctx.lineTo(W/2,H/2+10); ctx.stroke();

      // Timestamp
      ctx.font = `${H>100?10:8}px monospace`;
      ctx.fillStyle = 'rgba(16,185,129,.6)';
      const ts = new Date().toLocaleTimeString('ru');
      ctx.fillText(ts, 5, H-5);

      frameId = requestAnimationFrame(drawOnline);
    }

    function drawOffline() {
      const c = canvasRef.value;
      if (!c) return;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0,0,c.width,c.height);
      // Static noise
      for(let i=0;i<200;i++){
        ctx.fillStyle=`rgba(255,255,255,${Math.random()*.04})`;
        ctx.fillRect(Math.random()*c.width,Math.random()*c.height,2,1);
      }
    }

    onMounted(() => {
      if (props.cam.status === 'online') drawOnline();
      else drawOffline();
    });
    onUnmounted(() => { if(frameId) cancelAnimationFrame(frameId); });
    return { canvasRef };
  },
  template: `<canvas ref="canvasRef" style="width:100%;height:100%;display:block" :width="320" :height="180"></canvas>`
};

// ────────────────────────────────────────────────────────────
// PAGES
// ────────────────────────────────────────────────────────────

// --- LOGIN ---
const LoginPage = {
  components: { SvgIcon },
  setup() {
    const s = inject(STORE_KEY);
    const router = useRouter();
    const email = ref(''), pass = ref(''), loading = ref(false), error = ref('');
    function submit() {
      loading.value=true; error.value='';
      setTimeout(()=>{
        if(s.login(email.value,pass.value)) router.push('/dashboard');
        else { error.value='Неверный email или пароль'; loading.value=false; }
      },500);
    }
    return { email, pass, loading, error, submit, I };
  },
  template: `
<div class="login-page">
  <div class="login-card">
    <div class="login-logo">
      <div class="logo-mark"><span v-html="I.target" style="width:16px;height:16px;color:#fff"></span></div>
      <div>
        <div style="font-size:18px;font-weight:800">Shaffof<span style="color:var(--brand)">TIR</span></div>
        <div style="font-size:11px;color:var(--text3)">TIR Axborot Tizimi</div>
      </div>
    </div>
    <div style="font-size:20px;font-weight:700;margin-bottom:4px">Вход в систему</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:24px">Введите данные для входа</div>
    <form @submit.prevent="submit" style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label class="label">Email</label>
        <input class="input" v-model="email" type="email" placeholder="manager@shaffoftir.uz" required autocomplete="email">
      </div>
      <div>
        <label class="label">Пароль</label>
        <input class="input" v-model="pass" type="password" placeholder="••••••••" required>
      </div>
      <div v-if="error" style="color:var(--red);font-size:13px;background:var(--red-l);padding:8px 12px;border-radius:8px">{{error}}</div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;padding:10px;font-size:14px" :disabled="loading">
        {{loading?'Вход...':'Войти'}}
      </button>
    </form>
    <div style="margin-top:20px;padding:12px;background:var(--surface2);border-radius:8px;font-size:12px;color:var(--text3);line-height:2">
      <b style="color:var(--text2)">Демо аккаунты:</b><br>
      manager@shaffoftir.uz / manager123<br>
      instructor@shaffoftir.uz / inst123<br>
      employee@shaffoftir.uz / emp123
    </div>
  </div>
</div>`
};

// --- DASHBOARD ---
const DashboardPage = {
  components: { SvgIcon },
  setup() {
    const s = inject(STORE_KEY);
    const fR=ref(''),fB=ref('');
    const filtered = computed(()=>s.employees.filter(e=>{
      if(fR.value&&e.region!==fR.value) return false;
      if(fB.value&&e.battalion!==fB.value) return false;
      return true;
    }));
    const stats = computed(()=>{
      const ids = new Set(filtered.value.map(e=>e.id));
      const ss = s.sessions.filter(x=>ids.has(x.empId));
      return {
        emp: filtered.value.length,
        active: filtered.value.filter(e=>e.status==='ACTIVE').length,
        sess: ss.length,
        avg: ss.length ? Math.round(ss.reduce((a,x)=>a+x.score,0)/ss.length) : 0,
        shots: ss.reduce((a,x)=>a+x.shots,0),
        hits:  ss.reduce((a,x)=>a+x.hits,0),
      };
    });
    const weekly = [12,8,15,10,18,6,3];
    const wMax = Math.max(...weekly);
    const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    const top5 = computed(()=>[...s.employees].sort((a,b)=>b.avg-a.avg).slice(0,5));
    return { s, fR, fB, filtered, stats, weekly, wMax, days, top5, REGIONS, BATTALIONS, qualBadge, scoreBadge, I };
  },
  template: `
<div>
  <div class="page-header-row" style="margin-bottom:16px">
    <div class="page-header" style="margin:0">
      <h1>Панель управления</h1>
      <p>Общая статистика системы в реальном времени</p>
    </div>
    <div class="filter-row" style="margin:0">
      <select class="select" style="width:auto;min-width:160px" v-model="fR">
        <option value="">Все регионы</option>
        <option v-for="r in Object.keys(REGIONS)" :key="r">{{r}}</option>
      </select>
      <select class="select" style="width:auto;min-width:160px" v-model="fB">
        <option value="">Все батальоны</option>
        <option v-for="b in BATTALIONS" :key="b">{{b}}</option>
      </select>
      <button v-if="fR||fB" class="btn btn-ghost btn-sm" @click="fR='';fB=''">✕ Сброс</button>
    </div>
  </div>

  <!-- Stats -->
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--brand-l)">
        <span v-html="I.users" style="width:20px;color:var(--brand-d)"></span>
      </div>
      <div>
        <div class="stat-label">Сотрудников</div>
        <div class="stat-value">{{stats.emp}}</div>
        <div class="stat-sub">{{stats.active}} активных</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--blue-l)">
        <span v-html="I.sessions" style="width:20px;color:var(--blue)"></span>
      </div>
      <div>
        <div class="stat-label">Сессий</div>
        <div class="stat-value">{{stats.sess}}</div>
        <div class="stat-sub">{{stats.shots}} выстрелов</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--amber-l)">
        <span v-html="I.target" style="width:20px;color:var(--amber)"></span>
      </div>
      <div>
        <div class="stat-label">Средний балл</div>
        <div class="stat-value">{{stats.avg}}</div>
        <div class="stat-sub">{{stats.hits}} точных</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--purple-l)">
        <span v-html="I.trending" style="width:20px;color:var(--purple)"></span>
      </div>
      <div>
        <div class="stat-label">Точность</div>
        <div class="stat-value">{{stats.shots?Math.round(stats.hits/stats.shots*100):0}}%</div>
        <div class="stat-sub">{{stats.hits}}/{{stats.shots}}</div>
      </div>
    </div>
  </div>

  <div class="grid-2" style="margin-bottom:16px">
    <!-- Weekly chart -->
    <div class="card">
      <div class="card-title">Сессии за неделю</div>
      <div style="display:flex;align-items:flex-end;gap:6px;height:100px;padding:4px 0">
        <div v-for="(v,i) in weekly" :key="i" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="font-size:10px;color:var(--text3)">{{v}}</div>
          <div :style="{flex:1,width:'100%',background:i===3?'var(--brand)':'var(--brand-l)',borderRadius:'4px 4px 0 0',minHeight:'4px',height:(v/wMax*80)+'px'}"></div>
          <div style="font-size:10px;color:var(--text3)">{{days[i]}}</div>
        </div>
      </div>
    </div>
    <!-- Notifications -->
    <div class="card">
      <div class="card-title">Последние уведомления</div>
      <div v-for="n in s.notifications.slice(0,4)" :key="n.id" style="padding:8px 0;border-bottom:1px solid var(--border);display:flex;gap:8px;align-items:flex-start">
        <div style="width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:5px"
          :style="{background:n.type==='success'?'var(--brand)':n.type==='error'?'var(--red)':n.type==='warning'?'var(--amber)':'var(--blue)'}"></div>
        <div>
          <div style="font-size:12px;font-weight:500">{{n.title}}</div>
          <div style="font-size:11px;color:var(--text3)">{{n.time}}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <!-- Regions -->
    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:14px 16px;border-bottom:1px solid var(--border)">
        <div class="card-title" style="margin:0">Статистика по регионам</div>
      </div>
      <table>
        <thead><tr><th>Регион</th><th>Сотр.</th><th>Сессии</th><th>Балл</th></tr></thead>
        <tbody>
          <tr v-for="r in Object.keys(REGIONS)" :key="r">
            <td>{{r.replace(' viloyati','').replace(' shahri','')}}</td>
            <td>{{s.employees.filter(e=>e.region===r).length}}</td>
            <td>{{s.sessions.filter(x=>s.employees.find(e=>e.id===x.empId&&e.region===r)).length}}</td>
            <td>
              <span class="badge badge-green">
                {{(()=>{const ee=s.employees.filter(e=>e.region===r);const ss=s.sessions.filter(x=>ee.find(e=>e.id===x.empId));return ss.length?Math.round(ss.reduce((a,x)=>a+x.score,0)/ss.length):0})()}}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Top 5 -->
    <div class="card">
      <div class="card-title">Топ-5 стрелков</div>
      <div v-for="(e,i) in top5" :key="e.id" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="width:24px;height:24px;border-radius:50%;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--text2)">{{i+1}}</div>
        <div class="avatar" style="width:32px;height:32px;font-size:12px">{{e.name[0]}}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{e.name}}</div>
          <div style="font-size:11px;color:var(--text3)">{{e.rank}} · {{e.sessions}} сессий</div>
        </div>
        <span :class="'badge '+scoreBadge(e.avg)">{{e.avg}}</span>
      </div>
    </div>
  </div>
</div>`
};

// --- TIR / RANGE ---
const RangePage = {
  components: { SvgIcon, ShooterCanvas },
  setup() {
    const s = inject(STORE_KEY);
    const router = useRouter();
    const selLane = ref(null);
    const clock = ref(now());
    let clockTimer = null;
    onMounted(()=>{ clockTimer = setInterval(()=>{ clock.value=now(); },1000); });
    onUnmounted(()=>{ if(clockTimer) clearInterval(clockTimer); });
    const activeLanes = computed(()=>s.lanes.filter(l=>l.status==='BUSY').length);
    const totalShots = computed(()=>s.lanes.reduce((a,l)=>a+l.shots,0));
    const totalScore = computed(()=>s.lanes.reduce((a,l)=>a+l.score,0));
    const maintenance = computed(()=>s.lanes.filter(l=>l.status==='MAINTENANCE').length);
    function statusLabel(st) {
      return {BUSY:'Занято',FREE:'Свободно',MAINTENANCE:'Техобслуживание'}[st]||st;
    }
    function statusClass(st) {
      return {BUSY:'badge-green',FREE:'badge-gray',MAINTENANCE:'badge-amber'}[st]||'badge-gray';
    }
    return { s, selLane, clock, activeLanes, totalShots, totalScore, maintenance, statusLabel, statusClass, I };
  },
  template: `
<div>
  <div class="page-header-row" style="margin-bottom:16px">
    <div class="page-header" style="margin:0">
      <h1>Огневой тир</h1>
      <p>Состояние дорожек и живой эфир · {{clock}}</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-secondary"><span v-html="I.settings" style="width:15px"></span> Настроить</button>
      <button class="btn btn-primary"><span v-html="I.plus" style="width:15px"></span> Новая сессия</button>
    </div>
  </div>

  <!-- Stats -->
  <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--brand-l)">
        <span v-html="I.activity" style="width:20px;color:var(--brand-d)"></span>
      </div>
      <div><div class="stat-label">Актив. дорожек</div><div class="stat-value" style="color:var(--brand)">{{activeLanes}}</div><div class="stat-sub">Заняты</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--blue-l)">
        <span v-html="I.zap" style="width:20px;color:var(--blue)"></span>
      </div>
      <div><div class="stat-label">Всего выстр.</div><div class="stat-value">{{totalShots}}</div><div class="stat-sub">выстрелов</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--amber-l)">
        <span v-html="I.target" style="width:20px;color:var(--amber)"></span>
      </div>
      <div><div class="stat-label">Всего очков</div><div class="stat-value">{{totalScore}}</div><div class="stat-sub">текущие</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--red-l)">
        <span v-html="I.settings" style="width:20px;color:var(--red)"></span>
      </div>
      <div><div class="stat-label">В ремонте</div><div class="stat-value" style="color:var(--red)">{{maintenance}}</div><div class="stat-sub">дорожек</div></div>
    </div>
  </div>

  <!-- Lane Grid -->
  <div class="range-grid">
    <div v-for="lane in s.lanes" :key="lane.id" class="lane-card">
      <!-- Feed -->
      <div class="lane-feed" @click="selLane=lane">
        <div class="lane-feed-inner">
          <shooter-canvas :lane="lane" :active="lane.status==='BUSY'" style="width:100%;height:100%"/>
        </div>
        <!-- HUD overlays -->
        <div class="lane-overlay-tl">
          <div class="live-pill" :style="{opacity:lane.camOnline?1:0.5}">
            <span class="live-dot" v-if="lane.camOnline"></span>
            <span v-html="I.camera" style="width:10px;height:10px;opacity:.7"></span>
            <span>{{lane.id.replace('l0','')}}</span>
          </div>
        </div>
        <div class="lane-overlay-tr">
          <span class="lane-badge" :class="{
            'badge-green':lane.status==='BUSY',
            'badge-gray':lane.status==='FREE',
            'badge-amber':lane.status==='MAINTENANCE'
          }">{{statusLabel(lane.status)}}</span>
        </div>
        <div class="lane-overlay-bl" v-if="lane.status==='BUSY'">
          <div class="lane-score">{{lane.shots}} выстр. · <b>{{lane.score}} балл</b></div>
        </div>
        <div v-if="!lane.camOnline" style="position:absolute;inset:0;background:#060a08;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px">
          <span v-html="I.camera" style="width:28px;height:28px;opacity:.2;color:#fff"></span>
          <span style="font-size:11px;color:rgba(255,255,255,.3)">OFFLINE</span>
        </div>
      </div>
      <!-- Info -->
      <div class="lane-footer">
        <div class="lane-title">
          <span v-html="I.camera" style="width:14px;color:var(--brand)"></span>
          {{lane.name}}
          <span style="font-size:11px;color:var(--text3);font-weight:400;margin-left:4px">{{lane.dist}}</span>
        </div>
        <div v-if="lane.status==='BUSY'" class="lane-meta">
          <div style="display:flex;align-items:center;gap:6px">
            <div class="avatar" style="width:26px;height:26px;font-size:10px">{{(lane.empName||'?')[0]}}</div>
            <div>
              <div style="font-size:12px;font-weight:500">{{lane.empName}}</div>
              <div style="font-size:11px;color:var(--text3)">{{lane.weapon}}</div>
            </div>
          </div>
          <span :class="'badge '+scoreBadge(lane.score)">{{lane.score}}</span>
        </div>
        <div v-else style="font-size:12px;color:var(--text3)">
          <span v-if="lane.status==='MAINTENANCE'" style="color:var(--amber)">⚙ На техобслуживании</span>
          <span v-else style="color:var(--brand)">● Свободно</span>
        </div>
      </div>
      <div class="lane-actions" v-if="lane.status==='BUSY'">
        <button class="btn btn-secondary btn-sm" style="flex:1;justify-content:center" @click="selLane=lane">
          <span v-html="I.activity" style="width:13px"></span> Наблюдать
        </button>
        <button class="btn btn-ghost btn-sm" @click="selLane=lane">
          <span v-html="I.camera" style="width:13px"></span> Камера
        </button>
      </div>
    </div>
  </div>

  <!-- Lane detail modal -->
  <div v-if="selLane" class="modal-overlay" @click.self="selLane=null">
    <div class="modal modal-lg">
      <div class="modal-header">
        <span class="modal-title">{{selLane.name}} — {{selLane.dist}}</span>
        <button class="btn btn-ghost btn-icon" @click="selLane=null" v-html="I.x"></button>
      </div>
      <div class="modal-body">
        <div style="background:#0a1a14;border-radius:10px;overflow:hidden;margin-bottom:16px;aspect-ratio:16/9">
          <shooter-canvas :lane="selLane" :active="selLane.status==='BUSY'" style="width:100%;height:100%"/>
        </div>
        <div v-if="selLane.status==='BUSY'" class="grid-2">
          <div class="card" style="text-align:center">
            <div style="font-size:32px;font-weight:700;color:var(--brand)">{{selLane.score}}</div>
            <div style="font-size:12px;color:var(--text3)">Баллов</div>
          </div>
          <div class="card" style="text-align:center">
            <div style="font-size:32px;font-weight:700">{{selLane.shots}}</div>
            <div style="font-size:12px;color:var(--text3)">Выстрелов</div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div style="font-size:14px;font-weight:500;color:var(--text2)">{{statusLabel(selLane.status)}}</div>
        </div>
      </div>
    </div>
  </div>
</div>`
};

// --- CAMERAS (Security Monitor Style) ---
const CamerasPage = {
  components: { SvgIcon, CamFeed },
  setup() {
    const s = inject(STORE_KEY);
    const layout = ref(4);
    const selCam = ref(null);
    const clock = ref(fmtTime());
    let timer = null;
    onMounted(()=>{ timer=setInterval(()=>{ clock.value=fmtTime(); },1000); });
    onUnmounted(()=>{ if(timer) clearInterval(timer); });
    const visibleCams = computed(()=>s.cameras.slice(0,layout.value));
    const online = computed(()=>s.cameras.filter(c=>c.status==='online').length);
    function gridClass(l) { return {4:'cam-grid-4',6:'cam-grid-6',9:'cam-grid-9'}[l]||'cam-grid-4'; }
    return { s, layout, selCam, clock, visibleCams, online, gridClass, I };
  },
  template: `
<div>
  <div class="page-header-row" style="margin-bottom:16px">
    <div class="page-header" style="margin:0">
      <h1>Система видеонаблюдения</h1>
      <p>Мониторинг всех камер в реальном времени</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-secondary btn-sm"><span v-html="I.download" style="width:14px"></span> Запись</button>
      <button class="btn btn-secondary btn-sm"><span v-html="I.maximize" style="width:14px"></span> Полный экран</button>
    </div>
  </div>

  <!-- Status bar -->
  <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center;flex-wrap:wrap">
    <span class="badge badge-green"><span style="width:6px;height:6px;border-radius:50%;background:var(--brand);animation:blink 1.2s infinite;display:inline-block"></span> {{online}} ONLINE</span>
    <span class="badge badge-red">{{s.cameras.length-online}} OFFLINE</span>
    <span style="font-size:12px;color:var(--text3);font-family:monospace">{{clock}} UTC+5</span>
    <div style="margin-left:auto;display:flex;gap:4px">
      <button class="btn btn-ghost btn-sm" :class="{active:layout===4}" @click="layout=4">2×2</button>
      <button class="btn btn-ghost btn-sm" :class="{active:layout===6}" @click="layout=6">2×3</button>
      <button class="btn btn-ghost btn-sm" :class="{active:layout===9}" @click="layout=9">3×3</button>
    </div>
  </div>

  <!-- Monitor -->
  <div class="cam-monitor">
    <div class="cam-status-bar">
      <span>ShaffofTIR CCTV v2.0</span>
      <span style="margin-left:auto">{{s.cameras.length}} камер · {{online}} онлайн · {{clock}}</span>
    </div>
    <div :class="gridClass(layout)">
      <div v-for="cam in visibleCams" :key="cam.id" class="cam-cell" :class="{selected:selCam&&selCam.id===cam.id}" @click="selCam=cam">
        <div class="cam-feed-bg" style="position:absolute;inset:0">
          <cam-feed :cam="cam" style="width:100%;height:100%"/>
        </div>
        <!-- HUD -->
        <div class="cam-hud-tl">
          <div style="background:rgba(0,0,0,.5);padding:2px 6px;border-radius:3px">
            CH-{{cam.id.replace('c0','').replace('c','')}} · {{cam.name}}
          </div>
        </div>
        <div class="cam-hud-tr" v-if="cam.status==='online'">
          <div style="display:flex;align-items:center;gap:4px;background:rgba(0,0,0,.5);padding:2px 8px;border-radius:3px">
            <span style="width:5px;height:5px;border-radius:50%;background:var(--red);animation:blink 1s infinite;display:inline-block"></span>
            <span style="font-size:9px;color:#fff;font-family:monospace">LIVE</span>
            <span v-if="cam.rec" style="font-size:8px;color:var(--red);font-family:monospace">● REC</span>
          </div>
        </div>
        <div class="cam-hud-bl">
          <span style="background:rgba(0,0,0,.5);padding:2px 6px;border-radius:3px">{{cam.res}}</span>
        </div>
        <div class="cam-hud-br">
          <span :style="{background:'rgba(0,0,0,.5)',padding:'2px 6px',borderRadius:'3px',color:cam.status==='online'?'#10b981':'#ef4444'}">
            {{cam.status.toUpperCase()}}
          </span>
        </div>
        <!-- Scanline (online) -->
        <div v-if="cam.status==='online'" class="cam-scanline"></div>
        <!-- Offline overlay -->
        <div v-if="cam.status==='offline'" class="cam-offline-bg">
          <span v-html="I.camera" style="width:24px;height:24px;opacity:.2;color:#fff"></span>
          <span style="font-size:9px;color:rgba(255,255,255,.3);font-family:monospace">NO SIGNAL</span>
        </div>
        <!-- Hover overlay -->
        <div class="cam-overlay">
          <span v-html="I.maximize" style="width:20px;color:#fff"></span>
        </div>
      </div>
    </div>
    <div class="cam-controls">
      <div style="display:flex;gap:6px">
        <button v-for="n in [4,6,9]" :key="n" class="cam-layout-btn" :class="{active:layout===n}" @click="layout=n">
          {{n===4?'2×2':n===6?'2×3':'3×3'}}
        </button>
      </div>
      <span style="font-size:10px;color:rgba(255,255,255,.3);font-family:monospace">{{clock}}</span>
    </div>
  </div>

  <!-- Camera list below -->
  <div class="card" style="margin-top:14px;padding:0;overflow:hidden">
    <table>
      <thead><tr><th>Камера</th><th>Расположение</th><th>IP адрес</th><th>Разрешение</th><th>Статус</th><th>Запись</th></tr></thead>
      <tbody>
        <tr v-for="c in s.cameras" :key="c.id" style="cursor:pointer" @click="selCam=c;layout=Math.max(4,layout)">
          <td style="font-weight:500">{{c.name}}</td>
          <td>{{c.lane}}</td>
          <td style="font-family:monospace;font-size:12px">{{c.ip}}</td>
          <td><span class="tag">{{c.res}}</span></td>
          <td><span :class="'badge '+(c.status==='online'?'badge-green':'badge-red')">{{c.status}}</span></td>
          <td><span :class="'badge '+(c.rec?'badge-red':'badge-gray')">{{c.rec?'● REC':'Нет'}}</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Cam detail modal -->
  <div v-if="selCam" class="modal-overlay" @click.self="selCam=null">
    <div class="modal modal-lg">
      <div class="modal-header">
        <span class="modal-title">{{selCam.name}}</span>
        <button class="btn btn-ghost btn-icon" @click="selCam=null" v-html="I.x"></button>
      </div>
      <div class="modal-body">
        <div style="background:#0a0c0f;border-radius:10px;overflow:hidden;aspect-ratio:16/9;margin-bottom:14px">
          <cam-feed :cam="selCam" style="width:100%;height:100%"/>
        </div>
        <div class="grid-2" style="gap:10px">
          <div><div class="label">IP адрес</div><code style="font-size:13px">{{selCam.ip}}</code></div>
          <div><div class="label">Разрешение</div><span>{{selCam.res}}</span></div>
          <div><div class="label">Статус</div><span :class="'badge '+(selCam.status==='online'?'badge-green':'badge-red')">{{selCam.status}}</span></div>
          <div><div class="label">Запись</div><span :class="'badge '+(selCam.rec?'badge-red':'badge-gray')">{{selCam.rec?'Ведётся':'Нет'}}</span></div>
        </div>
      </div>
    </div>
  </div>
</div>`
};

// --- COMPARE ---
const ComparePage = {
  components: { SvgIcon },
  setup() {
    const s = inject(STORE_KEY);
    const selA = ref('e05'), selB = ref('e08');
    const empA = computed(()=>s.employees.find(e=>e.id===selA.value));
    const empB = computed(()=>s.employees.find(e=>e.id===selB.value));
    const sessA = computed(()=>s.sessions.filter(x=>x.empId===selA.value));
    const sessB = computed(()=>s.sessions.filter(x=>x.empId===selB.value));
    const avgA = computed(()=>sessA.value.length?Math.round(sessA.value.reduce((a,x)=>a+x.score,0)/sessA.value.length):0);
    const avgB = computed(()=>sessB.value.length?Math.round(sessB.value.reduce((a,x)=>a+x.score,0)/sessB.value.length):0);
    const accA = computed(()=>{const ss=sessA.value;return ss.length?Math.round(ss.reduce((a,x)=>a+x.hits,0)/ss.reduce((a,x)=>a+x.shots,0)*100):0;});
    const accB = computed(()=>{const ss=sessB.value;return ss.length?Math.round(ss.reduce((a,x)=>a+x.hits,0)/ss.reduce((a,x)=>a+x.shots,0)*100):0;});
    function winner(a,b) { return a>b?'A':b>a?'B':'='; }
    function drawTarget(empId, canvas) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = '#0a1a14';
      ctx.fillRect(0,0,W,H);
      const cx=W/2, cy=H/2;
      [90,70,50,30,15].forEach((r,i)=>{
        ctx.beginPath(); ctx.arc(cx,cy,r*(W/200),0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,255,255,${0.06+i*0.02})`; ctx.lineWidth=1; ctx.stroke();
      });
      const emp = s.employees.find(e=>e.id===empId);
      const count = emp ? Math.min(emp.sessions*2, 15) : 0;
      const qual = emp?.qual||'BEGINNER';
      const spread = qual==='EXPERT'?20:qual==='ADVANCED'?32:qual==='INTERMEDIATE'?48:70;
      for(let i=0;i<count;i++) {
        const a=Math.random()*Math.PI*2, d=Math.random()*(spread*(W/200));
        ctx.beginPath(); ctx.arc(cx+Math.cos(a)*d, cy+Math.sin(a)*d, 3,0,Math.PI*2);
        ctx.fillStyle='#10b981'; ctx.fill();
      }
    }
    const canvasA = ref(null), canvasB = ref(null);
    watch([selA, selB, canvasA, canvasB],()=>{
      nextTick(()=>{ if(canvasA.value) drawTarget(selA.value,canvasA.value); if(canvasB.value) drawTarget(selB.value,canvasB.value); });
    },{immediate:true});
    return { s, selA, selB, empA, empB, sessA, sessB, avgA, avgB, accA, accB, winner, canvasA, canvasB, qualBadge, scoreBadge, I };
  },
  template: `
<div>
  <div class="page-header" style="margin-bottom:16px">
    <h1>Сравнение сотрудников</h1>
    <p>Сопоставьте результаты двух стрелков по всем показателям</p>
  </div>

  <!-- Selector -->
  <div class="compare-split" style="margin-bottom:16px">
    <div class="card">
      <div class="card-title">Стрелок А</div>
      <select class="select" v-model="selA" style="margin-bottom:10px">
        <option v-for="e in s.employees" :key="e.id" :value="e.id" :disabled="e.id===selB">{{e.name}} — {{e.rank}}</option>
      </select>
      <div v-if="empA" style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="width:40px;height:40px;font-size:16px">{{empA.name[0]}}</div>
        <div>
          <div style="font-weight:600">{{empA.name}}</div>
          <div style="font-size:12px;color:var(--text3)">{{empA.rank}} · {{empA.pos}}</div>
          <span :class="'badge '+qualBadge(empA.qual)" style="margin-top:4px;display:inline-flex">{{empA.qual}}</span>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Стрелок Б</div>
      <select class="select" v-model="selB" style="margin-bottom:10px">
        <option v-for="e in s.employees" :key="e.id" :value="e.id" :disabled="e.id===selA">{{e.name}} — {{e.rank}}</option>
      </select>
      <div v-if="empB" style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="width:40px;height:40px;font-size:16px">{{empB.name[0]}}</div>
        <div>
          <div style="font-weight:600">{{empB.name}}</div>
          <div style="font-size:12px;color:var(--text3)">{{empB.rank}} · {{empB.pos}}</div>
          <span :class="'badge '+qualBadge(empB.qual)" style="margin-top:4px;display:inline-flex">{{empB.qual}}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Targets -->
  <div class="compare-split">
    <div>
      <div class="card-title">Рассеивание А — {{empA?.name}}</div>
      <div class="compare-target" style="aspect-ratio:1;max-height:220px">
        <canvas ref="canvasA" width="200" height="200" style="width:100%;height:100%"></canvas>
      </div>
    </div>
    <div>
      <div class="card-title">Рассеивание Б — {{empB?.name}}</div>
      <div class="compare-target" style="aspect-ratio:1;max-height:220px">
        <canvas ref="canvasB" width="200" height="200" style="width:100%;height:100%"></canvas>
      </div>
    </div>
  </div>

  <!-- Metrics -->
  <div class="compare-split" style="margin-top:16px">
    <div class="card">
      <div class="card-title">Метрики — {{empA?.name}}</div>
      <div class="compare-stats">
        <div class="compare-metric">
          <div class="val" style="color:var(--brand)">{{avgA}}</div>
          <div class="key">Средний балл</div>
          <div class="compare-bar"><div class="compare-bar-fill" :style="{width:avgA+'%',background:'var(--brand)'}"></div></div>
        </div>
        <div class="compare-metric">
          <div class="val">{{accA}}%</div>
          <div class="key">Точность</div>
          <div class="compare-bar"><div class="compare-bar-fill" :style="{width:accA+'%',background:'var(--blue)'}"></div></div>
        </div>
        <div class="compare-metric">
          <div class="val">{{sessA.length}}</div>
          <div class="key">Сессий</div>
        </div>
        <div class="compare-metric">
          <div class="val">{{empA?.sessions||0}}</div>
          <div class="key">Всего сессий</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Метрики — {{empB?.name}}</div>
      <div class="compare-stats">
        <div class="compare-metric">
          <div class="val" style="color:var(--brand)">{{avgB}}</div>
          <div class="key">Средний балл</div>
          <div class="compare-bar"><div class="compare-bar-fill" :style="{width:avgB+'%',background:'var(--brand)'}"></div></div>
        </div>
        <div class="compare-metric">
          <div class="val">{{accB}}%</div>
          <div class="key">Точность</div>
          <div class="compare-bar"><div class="compare-bar-fill" :style="{width:accB+'%',background:'var(--blue)'}"></div></div>
        </div>
        <div class="compare-metric">
          <div class="val">{{sessB.length}}</div>
          <div class="key">Сессий</div>
        </div>
        <div class="compare-metric">
          <div class="val">{{empB?.sessions||0}}</div>
          <div class="key">Всего сессий</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Verdict -->
  <div class="card" style="margin-top:16px">
    <div class="card-title">Итог сравнения</div>
    <table>
      <thead><tr><th>Показатель</th><th>{{empA?.name}}</th><th>{{empB?.name}}</th><th>Победитель</th></tr></thead>
      <tbody>
        <tr>
          <td>Средний балл</td>
          <td><span :class="'badge '+scoreBadge(avgA)">{{avgA}}</span></td>
          <td><span :class="'badge '+scoreBadge(avgB)">{{avgB}}</span></td>
          <td><span class="winner-badge" v-if="winner(avgA,avgB)!=='='">{{winner(avgA,avgB)==='A'?empA?.name:empB?.name}}</span><span v-else>Ничья</span></td>
        </tr>
        <tr>
          <td>Точность</td>
          <td>{{accA}}%</td>
          <td>{{accB}}%</td>
          <td><span class="winner-badge" v-if="winner(accA,accB)!=='='">{{winner(accA,accB)==='A'?empA?.name:empB?.name}}</span><span v-else>Ничья</span></td>
        </tr>
        <tr>
          <td>Кол-во сессий</td>
          <td>{{empA?.sessions}}</td>
          <td>{{empB?.sessions}}</td>
          <td><span class="winner-badge" v-if="winner(empA?.sessions||0,empB?.sessions||0)!=='='">{{winner(empA?.sessions||0,empB?.sessions||0)==='A'?empA?.name:empB?.name}}</span><span v-else>Ничья</span></td>
        </tr>
        <tr>
          <td>Квалификация</td>
          <td><span :class="'badge '+qualBadge(empA?.qual)">{{empA?.qual}}</span></td>
          <td><span :class="'badge '+qualBadge(empB?.qual)">{{empB?.qual}}</span></td>
          <td>—</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`
};

// --- EMPLOYEES ---
const EmployeesPage = {
  components: { SvgIcon },
  setup() {
    const s = inject(STORE_KEY);
    const search=ref(''),fR=ref(''),fB=ref(''),fS=ref(''),sel=ref(null);
    const filtered = computed(()=>s.employees.filter(e=>{
      if(search.value&&!e.name.toLowerCase().includes(search.value.toLowerCase())) return false;
      if(fR.value&&e.region!==fR.value) return false;
      if(fB.value&&e.battalion!==fB.value) return false;
      if(fS.value&&e.status!==fS.value) return false;
      return true;
    }));
    return { s, search, fR, fB, fS, filtered, sel, qualBadge, scoreBadge, REGIONS, BATTALIONS, I };
  },
  template: `
<div>
  <div class="page-header-row" style="margin-bottom:16px">
    <div class="page-header" style="margin:0"><h1>Сотрудники</h1><p>База данных личного состава</p></div>
    <button class="btn btn-primary"><span v-html="I.plus" style="width:15px"></span> Добавить</button>
  </div>
  <div class="filter-row">
    <div style="position:relative;flex:1;max-width:280px">
      <span v-html="I.search" style="width:14px;position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text3)"></span>
      <input class="input" style="padding-left:32px" v-model="search" placeholder="Поиск по имени...">
    </div>
    <select class="select" style="width:auto;min-width:150px" v-model="fR"><option value="">Все регионы</option><option v-for="r in Object.keys(REGIONS)" :key="r">{{r}}</option></select>
    <select class="select" style="width:auto;min-width:160px" v-model="fB"><option value="">Все батальоны</option><option v-for="b in BATTALIONS" :key="b">{{b}}</option></select>
    <select class="select" style="width:auto" v-model="fS"><option value="">Все статусы</option><option value="ACTIVE">Активный</option><option value="RESERVE">Резерв</option></select>
    <button v-if="search||fR||fB||fS" class="btn btn-ghost btn-sm" @click="search='';fR='';fB='';fS=''">✕</button>
    <span style="margin-left:auto;font-size:12px;color:var(--text3)">{{filtered.length}} из {{s.employees.length}}</span>
  </div>
  <div class="card" style="padding:0;overflow:hidden">
    <table>
      <thead><tr><th>Ф.И.О</th><th>Звание</th><th>Должность</th><th>Регион</th><th>Батальон</th><th>Статус</th><th>Квалиф.</th><th>Сессий</th><th>Балл</th><th>FaceID</th></tr></thead>
      <tbody>
        <tr v-for="e in filtered" :key="e.id" style="cursor:pointer" @click="sel=e">
          <td style="display:flex;align-items:center;gap:8px">
            <div class="avatar" style="width:28px;height:28px;font-size:11px;flex-shrink:0">{{e.name[0]}}</div>
            <span style="font-weight:500">{{e.name}}</span>
          </td>
          <td style="color:var(--text2)">{{e.rank}}</td>
          <td style="color:var(--text2)">{{e.pos}}</td>
          <td style="font-size:12px">{{e.region.replace(' viloyati','').replace(' shahri','')}}</td>
          <td style="font-size:12px">{{e.battalion}}</td>
          <td><span :class="'badge '+(e.status==='ACTIVE'?'badge-green':'badge-gray')">{{e.status==='ACTIVE'?'Активный':'Резерв'}}</span></td>
          <td><span :class="'badge '+qualBadge(e.qual)">{{e.qual}}</span></td>
          <td>{{e.sessions}}</td>
          <td><span :class="'badge '+scoreBadge(e.avg)"><b>{{e.avg}}</b></span></td>
          <td><span :class="'badge '+(e.faceId?'badge-green':'badge-red')">{{e.faceId?'✓':'✕'}}</span></td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- Detail modal -->
  <div v-if="sel" class="modal-overlay" @click.self="sel=null">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Карточка сотрудника</span>
        <button class="btn btn-ghost btn-icon" @click="sel=null" v-html="I.x"></button>
      </div>
      <div class="modal-body">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
          <div class="avatar" style="width:52px;height:52px;font-size:20px">{{sel.name[0]}}</div>
          <div>
            <div style="font-size:16px;font-weight:700">{{sel.name}}</div>
            <div style="font-size:13px;color:var(--text2)">{{sel.rank}} · {{sel.pos}}</div>
            <div style="display:flex;gap:6px;margin-top:6px">
              <span :class="'badge '+qualBadge(sel.qual)">{{sel.qual}}</span>
              <span :class="'badge '+(sel.status==='ACTIVE'?'badge-green':'badge-gray')">{{sel.status==='ACTIVE'?'Активный':'Резерв'}}</span>
              <span :class="'badge '+(sel.faceId?'badge-green':'badge-red')">FaceID {{sel.faceId?'✓':'✕'}}</span>
            </div>
          </div>
        </div>
        <div class="grid-2" style="gap:14px">
          <div><div class="label">Регион</div><div>{{sel.region}}</div></div>
          <div><div class="label">Район</div><div>{{sel.district}}</div></div>
          <div><div class="label">Батальон</div><div>{{sel.battalion}}</div></div>
          <div><div class="label">Телефон</div><div>{{sel.phone}}</div></div>
          <div style="text-align:center"><div class="label">Сессий</div><div style="font-size:26px;font-weight:700;color:var(--brand)">{{sel.sessions}}</div></div>
          <div style="text-align:center"><div class="label">Средний балл</div><div style="font-size:26px;font-weight:700" :style="{color:sel.avg>=75?'var(--brand)':sel.avg>=60?'var(--amber)':'var(--red)'}">{{sel.avg}}</div></div>
        </div>
      </div>
    </div>
  </div>
</div>`
};

// --- SESSIONS ---
const SessionsPage = {
  components: { SvgIcon },
  setup() {
    const s = inject(STORE_KEY);
    return { s, scoreBadge, I };
  },
  template: `
<div>
  <div class="page-header-row" style="margin-bottom:16px">
    <div class="page-header" style="margin:0"><h1>Сессии</h1><p>История стрельб и бронирование дорожек</p></div>
    <button class="btn btn-primary"><span v-html="I.plus" style="width:15px"></span> Новая сессия</button>
  </div>
  <div class="card" style="padding:0;overflow:hidden">
    <table>
      <thead><tr><th>Дата</th><th>Время</th><th>Дорожка</th><th>Сотрудник</th><th>Оружие</th><th>Тип</th><th>Выстр.</th><th>Точн.</th><th>Балл</th></tr></thead>
      <tbody>
        <tr v-for="x in s.sessions" :key="x.id">
          <td>{{x.date}}</td><td>{{x.time}}</td><td>{{x.lane}}</td>
          <td style="font-weight:500">{{x.empName}}</td>
          <td>{{x.weapon}}</td>
          <td><span :class="'badge '+(x.type==='MAIN'?'badge-purple':'badge-blue')">{{x.type}}</span></td>
          <td>{{x.shots}}</td>
          <td>{{x.shots?Math.round(x.hits/x.shots*100):0}}%</td>
          <td><span :class="'badge '+scoreBadge(x.score)"><b>{{x.score}}</b></span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`
};

// --- REPORTS ---
const ReportsPage = {
  components: { SvgIcon },
  setup() {
    const s = inject(STORE_KEY);
    const tab = ref('protocols');
    const signed = computed(()=>s.protocols.filter(p=>p.signed).length);
    const unsigned = computed(()=>s.protocols.filter(p=>!p.signed).length);
    const avg = computed(()=>s.protocols.length?Math.round(s.protocols.reduce((a,p)=>a+p.score,0)/s.protocols.length):0);
    return { s, tab, signed, unsigned, avg, scoreBadge, I };
  },
  template: `
<div>
  <div class="page-header" style="margin-bottom:16px"><h1>Отчёты</h1><p>Протоколы стрельб и аналитика</p></div>
  <div class="stat-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
    <div class="stat-card"><div class="stat-icon" style="background:var(--brand-l)"><span v-html="I.report" style="width:20px;color:var(--brand-d)"></span></div><div><div class="stat-label">Протоколов</div><div class="stat-value">{{s.protocols.length}}</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--brand-l)"><span v-html="I.check" style="width:20px;color:var(--brand-d)"></span></div><div><div class="stat-label">Подписаны</div><div class="stat-value" style="color:var(--brand)">{{signed}}</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--amber-l)"><span v-html="I.bell" style="width:20px;color:var(--amber)"></span></div><div><div class="stat-label">Ожидают</div><div class="stat-value" style="color:var(--amber)">{{unsigned}}</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--blue-l)"><span v-html="I.trending" style="width:20px;color:var(--blue)"></span></div><div><div class="stat-label">Ср. балл</div><div class="stat-value">{{avg}}</div></div></div>
  </div>
  <div class="card" style="padding:0;overflow:hidden">
    <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:14px;font-weight:600">Протоколы стрельб</span>
      <button class="btn btn-secondary btn-sm"><span v-html="I.download" style="width:14px"></span> Экспорт</button>
    </div>
    <table>
      <thead><tr><th>Дата</th><th>Сотрудник</th><th>Оружие</th><th>Выстр.</th><th>Точных</th><th>Балл</th><th>Подпись</th></tr></thead>
      <tbody>
        <tr v-for="p in s.protocols" :key="p.id">
          <td>{{p.date}}</td>
          <td style="font-weight:500">{{(s.empById(p.empId)||{name:'?'}).name}}</td>
          <td>{{p.weapon}}</td><td>{{p.shots}}</td><td>{{p.hits}}</td>
          <td><span :class="'badge '+scoreBadge(p.score)"><b>{{p.score}}</b></span></td>
          <td><span :class="'badge '+(p.signed?'badge-green':'badge-amber')">{{p.signed?'Подписан':'Ожидает'}}</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`
};

// --- SETTINGS ---
const SettingsPage = {
  components: { SvgIcon },
  setup() {
    const s = inject(STORE_KEY);
    const activeTab = ref('general');
    const tabs = [
      { id:'general',  label:'Основные',     icon:'settings' },
      { id:'security', label:'Безопасность',  icon:'shield'   },
      { id:'cameras',  label:'Камеры',        icon:'camera'   },
      { id:'lang',     label:'Язык и регион', icon:'globe'    },
      { id:'api',      label:'API',           icon:'zap'      },
    ];
    function toggle(key) { s.settings[key] = !s.settings[key]; }
    return { s, activeTab, tabs, toggle, I };
  },
  template: `
<div>
  <div class="page-header" style="margin-bottom:16px"><h1>Настройки</h1><p>Конфигурация системы ShaffofTIR</p></div>
  <div class="settings-layout">
    <!-- Left nav -->
    <div class="settings-nav">
      <div v-for="t in tabs" :key="t.id" class="settings-nav-item" :class="{active:activeTab===t.id}" @click="activeTab=t.id">
        <span v-html="I[t.icon]" style="width:16px"></span>
        <span>{{t.label}}</span>
      </div>
      <div style="height:1px;background:var(--border);margin:8px 0"></div>
      <div class="settings-nav-item" style="color:var(--red)" @click="s.toggleTheme()">
        <span v-html="s.theme==='light'?I.moon:I.sun" style="width:16px"></span>
        <span>{{s.theme==='light'?'Тёмная тема':'Светлая тема'}}</span>
      </div>
    </div>

    <!-- Right content -->
    <div>
      <!-- GENERAL -->
      <div v-if="activeTab==='general'" class="settings-section">
        <div style="font-size:15px;font-weight:600;margin-bottom:16px">Основные настройки</div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">3D визуализация мишени</div>
            <div class="settings-row-desc">Показывать попадания в 3D в реальном времени</div>
          </div>
          <div class="toggle" :class="s.settings.vis3d?'on':'off'" @click="toggle('vis3d')">
            <div class="toggle-knob"></div>
          </div>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Уведомления</div>
            <div class="settings-row-desc">Push-уведомления о событиях системы</div>
          </div>
          <div class="toggle" :class="s.settings.notifications?'on':'off'" @click="toggle('notifications')">
            <div class="toggle-knob"></div>
          </div>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Авто-генерация протокола</div>
            <div class="settings-row-desc">Создавать протокол автоматически после сессии</div>
          </div>
          <div class="toggle" :class="s.settings.autoProtocol?'on':'off'" @click="toggle('autoProtocol')">
            <div class="toggle-knob"></div>
          </div>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Часовой пояс</div>
          </div>
          <select class="select" style="width:160px">
            <option>UTC+5 (Ташкент)</option>
            <option>UTC+6</option>
          </select>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Тема оформления</div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm" :class="s.theme==='light'?'btn-primary':'btn-secondary'" @click="s.theme==='dark'&&s.toggleTheme()">Светлая</button>
            <button class="btn btn-sm" :class="s.theme==='dark'?'btn-primary':'btn-secondary'" @click="s.theme==='light'&&s.toggleTheme()">Тёмная</button>
          </div>
        </div>
      </div>

      <!-- SECURITY -->
      <div v-if="activeTab==='security'" class="settings-section">
        <div style="font-size:15px;font-weight:600;margin-bottom:16px">Безопасность</div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Face ID идентификация</div>
            <div class="settings-row-desc">Требовать Face ID для начала сессии</div>
          </div>
          <div class="toggle" :class="s.settings.faceId?'on':'off'" @click="toggle('faceId')">
            <div class="toggle-knob"></div>
          </div>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Автоматический бэкап</div>
            <div class="settings-row-desc">Ежедневное резервное копирование данных</div>
          </div>
          <div class="toggle" :class="s.settings.backupAuto?'on':'off'" @click="toggle('backupAuto')">
            <div class="toggle-knob"></div>
          </div>
        </div>
        <div class="settings-row">
          <div><div class="settings-row-label">Сменить пароль</div></div>
          <button class="btn btn-secondary btn-sm">Сменить</button>
        </div>
        <div class="settings-row">
          <div><div class="settings-row-label">Двухфакторная аутентификация</div></div>
          <button class="btn btn-primary btn-sm">Настроить</button>
        </div>
      </div>

      <!-- CAMERAS -->
      <div v-if="activeTab==='cameras'" class="settings-section">
        <div style="font-size:15px;font-weight:600;margin-bottom:16px">Настройки камер</div>
        <div class="settings-row">
          <div><div class="settings-row-label">Разрешение записи</div></div>
          <select class="select" style="width:160px" v-model="s.settings.cameraRes">
            <option value="1280x720">HD 720p</option>
            <option value="1920x1080">FHD 1080p</option>
            <option value="2560x1440">QHD 1440p</option>
          </select>
        </div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Хранение записей</div>
            <div class="settings-row-desc">Автоматическое удаление старых записей</div>
          </div>
          <select class="select" style="width:160px">
            <option>30 дней</option>
            <option>60 дней</option>
            <option>90 дней</option>
          </select>
        </div>
        <div class="settings-row">
          <div><div class="settings-row-label">Тест подключения камер</div></div>
          <button class="btn btn-secondary btn-sm"><span v-html="I.activity" style="width:14px"></span> Проверить</button>
        </div>
      </div>

      <!-- LANG -->
      <div v-if="activeTab==='lang'" class="settings-section">
        <div style="font-size:15px;font-weight:600;margin-bottom:16px">Язык и регион</div>
        <div class="settings-row">
          <div><div class="settings-row-label">Язык интерфейса</div></div>
          <select class="select" style="width:160px" v-model="s.settings.lang">
            <option value="ru">Русский</option>
            <option value="uz">O'zbekcha</option>
            <option value="kk">Каракалпак</option>
          </select>
        </div>
        <div class="settings-row">
          <div><div class="settings-row-label">Формат даты</div></div>
          <select class="select" style="width:160px">
            <option>ДД.ММ.ГГГГ</option>
            <option>ГГГГ-ММ-ДД</option>
          </select>
        </div>
      </div>

      <!-- API -->
      <div v-if="activeTab==='api'" class="settings-section">
        <div style="font-size:15px;font-weight:600;margin-bottom:16px">API интеграция</div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">API ключ</div>
            <div class="settings-row-desc">Используйте для интеграции с внешними системами</div>
          </div>
          <button class="btn btn-secondary btn-sm">Обновить ключ</button>
        </div>
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-family:monospace;font-size:12px;color:var(--text2);margin-top:8px">
          {{s.settings.apiKey}}
        </div>
        <div class="settings-row" style="margin-top:12px">
          <div>
            <div class="settings-row-label">Webhook URL</div>
          </div>
          <input class="input" style="width:300px" placeholder="https://your-server.com/webhook">
        </div>
      </div>
    </div>
  </div>
</div>`
};

// --- HELP ---
const HelpPage = {
  components: { SvgIcon },
  setup() { return { I }; },
  template: `
<div>
  <div class="page-header" style="margin-bottom:16px"><h1>Помощь</h1><p>Инструкции и документация системы</p></div>
  <div class="grid-2">
    <div class="card"><div class="card-title">Как создать сессию?</div><p style="font-size:13px;color:var(--text2)">Перейдите в Сессии → Новая сессия, выберите сотрудника, дорожку и оружие.</p></div>
    <div class="card"><div class="card-title">Балловая система</div><p style="font-size:13px;color:var(--text2)">Балл = (Точных / Всего) × 100 × коэф. оружия. EXPERT ≥90, ADVANCED ≥75.</p></div>
    <div class="card"><div class="card-title">FaceID регистрация</div><p style="font-size:13px;color:var(--text2)">HR → Сотрудники → выберите → FaceID → Сканировать. Требуется для начала сессии.</p></div>
    <div class="card"><div class="card-title">Протоколы</div><p style="font-size:13px;color:var(--text2)">Отчёты → Протоколы. Подпись инструктора подтверждает официальные результаты.</p></div>
  </div>
  <div class="card" style="margin-top:12px;text-align:center">
    <a href="./docs.html" target="_blank" class="btn btn-primary" style="display:inline-flex">
      <span v-html="I.report" style="width:15px"></span> Открыть полную документацию
    </a>
  </div>
</div>`
};

// --- PROFILE ---
const ProfilePage = {
  components: { SvgIcon },
  setup() { const s=inject(STORE_KEY); return {s}; },
  template: `
<div style="max-width:560px">
  <div class="page-header" style="margin-bottom:16px"><h1>Профиль</h1></div>
  <div class="card" style="margin-bottom:14px">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
      <div class="avatar" style="width:56px;height:56px;font-size:22px">{{s.user?.name?.[0]}}</div>
      <div>
        <div style="font-size:18px;font-weight:700">{{s.user?.name}}</div>
        <div style="font-size:13px;color:var(--text2)">{{s.user?.email}}</div>
        <div style="margin-top:6px;display:flex;gap:6px">
          <span :class="'badge '+(s.user?.role==='MANAGER'?'badge-purple':s.user?.role==='INSTRUCTOR'?'badge-blue':'badge-green')">{{s.user?.role}}</span>
          <span class="badge badge-gray">{{s.user?.rank}}</span>
        </div>
      </div>
    </div>
    <div class="grid-2">
      <div><div class="label">Email</div><div>{{s.user?.email}}</div></div>
      <div><div class="label">Звание</div><div>{{s.user?.rank}}</div></div>
      <div><div class="label">Роль</div><div>{{s.user?.role}}</div></div>
    </div>
  </div>
</div>`
};

// ────────────────────────────────────────────────────────────
// APP LAYOUT
// ────────────────────────────────────────────────────────────
const AppLayout = {
  components: { SvgIcon },
  setup() {
    const s = inject(STORE_KEY);
    const router = useRouter();
    const route = useRoute();
    const showNotif = ref(false);
    const showProfile = ref(false);
    const q = ref('');

    const menu = [
      { section:'ОСНОВНОЕ', items:[
        { id:'dashboard', label:'Панель',       icon:'dashboard', path:'/dashboard' },
        { id:'range',     label:'ТИР',           icon:'tir',       path:'/range' },
        { id:'sessions',  label:'Сессии',        icon:'sessions',  path:'/sessions' },
      ]},
      { section:'КАДРЫ', items:[
        { id:'employees', label:'Сотрудники',    icon:'users',     path:'/employees' },
      ]},
      { section:'СТРЕЛЬБА', items:[
        { id:'cameras',  label:'Камеры',         icon:'camera',    path:'/cameras' },
        { id:'compare',  label:'Сравнение',      icon:'compare',   path:'/compare' },
      ]},
      { section:'ОТЧЁТЫ', items:[
        { id:'reports',  label:'Отчёты',         icon:'report',    path:'/reports' },
      ]},
      { section:'СИСТЕМА', items:[
        { id:'settings', label:'Настройки',      icon:'settings',  path:'/settings' },
        { id:'help',     label:'Помощь',         icon:'help',      path:'/help' },
      ]},
    ];

    const filteredMenu = computed(()=>menu.map(sec=>({
      ...sec,
      items: sec.items.filter(item=>s.canAccess(item.id))
    })).filter(sec=>sec.items.length));

    const pageTitle = computed(()=>{
      for(const sec of menu) for(const item of sec.items) if(route.path.startsWith(item.path)) return item.label;
      return 'ShaffofTIR';
    });

    function logout() { s.logout(); router.push('/login'); }

    return { s, route, filteredMenu, pageTitle, showNotif, showProfile, q, logout, I };
  },
  template: `
<div class="app">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-mark"><span v-html="I.target" style="width:16px;height:16px;color:#fff"></span></div>
      <div class="logo-name">Shaffof<span>TIR</span></div>
    </div>
    <div v-for="sec in filteredMenu" :key="sec.section">
      <div class="nav-section">{{sec.section}}</div>
      <div v-for="item in sec.items" :key="item.id"
        class="nav-item" :class="{active:route.path.startsWith(item.path)}"
        @click="$router.push(item.path)">
        <span v-html="I[item.icon]" style="width:16px;height:16px;flex-shrink:0"></span>
        <span>{{item.label}}</span>
        <span v-if="item.id==='cameras'&&s.cameras.filter(c=>c.status==='offline').length" class="badge-count">
          {{s.cameras.filter(c=>c.status==='offline').length}}
        </span>
      </div>
    </div>
    <div class="sidebar-footer">
      <div class="user-card" @click="$router.push('/profile')">
        <div class="avatar" style="width:30px;height:30px;font-size:12px">{{s.user?.name?.[0]}}</div>
        <div class="user-info" style="min-width:0;flex:1">
          <div style="font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{s.user?.name}}</div>
          <div style="font-size:11px;color:var(--text3)">{{s.user?.role}}</div>
        </div>
      </div>
    </div>
  </aside>

  <!-- Main -->
  <div class="main-area">
    <header class="topbar">
      <div class="topbar-search">
        <span v-html="I.search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:15px;color:var(--text3)"></span>
        <input v-model="q" placeholder="Поиск...">
      </div>
      <div class="topbar-right">
        <!-- Theme toggle -->
        <button class="btn btn-ghost btn-icon" @click="s.toggleTheme()" :title="s.theme==='light'?'Тёмная тема':'Светлая тема'">
          <span v-html="s.theme==='light'?I.moon:I.sun" style="width:16px"></span>
        </button>
        <!-- Notifications -->
        <div style="position:relative">
          <button class="btn btn-ghost btn-icon" style="position:relative" @click="showNotif=!showNotif;showProfile=false">
            <span v-html="I.bell" style="width:16px"></span>
            <span v-if="s.unread>0" style="position:absolute;top:4px;right:4px;width:8px;height:8px;border-radius:50%;background:var(--red)"></span>
          </button>
          <div v-if="showNotif" style="position:absolute;top:calc(100% + 4px);right:0;width:320px;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-lg);z-index:200">
            <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:600;font-size:14px">Уведомления</span>
              <button class="btn btn-ghost btn-sm" @click="s.markAllRead()">Всё прочитано</button>
            </div>
            <div v-for="n in s.notifications" :key="n.id" style="padding:10px 16px;border-bottom:1px solid var(--border);cursor:pointer" :style="{background:n.read?'':'var(--brand-ll)'}">
              <div style="display:flex;gap:8px;align-items:flex-start">
                <div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px"
                  :style="{background:n.type==='success'?'var(--brand)':n.type==='error'?'var(--red)':n.type==='warning'?'var(--amber)':'var(--blue)'}"></div>
                <div>
                  <div style="font-size:13px;font-weight:500">{{n.title}}</div>
                  <div style="font-size:12px;color:var(--text2)">{{n.desc}}</div>
                  <div style="font-size:11px;color:var(--text3);margin-top:3px">{{n.time}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- User -->
        <div style="position:relative">
          <div style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:6px 10px;border-radius:8px;transition:background var(--transition)"
            @click="showProfile=!showProfile;showNotif=false" :class="{'':true}">
            <span style="font-size:12px;color:var(--text2)">{{s.user?.rank}}</span>
            <div class="avatar" style="width:30px;height:30px;font-size:12px">{{s.user?.name?.[0]}}</div>
            <span style="font-size:13px;font-weight:500">{{s.user?.name}}</span>
          </div>
          <div v-if="showProfile" style="position:absolute;top:calc(100% + 4px);right:0;background:var(--surface);border:1px solid var(--border);border-radius:10px;min-width:180px;box-shadow:var(--shadow-lg);z-index:200;overflow:hidden">
            <div class="settings-nav-item" @click="$router.push('/profile');showProfile=false">
              <span v-html="I.user" style="width:15px"></span> Профиль
            </div>
            <div class="settings-nav-item" @click="$router.push('/settings');showProfile=false">
              <span v-html="I.settings" style="width:15px"></span> Настройки
            </div>
            <div style="height:1px;background:var(--border);margin:4px 0"></div>
            <div class="settings-nav-item" style="color:var(--red)" @click="logout">
              <span v-html="I.logout" style="width:15px"></span> Выйти
            </div>
          </div>
        </div>
      </div>
    </header>
    <div class="page-wrap" @click="showNotif=false;showProfile=false">
      <router-view/>
    </div>
  </div>
</div>`
};

// ────────────────────────────────────────────────────────────
// ROUTER
// ────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path:'/', redirect:'/dashboard' },
    { path:'/login', component: LoginPage },
    {
      path:'/',
      component: AppLayout,
      children: [
        { path:'dashboard',  component: DashboardPage },
        { path:'range',      component: RangePage },
        { path:'sessions',   component: SessionsPage },
        { path:'employees',  component: EmployeesPage },
        { path:'cameras',    component: CamerasPage },
        { path:'compare',    component: ComparePage },
        { path:'reports',    component: ReportsPage },
        { path:'settings',   component: SettingsPage },
        { path:'help',       component: HelpPage },
        { path:'profile',    component: ProfilePage },
      ]
    },
    { path:'/:any(.*)*', redirect:'/dashboard' },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, from, next) => {
  if (to.path === '/login') { next(); return; }
  if (!store.isAuth) { next('/login'); return; }
  const page = to.path.split('/')[1];
  if (page && !store.canAccess(page)) { next('/dashboard'); return; }
  next();
});

// ────────────────────────────────────────────────────────────
// MOUNT
// ────────────────────────────────────────────────────────────
const app = createApp({
  setup() { provide(STORE_KEY, store); },
  template: '<router-view/>',
});
app.use(router);
app.mount('#app');
