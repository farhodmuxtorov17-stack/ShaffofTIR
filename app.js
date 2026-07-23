// ShaffofTIR v2 — полная переработка по 9 пунктам Фархода
const { createApp, ref, computed, reactive, watch, onMounted, h, defineComponent } = Vue;
const { createPinia, defineStore } = Pinia;
const { createRouter, createWebHashHistory, useRouter, useRoute } = VueRouter;

// ─── ICONS (inline SVG) ───────────────────────────────────
const I = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
  sessions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 3 5 4-9"/></svg>',
  report: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  weapon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h18M5 7v4l2 2h12l2-2V7M7 13v4a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6"/><line x1="8" y1="3" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="21"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
};

const ico = (name, cls = 'w-5 h-5') => {
  const svg = I[name] || '';
  return Vue.h('span', { class: 'inline-flex', innerHTML: svg, style: 'display:inline-flex' });
};

// ─── DATA ─────────────────────────────────────────────────
const regions = ['Toshkent shahri', 'Toshkent viloyati', 'Samarqand viloyati', 'Farg\'ona viloyati', 'Andijon viloyati', 'Buxoro viloyati'];
const districts = {
  'Toshkent shahri': ['Mirobod tumani', 'Yunusobod tumani', 'Chilonzor tumani', 'Sergeli tumani'],
  'Toshkent viloyati': ['Qibray tumani', 'Yuqorichirchiq tumani', 'Oqqo\'rg\'on tumani', 'Bo\'ka tumani'],
  'Samarqand viloyati': ['Samarqand tumani', 'Payariq tumani', 'Urgut tumani'],
  'Farg\'ona viloyati': ['Farg\'ona tumani', 'Marg\'ilon tumani', 'Qo\'qon tumani'],
  'Andijon viloyati': ['Andijon tumani', 'Xo\'jaobod tumani', 'Asaka tumani'],
  'Buxoro viloyati': ['Buxoro tumani', 'G\'ijduvon tumani', 'Kogon tumani'],
};
const battalions = ['1-motoo\'chi batalon', '2-motoo\'chi batalon', '3-motoo\'chi batalon', 'Maxsus batalon', 'Shtab'];

const employees = [
  { id:'e01', name:'Aliyev Baxtiyor Ubaydullayevich', rank:'Kapitan', position:'Vzvod komandiri', region:'Toshkent viloyati', district:'Yuqorichirchiq tumani', battalion:'1-motoo\'chi batalon', phone:'+998901112233', status:'ACTIVE', qualification:'EXPERT', sessions:24, avgScore:78, lastShoot:'2026-07-22', faceId:true },
  { id:'e02', name:'Rahimov Jasur Toshpulatovich', rank:'Leytenant', position:'Bo\'lim komandiri', region:'Toshkent viloyati', district:'Yuqorichirchiq tumani', battalion:'1-motoo\'chi batalon', phone:'+998902223344', status:'ACTIVE', qualification:'INTERMEDIATE', sessions:18, avgScore:71, lastShoot:'2026-07-20', faceId:true },
  { id:'e03', name:'Yo\'ldashev Dilshod Abdulajonovich', rank:'Serjant', position:'O\'qchi', region:'Toshkent viloyati', district:'Yuqorichirchiq tumani', battalion:'1-motoo\'chi batalon', phone:'+998903334455', status:'ACTIVE', qualification:'EXPERT', sessions:32, avgScore:85, lastShoot:'2026-07-22', faceId:true },
  { id:'e04', name:'Hasanov Otabek Rustamovich', rank:'Oddiy askar', position:'O\'qchi', region:'Toshkent viloyati', district:'Yuqorichirchiq tumani', battalion:'1-motoo\'chi batalon', phone:'+998904445566', status:'ACTIVE', qualification:'BEGINNER', sessions:4, avgScore:48, lastShoot:'2026-07-15', faceId:false },
  { id:'e05', name:'Maxmudov Sardor Baxtiyorovich', rank:'St. serjant', position:'Vzvod komandiri o\'rinbosari', region:'Toshkent viloyati', district:'Yuqorichirchiq tumani', battalion:'1-motoo\'chi batalon', phone:'+998905556677', status:'ACTIVE', qualification:'EXPERT', sessions:45, avgScore:91, lastShoot:'2026-07-22', faceId:true },
  { id:'e06', name:'Karimov Aziz Ulug\'bekovich', rank:'Yefreytor', position:'Snayper o\'qchi', region:'Toshkent viloyati', district:'Qibray tumani', battalion:'2-motoo\'chi batalon', phone:'+998906667788', status:'ACTIVE', qualification:'EXPERT', sessions:38, avgScore:88, lastShoot:'2026-07-22', faceId:true },
  { id:'e07', name:'Ergashev Bekzod Tursunovich', rank:'Oddiy askar', position:'O\'qchi', region:'Toshkent viloyati', district:'Qibray tumani', battalion:'2-motoo\'chi batalon', phone:'+998907778899', status:'RESERVE', qualification:'BEGINNER', sessions:1, avgScore:38, lastShoot:'2026-05-15', faceId:false },
  { id:'e08', name:'Toshmatov Firdavs Sherzodovich', rank:'Starshina', position:'Katta instruktor', region:'Toshkent shahri', district:'Mirobod tumani', battalion:'Shtab', phone:'+998908889900', status:'ACTIVE', qualification:'EXPERT', sessions:120, avgScore:95, lastShoot:'2026-07-21', faceId:true },
  { id:'e09', name:'Normatov Jamshid Anvarovich', rank:'Serjant', position:'O\'qchi', region:'Toshkent viloyati', district:'Qibray tumani', battalion:'2-motoo\'chi batalon', phone:'+998911223344', status:'ACTIVE', qualification:'INTERMEDIATE', sessions:16, avgScore:68, lastShoot:'2026-07-18', faceId:true },
  { id:'e10', name:'Umarov Sherzod Baxtiyorovich', rank:'Oddiy askar', position:'O\'qchi', region:'Toshkent viloyati', district:'Qibray tumani', battalion:'2-motoo\'chi batalon', phone:'+998912233455', status:'ACTIVE', qualification:'BEGINNER', sessions:6, avgScore:52, lastShoot:'2026-07-14', faceId:true },
  { id:'e11', name:'Qodirov Ulug\'bek Toshpulatovich', rank:'St. leytenant', position:'Vzvod komandiri', region:'Samarqand viloyati', district:'Samarqand tumani', battalion:'3-motoo\'chi batalon', phone:'+998913344566', status:'ACTIVE', qualification:'ADVANCED', sessions:28, avgScore:80, lastShoot:'2026-07-19', faceId:true },
  { id:'e12', name:'Sobirov Baxrom Islomovich', rank:'Serjant', position:'O\'qchi', region:'Samarqand viloyati', district:'Samarqand tumani', battalion:'3-motoo\'chi batalon', phone:'+998914455678', status:'ACTIVE', qualification:'INTERMEDIATE', sessions:14, avgScore:65, lastShoot:'2026-07-16', faceId:true },
  { id:'e13', name:'Rahmonov Islom Jamolovich', rank:'Oddiy askar', position:'O\'qchi', region:'Samarqand viloyati', district:'Samarqand tumani', battalion:'3-motoo\'chi batalon', phone:'+998915556789', status:'ACTIVE', qualification:'BEGINNER', sessions:3, avgScore:42, lastShoot:'2026-07-10', faceId:false },
  { id:'e14', name:'Yo\'lchiyev Akmal Salomovich', rank:'Leytenant', position:'Bo\'lim komandiri', region:'Farg\'ona viloyati', district:'Farg\'ona tumani', battalion:'Maxsus batalon', phone:'+998916667890', status:'ACTIVE', qualification:'ADVANCED', sessions:22, avgScore:76, lastShoot:'2026-07-17', faceId:true },
  { id:'e15', name:'Abdullayev Shuhrat To\'xtamovich', rank:'Serjant', position:'O\'qchi', region:'Farg\'ona viloyati', district:'Farg\'ona tumani', battalion:'Maxsus batalon', phone:'+998917778901', status:'ACTIVE', qualification:'INTERMEDIATE', sessions:15, avgScore:63, lastShoot:'2026-07-12', faceId:true },
  { id:'e16', name:'Boltayev Dilshod Maxmudovich', rank:'Oddiy askar', position:'O\'qchi', region:'Andijon viloyati', district:'Andijon tumani', battalion:'2-motoo\'chi batalon', phone:'+998918889012', status:'RESERVE', qualification:'BEGINNER', sessions:2, avgScore:35, lastShoot:'2026-04-20', faceId:false },
  { id:'e17', name:'Qosimov Farrux Nizomovich', rank:'Kapitan', position:'Rota komandiri', region:'Andijon viloyati', district:'Andijon tumani', battalion:'2-motoo\'chi batalon', phone:'+998919990123', status:'ACTIVE', qualification:'EXPERT', sessions:50, avgScore:89, lastShoot:'2026-07-21', faceId:true },
  { id:'e18', name:'Sodiqov Bahodir Karimovich', rank:'St. serjant', position:'Mashg\'ulot o\'qutuvchisi', region:'Buxoro viloyati', district:'Buxoro tumani', battalion:'Maxsus batalon', phone:'+998920001234', status:'ACTIVE', qualification:'EXPERT', sessions:35, avgScore:82, lastShoot:'2026-07-20', faceId:true },
  { id:'e19', name:'Yo\'ldosheva Madina Akramovna', rank:'Leytenant', position:'Instruktor', region:'Toshkent shahri', district:'Yunusobod tumani', battalion:'Shtab', phone:'+998921112345', status:'ACTIVE', qualification:'ADVANCED', sessions:19, avgScore:74, lastShoot:'2026-07-19', faceId:true },
  { id:'e20', name:'Tursunov Oybek Rahimovich', rank:'Serjant', position:'O\'qchi', region:'Toshkent shahri', district:'Chilonzor tumani', battalion:'1-motoo\'chi batalon', phone:'+998922223456', status:'ACTIVE', qualification:'INTERMEDIATE', sessions:12, avgScore:66, lastShoot:'2026-07-13', faceId:true },
];

const weapons = [
  { id:'w01', name:'AK-74', type:'Avtomat', caliber:'5.45mm', status:'ACTIVE', totalShots:3200 },
  { id:'w02', name:'AK-74M', type:'Avtomat', caliber:'5.45mm', status:'ACTIVE', totalShots:2800 },
  { id:'w03', name:'SVD Dragunov', type:'Snayper', caliber:'7.62mm', status:'ACTIVE', totalShots:1500 },
  { id:'w04', name:'Makarov PM', type:'Pistolet', caliber:'9mm', status:'ACTIVE', totalShots:1800 },
  { id:'w05', name:'PKM', type:'Pulemyot', caliber:'7.62mm', status:'MAINTENANCE', totalShots:4500 },
  { id:'w06', name:'AK-74U', type:'Avtomat', caliber:'5.45mm', status:'ACTIVE', totalShots:2100 },
];

const sessions = [
  { id:'s01', employee:'e03', employeeName:'Yo\'ldashev Dilshod', date:'2026-07-22', time:'09:00', lane:'Yo\'lak 1', weapon:'AK-74', shots:10, hits:8, score:85, status:'completed', type:'MAIN' },
  { id:'s02', employee:'e01', employeeName:'Aliyev Baxtiyor', date:'2026-07-22', time:'10:30', lane:'Yo\'lak 2', weapon:'SVD Dragunov', shots:5, hits:4, score:78, status:'completed', type:'TEST' },
  { id:'s03', employee:'e06', employeeName:'Karimov Aziz', date:'2026-07-22', time:'11:00', lane:'Yo\'lak 1', weapon:'AK-74M', shots:10, hits:9, score:88, status:'completed', type:'MAIN' },
  { id:'s04', employee:'e05', employeeName:'Maxmudov Sardor', date:'2026-07-22', time:'14:00', lane:'Yo\'lak 3', weapon:'AK-74', shots:10, hits:9, score:91, status:'completed', type:'MAIN' },
  { id:'s05', employee:'e08', employeeName:'Toshmatov Firdavs', date:'2026-07-22', time:'15:00', lane:'Yo\'lak 1', weapon:'PKM', shots:20, hits:19, score:95, status:'completed', type:'MAIN' },
  { id:'s06', employee:'e11', employeeName:'Qodirov Ulug\'bek', date:'2026-07-21', time:'09:30', lane:'Yo\'lak 2', weapon:'AK-74', shots:10, hits:8, score:80, status:'completed', type:'MAIN' },
  { id:'s07', employee:'e17', employeeName:'Qosimov Farrux', date:'2026-07-21', time:'11:00', lane:'Yo\'lak 3', weapon:'AK-74M', shots:10, hits:9, score:89, status:'completed', type:'MAIN' },
  { id:'s08', employee:'e18', employeeName:'Sodiqov Bahodir', date:'2026-07-21', time:'14:00', lane:'Yo\'lak 1', weapon:'SVD Dragunov', shots:5, hits:4, score:82, status:'completed', type:'TEST' },
  { id:'s09', employee:'e03', employeeName:'Yo\'ldashev Dilshod', date:'2026-07-20', time:'10:00', lane:'Yo\'lak 2', weapon:'AK-74', shots:10, hits:7, score:70, status:'completed', type:'MAIN' },
  { id:'s10', employee:'e02', employeeName:'Rahimov Jasur', date:'2026-07-20', time:'11:30', lane:'Yo\'lak 1', weapon:'AK-74U', shots:10, hits:7, score:71, status:'completed', type:'MAIN' },
  { id:'s11', employee:'e01', employeeName:'Aliyev Baxtiyor', date:'2026-07-19', time:'09:00', lane:'Yo\'lak 3', weapon:'AK-74', shots:10, hits:7, score:75, status:'completed', type:'TEST' },
  { id:'s12', employee:'e08', employeeName:'Toshmatov Firdavs', date:'2026-07-19', time:'14:00', lane:'Yo\'lak 1', weapon:'PKM', shots:20, hits:18, score:93, status:'completed', type:'MAIN' },
  { id:'s13', employee:'e17', employeeName:'Qosimov Farrux', date:'2026-07-18', time:'10:00', lane:'Yo\'lak 2', weapon:'AK-74M', shots:10, hits:8, score:85, status:'completed', type:'MAIN' },
  { id:'s14', employee:'e09', employeeName:'Normatov Jamshid', date:'2026-07-18', time:'15:00', lane:'Yo\'lak 1', weapon:'AK-74', shots:10, hits:6, score:68, status:'completed', type:'MAIN' },
  { id:'s15', employee:'e14', employeeName:'Yo\'lchiyev Akmal', date:'2026-07-17', time:'11:00', lane:'Yo\'lak 3', weapon:'Makarov PM', shots:5, hits:3, score:76, status:'completed', type:'TEST' },
];

// So'rovlar (booking requests) — теперь часть Sessiya
const bookings = [
  { id:'b01', employee:'e03', employeeName:'Yo\'ldashev Dilshod', date:'2026-07-24', time:'15:00', lane:'Yo\'lak 1', status:'approved', weapon:'AK-74', type:'MAIN' },
  { id:'b02', employee:'e11', employeeName:'Qodirov Ulug\'bek', date:'2026-07-24', time:'09:00', lane:'Yo\'lak 2', status:'approved', weapon:'SVD Dragunov', type:'TEST' },
  { id:'b03', employee:'e05', employeeName:'Maxmudov Sardor', date:'2026-07-24', time:'11:00', lane:'Yo\'lak 1', status:'pending', weapon:'AK-74', type:'MAIN' },
  { id:'b04', employee:'e08', employeeName:'Toshmatov Firdavs', date:'2026-07-25', time:'14:00', lane:'Yo\'lak 3', status:'pending', weapon:'PKM', type:'MAIN' },
  { id:'b05', employee:'e17', employeeName:'Qosimov Farrux', date:'2026-07-25', time:'10:00', lane:'Yo\'lak 1', status:'approved', weapon:'AK-74M', type:'MAIN' },
  { id:'b06', employee:'e06', employeeName:'Karimov Aziz', date:'2026-07-24', time:'15:00', lane:'Yo\'lak 2', status:'pending', weapon:'AK-74U', type:'TEST' },
];

const protocols = [
  { id:'p01', session:'s01', employee:'e03', date:'2026-07-22', weapon:'AK-74', shots:10, hits:8, score:85, signed:true },
  { id:'p02', session:'s02', employee:'e01', date:'2026-07-22', weapon:'SVD Dragunov', shots:5, hits:4, score:78, signed:true },
  { id:'p03', session:'s03', employee:'e06', date:'2026-07-22', weapon:'AK-74M', shots:10, hits:9, score:88, signed:true },
  { id:'p04', session:'s04', employee:'e05', date:'2026-07-22', weapon:'AK-74', shots:10, hits:9, score:91, signed:false },
  { id:'p05', session:'s05', employee:'e08', date:'2026-07-22', weapon:'PKM', shots:20, hits:19, score:95, signed:true },
  { id:'p06', session:'s06', employee:'e11', date:'2026-07-21', weapon:'AK-74', shots:10, hits:8, score:80, signed:true },
];

const trainingPlans = [
  { id:'t01', title:'1-dars: Otish tayyorgarligi asoslari', desc:'O\'q otish texnikasi, turmush holati, nishonga olish', duration:'2 soat', level:'BEGINNER', lessons:5, image:'📚', video:true, status:'active' },
  { id:'t02', title:'2-dars: Turli pozitsiyalardan otish', desc:'Yotgan, turgan, o\'tirgan holatda otish mashqi', duration:'3 soat', level:'INTERMEDIATE', lessons:6, image:'🎯', video:true, status:'active' },
  { id:'t03', title:'3-dars: Harakatdagi nishonga olish', desc:'Yurish va yugurishdan keyin otish', duration:'2.5 soat', level:'ADVANCED', lessons:4, image:'🏃', video:true, status:'active' },
  { id:'t04', title:'4-dars: Snayper otish texnikasi', desc:'Uzoq masofaga aniq otish', duration:'4 soat', level:'EXPERT', lessons:8, image:'🔭', video:false, status:'active' },
  { id:'t05', title:'5-dars: Tezkor otish (rapid fire)', desc:'Qisqa vaqtda ko\'p o\'q otish', duration:'2 soat', level:'ADVANCED', lessons:5, image:'⚡', video:true, status:'active' },
];

const trainingAssignments = [
  { id:'ta01', employee:'e04', plan:'t01', planTitle:'1-dars: Otish tayyorgarligi asoslari', progress:45, status:'in-progress', lane:'Yo\'lak 1', startedAt:'2026-07-23T09:00' },
  { id:'ta02', employee:'e07', plan:'t01', planTitle:'1-dars: Otish tayyorgarligi asoslari', progress:20, status:'in-progress', lane:'Yo\'lak 2', startedAt:'2026-07-23T10:30' },
  { id:'ta03', employee:'e13', plan:'t02', planTitle:'2-dars: Turli pozitsiyalardan otish', progress:60, status:'in-progress', lane:'Yo\'lak 3', startedAt:'2026-07-23T11:00' },
  { id:'ta04', employee:'e10', plan:'t01', planTitle:'1-dars: Otish tayyorgarligi asoslari', progress:100, status:'completed', lane:null, startedAt:'2026-07-22T14:00' },
  { id:'ta05', employee:'e15', plan:'t03', planTitle:'3-dars: Harakatdagi nishonga olish', progress:30, status:'in-progress', lane:'Yo\'lak 2', startedAt:'2026-07-23T14:00' },
];

const cameras = [
  { id:'c01', name:'Yo\'lak 1 — Kamera A', ip:'192.168.1.64', location:'Yo\'lak 1', status:'online', resolution:'1280x720', type:'IP Camera' },
  { id:'c02', name:'Yo\'lak 1 — Kamera B', ip:'192.168.1.65', location:'Yo\'lak 1', status:'online', resolution:'1280x720', type:'IP Camera' },
  { id:'c03', name:'Yo\'lak 2 — Kamera A', ip:'192.168.1.66', location:'Yo\'lak 2', status:'online', resolution:'1280x720', type:'IP Camera' },
  { id:'c04', name:'Yo\'lak 2 — Kamera B', ip:'192.168.1.67', location:'Yo\'lak 2', status:'offline', resolution:'1280x720', type:'IP Camera' },
  { id:'c05', name:'Yo\'lak 3 — Kamera A', ip:'192.168.1.68', location:'Yo\'lak 3', status:'online', resolution:'1920x1080', type:'IP Camera' },
  { id:'c06', name:'Yo\'lak 3 — Kamera B', ip:'192.168.1.69', location:'Yo\'lak 3', status:'online', resolution:'1920x1080', type:'IP Camera' },
  { id:'c07', name:'Boshqaruv xonasi', ip:'192.168.1.70', location:'Boshqaruv xonasi', status:'online', resolution:'1920x1080', type:'PTZ Camera' },
  { id:'c08', name:'Omborxona', ip:'192.168.1.71', location:'Omborxona', status:'offline', resolution:'1280x720', type:'IP Camera' },
  { id:'c09', name:'Qurol-xona', ip:'192.168.1.72', location:'Qurol-xona', status:'online', resolution:'1920x1080', type:'IP Camera' },
];

const notifications = [
  { id:'n01', title:'Yangi so\'rov kelib tushdi', desc:'Maxmudov Sardor yo\'lak 1 ni 11:00 ga band qildi', time:'5 daqiqa oldin', type:'info', read:false },
  { id:'n02', title:'Sessiya yakunlandi', desc:'Yo\'ldashev Dilshod — 85 ball', time:'1 soat oldin', type:'success', read:false },
  { id:'n03', title:'Protokol imzolanmagan', desc:'Maxmudov Sardor protsoli kutilmoqda', time:'2 soat oldin', type:'warning', read:false },
  { id:'n04', title:'Kamera offline', desc:'Yo\'lak 2 — Kamera B ishlamayapti', time:'3 soat oldin', type:'error', read:true },
  { id:'n05', title:'Yangi xodim qo\'shildi', desc:'Tursunov Oybek ro\'yxatga olindi', time:'1 kun oldin', type:'info', read:true },
];

// ─── STORES ────────────────────────────────────────────────
const useAuth = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  try { const s = localStorage.getItem('shaffoftir_auth'); if (s) { const d = JSON.parse(s); user.value = d.user; token.value = d.token; } } catch(e) {}
  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const roleLabels = { MANAGER:'Rahbar', INSTRUCTOR:'Instruktor', EMPLOYEE:'Xodim' };

  const users = [
    { email:'manager@shaffoftir.uz', password:'manager123', name:'Teshaboyev Jasur', role:'MANAGER', rank:'Polkovnik' },
    { email:'instructor@shaffoftir.uz', password:'inst123', name:'Karimov Baxtiyor', role:'INSTRUCTOR', rank:'Mayor' },
    { email:'employee@shaffoftir.uz', password:'emp123', name:'Ergashev Sherzod', role:'EMPLOYEE', rank:'Serjant' },
  ];

  const accessMap = {
    MANAGER: ['dashboard','sessions','employees','training','cameras','reports','settings','profile'],
    INSTRUCTOR: ['dashboard','sessions','employees','training','cameras','reports','settings','profile'],
    EMPLOYEE: ['sessions','training','profile'],
  };

  function login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const u = users.find(u => u.email === email && u.password === password);
        if (!u) { reject(new Error('Noto\'g\'ri email yoki parol')); return; }
        user.value = { email: u.email, name: u.name, role: u.role, rank: u.rank };
        token.value = `token_${Date.now()}`;
        localStorage.setItem('shaffoftir_auth', JSON.stringify({ user: user.value, token: token.value }));
        resolve();
      }, 500);
    });
  }

  function logout() { user.value = null; token.value = null; localStorage.removeItem('shaffoftir_auth'); }
  function canAccess(page) {
    if (!user.value) return false;
    const pages = accessMap[user.value.role] || [];
    return pages.includes(page);
  }

  return { user, token, isAuthenticated, roleLabels, login, logout, canAccess };
});

const useData = defineStore('data', () => {
  const emp = ref(employees);
  const sess = ref(sessions);
  const book = ref(bookings);
  const proto = ref(protocols);
  const train = ref(trainingPlans);
  const assign = ref(trainingAssignments);
  const cams = ref(cameras);
  const notifs = ref(notifications);

  function addBooking(data) {
    // Проверка конфликта: тот же yo'lak, та же дата, пересечение времени
    const conflict = book.value.find(b => b.date === data.date && b.lane === data.lane && b.time === data.time && b.status !== 'rejected');
    if (conflict) return { error: `${data.lane} ${data.date} ${data.time} band qilingan. Iltimos boshqa vaqt tanlang.` };
    const id = 'b' + String(book.value.length + 1).padStart(2, '0');
    const booking = { id, ...data, status: 'pending' };
    book.value.push(booking);
    return { success: true, booking };
  }

  function approveBooking(id) { const b = book.value.find(x => x.id === id); if (b) b.status = 'approved'; }
  function rejectBooking(id) { const b = book.value.find(x => x.id === id); if (b) b.status = 'rejected'; }
  function markNotifRead(id) { const n = notifs.value.find(x => x.id === id); if (n) n.read = true; }
  function markAllRead() { notifs.value.forEach(n => n.read = true); }

  const unreadCount = computed(() => notifs.value.filter(n => !n.read).length);

  return { emp, sess, book, proto, train, assign, cams, notifs, addBooking, approveBooking, rejectBooking, markNotifRead, markAllRead, unreadCount };
});

// ─── COMPONENTS ────────────────────────────────────────────

// Login
const LoginPage = defineComponent({
  setup() {
    const auth = useAuth();
    const router = useRouter();
    const email = ref(''); const password = ref(''); const loading = ref(false); const error = ref(null);
    async function submit() {
      loading.value = true; error.value = null;
      try { await auth.login(email.value, password.value); router.push('/dashboard'); }
      catch(e) { error.value = e.message; }
      finally { loading.value = false; }
    }
    return { email, password, loading, error, submit };
  },
  template: `
  <div class="login-wrap">
    <div class="login-card">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
        <span v-html="I.target" style="color:var(--brand);width:32px;height:32px;display:inline-flex"></span>
        <span style="font-size:18px;font-weight:700">ShaffofTIR</span>
      </div>
      <div class="login-title">Tizimga kirish</div>
      <div class="login-sub">TIR Axborot Tizimi — Ochiq identifikatsiya</div>
      <form @submit.prevent="submit" style="display:flex;flex-direction:column;gap:16px">
        <div><label class="label">Email</label><input class="input" v-model="email" type="email" placeholder="manager@shaffoftir.uz" required></div>
        <div><label class="label">Parol</label><input class="input" v-model="password" type="password" placeholder="••••••••" required></div>
        <div v-if="error" style="color:var(--red);font-size:13px">{{ error }}</div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;padding:10px" :disabled="loading">
          {{ loading ? 'Kirilmoqda...' : 'Kirish' }}
        </button>
      </form>
      <div style="margin-top:20px;padding:12px;background:var(--surface2);border-radius:8px;font-size:12px;color:var(--text3);line-height:1.6">
        <b>Demo:</b><br>manager@shaffoftir.uz / manager123<br>instructor@shaffoftir.uz / inst123<br>employee@shaffoftir.uz / emp123
      </div>
    </div>
  </div>`,
  data() { return { I } }
});

// Layout (sidebar + topbar)
const AppLayout = defineComponent({
  setup() {
    const auth = useAuth();
    const data = useData();
    const router = useRouter();
    const route = useRoute();
    const showNotif = ref(false);
    const showProfile = ref(false);

    const menuItems = computed(() => {
      const items = [
        { id:'dashboard', label:'Boshqaruv paneli', icon:'dashboard', path:'/dashboard' },
        { id:'sessions', label:'Sessiyalar', icon:'sessions', path:'/sessions' },
        { id:'employees', label:'Xodimlar', icon:'users', path:'/employees' },
        { id:'training', label:'O\'quv-rejalar', icon:'book', path:'/training' },
        { id:'cameras', label:'Kameralar', icon:'camera', path:'/cameras' },
        { id:'reports', label:'Hisobotlar', icon:'report', path:'/reports' },
        { id:'settings', label:'Sozlamalar', icon:'settings', path:'/settings' },
      ];
      return items.filter(i => auth.canAccess(i.id));
    });

    const pageTitle = computed(() => {
      const m = menuItems.value.find(i => route.path.startsWith(i.path));
      return m ? m.label : 'ShaffofTIR';
    });

    function logout() { auth.logout(); router.push('/login'); }

    return { auth, data, menuItems, pageTitle, logout, showNotif, showProfile, route };
  },
  template: `
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span v-html="I.target"></span>
        <span>ShaffofTIR</span>
      </div>
      <nav style="flex:1;padding:8px 0">
        <router-link v-for="item in menuItems" :key="item.id" :to="item.path" custom v-slot="{ navigate, isActive }">
          <div class="nav-item" :class="{ active: isActive || route.path.startsWith(item.path) }" @click="navigate">
            <span v-html="I[item.icon]"></span>
            <span>{{ item.label }}</span>
          </div>
        </router-link>
      </nav>
      <div style="padding:12px;border-top:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:10px;padding:6px">
          <div class="avatar">{{ auth.user?.name?.[0] || '?' }}</div>
          <div style="min-width:0">
            <div style="font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ auth.user?.name }}</div>
            <div style="font-size:11px;color:var(--text3)">{{ auth.roleLabels[auth.user?.role] }}</div>
          </div>
        </div>
      </div>
    </aside>
    <div class="main-area">
      <header class="topbar">
        <div class="topbar-title">{{ pageTitle }}</div>
        <div class="topbar-spacer"></div>
        <!-- Notification bell (item 8: modal, not separate page) -->
        <div style="position:relative">
          <button class="btn btn-ghost" style="padding:6px 10px" @click="showNotif = !showNotif">
            <span v-html="I.bell" style="position:relative"></span>
            <span v-if="data.unreadCount > 0" class="nav-badge" style="position:absolute;top:-2px;right:-2px">{{ data.unreadCount }}</span>
          </button>
          <div v-if="showNotif" class="dropdown-menu" style="position:absolute;top:100%;right:0;margin-top:8px;width:360px;max-height:400px;overflow-y:auto">
            <div style="padding:12px 14px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:13px;font-weight:600">Bildirishnomalar</span>
              <button class="btn btn-ghost btn-sm" @click="data.markAllRead()">Hammasini o\'qildi</button>
            </div>
            <div v-for="n in data.notifs" :key="n.id" class="dropdown-item" style="flex-direction:column;align-items:flex-start;gap:2px;border-bottom:1px solid var(--border)" @click="data.markNotifRead(n.id)">
              <div style="display:flex;align-items:center;gap:6px;width:100%">
                <span :class="'badge badge-' + (n.type==='success'?'green':n.type==='error'?'red':n.type==='warning'?'amber':'blue')">{{ n.type }}</span>
                <span style="font-size:12px;font-weight:500;flex:1">{{ n.title }}</span>
                <span v-if="!n.read" style="width:6px;height:6px;border-radius:50%;background:var(--brand)"></span>
              </div>
              <span style="font-size:11px;color:var(--text3)">{{ n.desc }}</span>
              <span style="font-size:10px;color:var(--text3)">{{ n.time }}</span>
            </div>
          </div>
        </div>
        <button class="btn btn-ghost" style="padding:6px 10px" @click="showProfile = !showProfile">
          <div class="avatar" style="width:28px;height:28px;font-size:11px">{{ auth.user?.name?.[0] }}</div>
        </button>
        <div v-if="showProfile" class="dropdown-menu" style="position:absolute;top:56px;right:24px">
          <router-link to="/profile" custom v-slot="{ navigate }">
            <div class="dropdown-item" @click="showProfile=false;navigate()"><span v-html="I.user"></span> Profil</div>
          </router-link>
          <router-link to="/settings" custom v-slot="{ navigate }">
            <div class="dropdown-item" @click="showProfile=false;navigate()"><span v-html="I.settings"></span> Sozlamalar</div>
          </router-link>
          <div class="dropdown-item" @click="logout" style="color:var(--red)"><span v-html="I.logout"></span> Chiqish</div>
        </div>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>`,
  data() { return { I } }
});

// Dashboard — пункт 1 (1920x1080) + пункт 3 (фильтры по viloyat/tuman/batalon)
const DashboardPage = defineComponent({
  setup() {
    const data = useData();
    const fRegion = ref(''); const fDistrict = ref(''); const fBattalion = ref('');

    const filteredEmp = computed(() => {
      return data.emp.filter(e => {
        if (fRegion.value && e.region !== fRegion.value) return false;
        if (fDistrict.value && e.district !== fDistrict.value) return false;
        if (fBattalion.value && e.battalion !== fBattalion.value) return false;
        return true;
      });
    });

    const filteredSess = computed(() => {
      const ids = new Set(filteredEmp.value.map(e => e.id));
      return data.sess.filter(s => ids.has(s.employee));
    });

    const stats = computed(() => ({
      totalEmp: filteredEmp.value.length,
      activeEmp: filteredEmp.value.filter(e => e.status === 'ACTIVE').length,
      totalSess: filteredSess.value.length,
      avgScore: filteredSess.value.length ? Math.round(filteredSess.value.reduce((a,s) => a + s.score, 0) / filteredSess.value.length) : 0,
      totalShots: filteredSess.value.reduce((a,s) => a + s.shots, 0),
      totalHits: filteredSess.value.reduce((a,s) => a + s.hits, 0),
    }));

    const regionStats = computed(() => {
      const map = {};
      data.emp.forEach(e => {
        if (!map[e.region]) map[e.region] = { count:0, sessions:0, totalScore:0, sessCount:0 };
        map[e.region].count++;
        const s = data.sess.filter(x => x.employee === e.id);
        map[e.region].sessions += s.length;
        map[e.region].totalScore += s.reduce((a,x) => a + x.score, 0);
        map[e.region].sessCount += s.length;
      });
      return Object.entries(map).map(([region, v]) => ({ region, ...v, avg: v.sessCount ? Math.round(v.totalScore / v.sessCount) : 0 }))
        .sort((a,b) => b.count - a.count);
    });

    const battalionStats = computed(() => {
      const map = {};
      filteredEmp.value.forEach(e => {
        if (!map[e.battalion]) map[e.battalion] = { count:0, sessions:0, totalScore:0, sessCount:0 };
        map[e.battalion].count++;
        const s = data.sess.filter(x => x.employee === e.id);
        map[e.battalion].sessions += s.length;
        map[e.battalion].totalScore += s.reduce((a,x) => a + x.score, 0);
        map[e.battalion].sessCount += s.length;
      });
      return Object.entries(map).map(([battalion, v]) => ({ battalion, ...v, avg: v.sessCount ? Math.round(v.totalScore / v.sessCount) : 0 }));
    });

    const weeklyChart = computed(() => {
      const days = ['Du','Se','Ch','Pa','Ju','Sh','Ya'];
      const data_ = [12, 8, 15, 10, 18, 6, 3];
      const max = Math.max(...data_);
      return days.map((d, i) => ({ day: d, value: data_[i], height: Math.round(data_[i] / max * 100) }));
    });

    function clearFilters() { fRegion.value = ''; fDistrict.value = ''; fBattalion.value = ''; }

    return { data, fRegion, fDistrict, fBattalion, filteredEmp, filteredSess, stats, regionStats, battalionStats, weeklyChart, clearFilters, districts };
  },
  template: `
  <div>
    <!-- Фильтры (пункт 3) -->
    <div class="filter-bar">
      <span style="font-size:13px;color:var(--text3);display:flex;align-items:center;gap:4px"><span v-html="I.filter" style="width:16px"></span>Filtr:</span>
      <select class="select" v-model="fRegion"><option value="">Barcha viloyatlar</option><option v-for="r in Object.keys(districts)" :key="r" :value="r">{{ r }}</option></select>
      <select class="select" v-model="fDistrict" :disabled="!fRegion"><option value="">Barcha tumanlar</option><option v-for="d in (districts[fRegion]||[])" :key="d" :value="d">{{ d }}</option></select>
      <select class="select" v-model="fBattalion"><option value="">Barcha batalonlar</option><option v-for="b in ['1-motoo\\'chi batalon','2-motoo\\'chi batalon','3-motoo\\'chi batalon','Maxsus batalon','Shtab']" :key="b" :value="b">{{ b }}</option></select>
      <button v-if="fRegion||fDistrict||fBattalion" class="btn btn-ghost btn-sm" @click="clearFilters">Tozalash</button>
    </div>

    <!-- Статистика -->
    <div class="grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-label">Jami xodimlar</div>
        <div class="stat-value">{{ stats.totalEmp }}</div>
        <div class="stat-trend" style="color:var(--green)"><span v-html="I.trending" style="width:14px"></span>{{ stats.activeEmp }} faol</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sessiyalar</div>
        <div class="stat-value">{{ stats.totalSess }}</div>
        <div class="stat-trend" style="color:var(--blue)"><span v-html="I.zap" style="width:14px"></span>{{ stats.totalShots }} o\'q otish</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">O\'rtacha ball</div>
        <div class="stat-value">{{ stats.avgScore }}</div>
        <div class="stat-trend" style="color:var(--amber)"><span v-html="I.target" style="width:14px"></span>{{ stats.totalHits }} aniq tegsa</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Aniqlik darajasi</div>
        <div class="stat-value">{{ stats.totalShots ? Math.round(stats.totalHits / stats.totalShots * 100) : 0 }}%</div>
        <div class="stat-trend" style="color:var(--green)"><span v-html="I.check" style="width:14px"></span>{{ stats.totalHits }}/{{ stats.totalShots }}</div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns:2fr 1fr;margin-bottom:16px">
      <!-- График -->
      <div class="card">
        <div class="card-title">Haftalik otish statistikasi</div>
        <div class="chart-bar">
          <div v-for="d in weeklyChart" :key="d.day" class="chart-bar-item" :style="{height: d.height + '%'}" :title="d.value + ' sessiya'">
            <span style="position:absolute;bottom:-20px;left:0;right:0;text-align:center;font-size:11px;color:var(--text3)">{{ d.day }}</span>
          </div>
        </div>
        <div style="display:flex;justify-content:space-around;padding-top:24px">
          <div v-for="d in weeklyChart" :key="d.day" style="font-size:11px;color:var(--text3)">{{ d.day }}</div>
        </div>
      </div>
      <!-- Уведомления -->
      <div class="card">
        <div class="card-title">So\'ngi bildirishnomalar</div>
        <div v-for="n in data.notifs.slice(0,5)" :key="n.id" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span :class="'badge badge-' + (n.type==='success'?'green':n.type==='error'?'red':n.type==='warning'?'amber':'blue')">{{ n.type }}</span>
            <span style="font-size:12px;font-weight:500">{{ n.title }}</span>
          </div>
          <div style="font-size:11px;color:var(--text3)">{{ n.time }}</div>
        </div>
      </div>
    </div>

    <!-- Статистика по регионам -->
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="card">
        <div class="card-title">Viloyatlar bo\'yicha statistika</div>
        <table>
          <thead><tr><th>Viloyat</th><th>Xodimlar</th><th>Sessiyalar</th><th>O\'rt. ball</th></tr></thead>
          <tbody>
            <tr v-for="r in regionStats" :key="r.region">
              <td>{{ r.region }}</td><td>{{ r.count }}</td><td>{{ r.sessions }}</td><td><span class="badge badge-green">{{ r.avg }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-title">Batalon/bo\'linmalar bo\'yicha statistika</div>
        <table>
          <thead><tr><th>Batalon</th><th>Xodimlar</th><th>Sessiyalar</th><th>O\'rt. ball</th></tr></thead>
          <tbody>
            <tr v-for="b in battalionStats" :key="b.battalion">
              <td>{{ b.battalion }}</td><td>{{ b.count }}</td><td>{{ b.sessions }}</td><td><span class="badge badge-blue">{{ b.avg }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>`,
  data() { return { I } }
});

// Sessions — пункт 2 (merged So'rovlar + calendar/booking + employee search with tuman/batalon)
const SessionsPage = defineComponent({
  setup() {
    const data = useData();
    const tab = ref('list'); // list, calendar, bookings
    const showNewBooking = ref(false);
    const calMonth = ref(new Date().getMonth());
    const calYear = ref(new Date().getFullYear());

    // Booking form
    const bForm = reactive({ employee:'', date:'', time:'09:00', lane:'Yo\'lak 1', weapon:'AK-74', type:'TEST' });
    const bError = ref('');
    const bSuccess = ref('');

    // Employee search filters (пункт 2: tuman + battalion)
    const searchName = ref(''); const searchRegion = ref(''); const searchDistrict = ref(''); const searchBattalion = ref('');

    const filteredEmp = computed(() => {
      return data.emp.filter(e => {
        if (searchName.value && !e.name.toLowerCase().includes(searchName.value.toLowerCase())) return false;
        if (searchRegion.value && e.region !== searchRegion.value) return false;
        if (searchDistrict.value && e.district !== searchDistrict.value) return false;
        if (searchBattalion.value && e.battalion !== searchBattalion.value) return false;
        return true;
      });
    });

    function submitBooking() {
      bError.value = ''; bSuccess.value = '';
      const emp = data.emp.find(e => e.id === bForm.employee);
      if (!emp) { bError.value = 'Xodim tanlang'; return; }
      if (!bForm.date || !bForm.time) { bError.value = 'Sana va vaqt tanlang'; return; }
      const result = data.addBooking({
        employee: emp.id, employeeName: emp.name,
        date: bForm.date, time: bForm.time, lane: bForm.lane, weapon: bForm.weapon, type: bForm.type,
      });
      if (result.error) { bError.value = result.error; return; }
      bSuccess.value = 'So\'rov yuborildi!';
      setTimeout(() => { showNewBooking.value = false; bSuccess.value = ''; }, 1500);
    }

    // Calendar
    const calDays = computed(() => {
      const firstDay = new Date(calYear.value, calMonth.value, 1).getDay();
      const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate();
      const days = [];
      for (let i = 0; i < firstDay; i++) days.push(null);
      for (let i = 1; i <= daysInMonth; i++) days.push(i);
      const today = new Date();
      const isToday = (d) => d === today.getDate() && calMonth.value === today.getMonth() && calYear.value === today.getFullYear();
      return days.map(d => ({ day: d, today: d ? isToday(d) : false, events: d ? data.book.filter(b => {
        const bd = new Date(b.date); return bd.getDate() === d && bd.getMonth() === calMonth.value && bd.getFullYear() === calYear.value;
      }) : [] }));
    });

    const monthNames = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

    function prevMonth() { if (calMonth.value === 0) { calMonth.value = 11; calYear.value--; } else calMonth.value--; }
    function nextMonth() { if (calMonth.value === 11) { calMonth.value = 0; calYear.value++; } else calMonth.value++; }

    const lanes = ['Yo\'lak 1', 'Yo\'lak 2', 'Yo\'lak 3'];
    const timeSlots = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

    return { data, tab, showNewBooking, bForm, bError, bSuccess, submitBooking, calMonth, calYear, calDays, monthNames, prevMonth, nextMonth, lanes, timeSlots, searchName, searchRegion, searchDistrict, searchBattalion, filteredEmp, districts };
  },
  template: `
  <div>
    <div class="tab-bar">
      <div class="tab" :class="{active: tab==='list'}" @click="tab='list'">Sessiyalar ro\'yxati</div>
      <div class="tab" :class="{active: tab==='calendar'}" @click="tab='calendar'">Kalendar / Band qilish</div>
      <div class="tab" :class="{active: tab==='bookings'}" @click="tab='bookings'">So\'rovlar ({{ data.book.filter(b=>b.status==='pending').length }})</div>
    </div>

    <!-- Список сессий -->
    <div v-if="tab==='list'" class="card">
      <table>
        <thead><tr><th>Sana</th><th>Vaqt</th><th>Yo\'lak</th><th>Xodim</th><th>Qurol</th><th>Turi</th><th>O\'q</th><th>Aniq</th><th>Ball</th><th>Holat</th></tr></thead>
        <tbody>
          <tr v-for="s in data.sess" :key="s.id">
            <td>{{ s.date }}</td><td>{{ s.time }}</td><td>{{ s.lane }}</td>
            <td>{{ s.employeeName }}</td><td>{{ s.weapon }}</td>
            <td><span :class="'badge ' + (s.type==='MAIN'?'badge-purple':'badge-blue')">{{ s.type }}</span></td>
            <td>{{ s.shots }}</td><td>{{ s.hits }}</td>
            <td><b>{{ s.score }}</b></td>
            <td><span class="badge badge-green">{{ s.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Календарь с логикой бронирования -->
    <div v-if="tab==='calendar'">
      <div class="grid" style="grid-template-columns:2fr 1fr">
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div style="font-size:16px;font-weight:600">{{ monthNames[calMonth] }} {{ calYear }}</div>
            <div style="display:flex;gap:4px">
              <button class="btn btn-ghost btn-sm" @click="prevMonth">←</button>
              <button class="btn btn-ghost btn-sm" @click="nextMonth">→</button>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px">
            <div v-for="d in ['Du','Se','Ch','Pa','Ju','Sh','Ya']" :key="d" style="text-align:center;font-size:11px;color:var(--text3);font-weight:500;padding:4px">{{ d }}</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
            <div v-for="(d,i) in calDays" :key="i" class="cal-cell" :class="{today: d.today}" style="min-height:70px">
              <div v-if="d.day" style="font-size:12px;font-weight:500;margin-bottom:4px">{{ d.day }}</div>
              <div v-for="e in d.events" :key="e.id" class="cal-event" :style="{background: e.status==='approved'?'var(--green)':'var(--amber)',color:'#fff'}" @click="">
                {{ e.time }} {{ e.lane }}
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Yo\'lak band qilish</div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:16px" @click="showNewBooking=true">
            <span v-html="I.plus" style="width:16px"></span> Yangi band qilish
          </button>
          <div style="font-size:12px;color:var(--text3);margin-bottom:8px">Bugungi band qilingan vaqtlar:</div>
          <div v-for="b in data.book.filter(x=>x.status!=='rejected')" :key="b.id" style="padding:8px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:6px">
              <span v-html="I.clock" style="width:14px"></span>
              <span style="font-size:12px">{{ b.date }} {{ b.time }}</span>
              <span style="font-size:12px;color:var(--text3)">— {{ b.lane }}</span>
            </div>
            <div style="font-size:11px;color:var(--text3);margin-left:20px">{{ b.employeeName }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- So'rovlar (merged) -->
    <div v-if="tab==='bookings'" class="card">
      <div class="card-title">So\'rovlar ro\'yxati</div>
      <table>
        <thead><tr><th>Sana</th><th>Vaqt</th><th>Yo\'lak</th><th>Xodim</th><th>Qurol</th><th>Turi</th><th>Holat</th><th>Amal</th></tr></thead>
        <tbody>
          <tr v-for="b in data.book" :key="b.id">
            <td>{{ b.date }}</td><td>{{ b.time }}</td><td>{{ b.lane }}</td>
            <td>{{ b.employeeName }}</td><td>{{ b.weapon }}</td>
            <td><span :class="'badge ' + (b.type==='MAIN'?'badge-purple':'badge-blue')">{{ b.type }}</span></td>
            <td>
              <span :class="'badge ' + (b.status==='approved'?'badge-green':b.status==='pending'?'badge-amber':'badge-red')">{{ b.status }}</span>
            </td>
            <td>
              <button v-if="b.status==='pending'" class="btn btn-primary btn-sm" @click="data.approveBooking(b.id)">Tasdiqlash</button>
              <button v-if="b.status==='pending'" class="btn btn-ghost btn-sm" style="color:var(--red)" @click="data.rejectBooking(b.id)">Rad</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модалка нового бронирования -->
    <div v-if="showNewBooking" class="modal-overlay" @click.self="showNewBooking=false">
      <div class="modal">
        <div class="modal-header">
          <span style="font-size:15px;font-weight:600">Yangi yo\'lak band qilish</span>
          <button class="btn btn-ghost btn-sm" @click="showNewBooking=false"><span v-html="I.x" style="width:16px"></span></button>
        </div>
        <div class="modal-body">
          <!-- Поиск сотрудника с tuman/batalon (пункт 2) -->
          <div class="card-title">Xodimni qidirish</div>
          <div class="filter-bar" style="margin-bottom:12px">
            <input class="input" style="min-width:160px" v-model="searchName" placeholder="Ism qidirish...">
            <select class="select" v-model="searchRegion"><option value="">Viloyat</option><option v-for="r in Object.keys(districts)" :key="r" :value="r">{{ r }}</option></select>
            <select class="select" v-model="searchDistrict" :disabled="!searchRegion"><option value="">Tuman</option><option v-for="d in (districts[searchRegion]||[])" :key="d" :value="d">{{ d }}</option></select>
            <select class="select" v-model="searchBattalion"><option value="">Batalon</option><option v-for="b in ['1-motoo\\'chi batalon','2-motoo\\'chi batalon','3-motoo\\'chi batalon','Maxsus batalon','Shtab']" :key="b" :value="b">{{ b }}</option></select>
          </div>
          <div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;margin-bottom:16px">
            <div v-for="e in filteredEmp" :key="e.id" class="list-item" @click="bForm.employee=e.id" :style="{background: bForm.employee===e.id ? 'var(--surface2)' : ''}">
              <div class="avatar" style="width:28px;height:28px;font-size:11px">{{ e.name[0] }}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;font-weight:500">{{ e.name }}</div>
                <div style="font-size:11px;color:var(--text3)">{{ e.rank }} · {{ e.district }} · {{ e.battalion }}</div>
              </div>
              <span v-if="bForm.employee===e.id" v-html="I.check" style="color:var(--green);width:18px"></span>
            </div>
          </div>

          <div class="grid" style="grid-template-columns:1fr 1fr">
            <div><label class="label">Sana</label><input class="input" type="date" v-model="bForm.date"></div>
            <div><label class="label">Vaqt</label><select class="select" v-model="bForm.time"><option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option></select></div>
            <div><label class="label">Yo\'lak</label><select class="select" v-model="bForm.lane"><option v-for="l in lanes" :key="l" :value="l">{{ l }}</option></select></div>
            <div><label class="label">Qurol</label><select class="select" v-model="bForm.weapon"><option>AK-74</option><option>AK-74M</option><option>SVD Dragunov</option><option>Makarov PM</option><option>PKM</option><option>AK-74U</option></select></div>
            <div><label class="label">Turi</label><select class="select" v-model="bForm.type"><option value="TEST">Sinov (TEST)</option><option value="MAIN">Asosiy (MAIN)</option></select></div>
          </div>
          <div v-if="bError" style="color:var(--red);font-size:13px;margin-top:12px">{{ bError }}</div>
          <div v-if="bSuccess" style="color:var(--green);font-size:13px;margin-top:12px">{{ bSuccess }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showNewBooking=false">Bekor qilish</button>
          <button class="btn btn-primary" @click="submitBooking">So\'rov yuborish</button>
        </div>
      </div>
    </div>
  </div>`,
  data() { return { I } }
});

// Employees — пункт 4 (list view, not cards)
const EmployeesPage = defineComponent({
  setup() {
    const data = useData();
    const search = ref(''); const fRegion = ref(''); const fBattalion = ref(''); const fStatus = ref('');
    const selected = ref(null);

    const filtered = computed(() => {
      return data.emp.filter(e => {
        if (search.value && !e.name.toLowerCase().includes(search.value.toLowerCase())) return false;
        if (fRegion.value && e.region !== fRegion.value) return false;
        if (fBattalion.value && e.battalion !== fBattalion.value) return false;
        if (fStatus.value && e.status !== fStatus.value) return false;
        return true;
      });
    });

    const qualColors = { EXPERT:'badge-green', ADVANCED:'badge-blue', INTERMEDIATE:'badge-amber', BEGINNER:'badge-gray' };

    return { data, search, fRegion, fBattalion, fStatus, filtered, selected, qualColors, districts };
  },
  template: `
  <div>
    <div class="filter-bar">
      <div style="position:relative;flex:1;max-width:280px">
        <span v-html="I.search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:16px;color:var(--text3)"></span>
        <input class="input" style="padding-left:34px" v-model="search" placeholder="Ism bo\'yicha qidirish...">
      </div>
      <select class="select" v-model="fRegion"><option value="">Barcha viloyatlar</option><option v-for="r in Object.keys(districts)" :key="r" :value="r">{{ r }}</option></select>
      <select class="select" v-model="fBattalion"><option value="">Barcha batalonlar</option><option v-for="b in ['1-motoo\\'chi batalon','2-motoo\\'chi batalon','3-motoo\\'chi batalon','Maxsus batalon','Shtab']" :key="b" :value="b">{{ b }}</option></select>
      <select class="select" v-model="fStatus"><option value="">Barcha holatlar</option><option value="ACTIVE">Faol</option><option value="RESERVE">Zaxira</option></select>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead>
          <tr><th>F.I.O</th><th>Unvoni</th><th>Lavozimi</th><th>Viloyat</th><th>Tuman</th><th>Batalon</th><th>Holat</th><th>Malaka</th><th>Sessiya</th><th>O\'rt. ball</th><th>Face ID</th></tr>
        </thead>
        <tbody>
          <tr v-for="e in filtered" :key="e.id" style="cursor:pointer" @click="selected=e">
            <td style="font-weight:500">{{ e.name }}</td>
            <td>{{ e.rank }}</td>
            <td>{{ e.position }}</td>
            <td>{{ e.region }}</td>
            <td>{{ e.district }}</td>
            <td>{{ e.battalion }}</td>
            <td><span :class="'badge ' + (e.status==='ACTIVE'?'badge-green':'badge-gray')">{{ e.status }}</span></td>
            <td><span :class="'badge ' + qualColors[e.qualification]">{{ e.qualification }}</span></td>
            <td>{{ e.sessions }}</td>
            <td><b>{{ e.avgScore }}</b></td>
            <td><span :class="'badge ' + (e.faceId?'badge-green':'badge-red')">{{ e.faceId ? 'Bor' : 'Yo\'q' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Детали сотрудника -->
    <div v-if="selected" class="modal-overlay" @click.self="selected=null">
      <div class="modal">
        <div class="modal-header">
          <span style="font-size:15px;font-weight:600">Xodim ma\'lumotlari</span>
          <button class="btn btn-ghost btn-sm" @click="selected=null"><span v-html="I.x" style="width:16px"></span></button>
        </div>
        <div class="modal-body">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
            <div class="avatar" style="width:56px;height:56px;font-size:20px">{{ selected.name[0] }}</div>
            <div>
              <div style="font-size:16px;font-weight:600">{{ selected.name }}</div>
              <div style="font-size:13px;color:var(--text3)">{{ selected.rank }} · {{ selected.position }}</div>
            </div>
          </div>
          <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
            <div><div class="label">Viloyat</div><div style="font-size:13px">{{ selected.region }}</div></div>
            <div><div class="label">Tuman</div><div style="font-size:13px">{{ selected.district }}</div></div>
            <div><div class="label">Batalon</div><div style="font-size:13px">{{ selected.battalion }}</div></div>
            <div><div class="label">Telefon</div><div style="font-size:13px">{{ selected.phone }}</div></div>
            <div><div class="label">Holat</div><div><span :class="'badge ' + (selected.status==='ACTIVE'?'badge-green':'badge-gray')">{{ selected.status }}</span></div></div>
            <div><div class="label">Malaka</div><div><span :class="'badge ' + qualColors[selected.qualification]">{{ selected.qualification }}</span></div></div>
            <div><div class="label">Jami sessiyalar</div><div style="font-size:13px;font-weight:600">{{ selected.sessions }}</div></div>
            <div><div class="label">O\'rtacha ball</div><div style="font-size:13px;font-weight:600">{{ selected.avgScore }}</div></div>
            <div><div class="label">Oxirgi otish</div><div style="font-size:13px">{{ selected.lastShoot }}</div></div>
            <div><div class="label">Face ID</div><div><span :class="'badge ' + (selected.faceId?'badge-green':'badge-red')">{{ selected.faceId ? 'Ro\'yxatdan o\'tgan' : 'Ro\'yxatdan o\'tmagan' }}</span></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  data() { return { I } }
});

// Training — пункт 5 (O'quv-rejalar, visual, video, employee status, camera + 3D)
const TrainingPage = defineComponent({
  setup() {
    const data = useData();
    const tab = ref('plans'); // plans, active
    const selectedPlan = ref(null);
    const selectedAssign = ref(null);

    const activeAssignments = computed(() => data.assign.filter(a => a.status === 'in-progress'));
    const completedAssignments = computed(() => data.assign.filter(a => a.status === 'completed'));

    return { data, tab, selectedPlan, selectedAssign, activeAssignments, completedAssignments };
  },
  template: `
  <div>
    <div class="tab-bar">
      <div class="tab" :class="{active: tab==='plans'}" @click="tab='plans'">O\'quv-rejalar</div>
      <div class="tab" :class="{active: tab==='active'}" @click="tab='active'">Davom etayotgan ({{ activeAssignments.length }})</div>
      <div class="tab" :class="{active: tab==='completed'}" @click="tab='completed'">Yakunlangan</div>
    </div>

    <!-- Планы обучения (визуальные карточки с картинками/видео) -->
    <div v-if="tab==='plans'">
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">
        <div v-for="p in data.train" :key="p.id" class="training-card" @click="selectedPlan=p">
          <div style="aspect-ratio:16/9;background:var(--surface2);border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;position:relative">
            <span style="font-size:48px">{{ p.image }}</span>
            <div v-if="p.video" style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,.6);border-radius:6px;padding:3px 8px;display:flex;align-items:center;gap:4px">
              <span v-html="I.video" style="width:14px;color:#fff"></span><span style="font-size:10px;color:#fff">Video</span>
            </div>
          </div>
          <div style="font-size:14px;font-weight:600;margin-bottom:4px">{{ p.title }}</div>
          <div style="font-size:12px;color:var(--text3);margin-bottom:12px">{{ p.desc }}</div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span :class="'badge ' + (p.level==='BEGINNER'?'badge-gray':p.level==='INTERMEDIATE'?'badge-blue':p.level==='ADVANCED'?'badge-amber':'badge-green')">{{ p.level }}</span>
            <span class="tag">{{ p.lessons }} dars</span>
            <span class="tag">{{ p.duration }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Активные назначения с камерой и 3D результатами -->
    <div v-if="tab==='active'">
      <div class="grid" style="grid-template-columns:1fr">
        <div v-for="a in activeAssignments" :key="a.id" class="card" style="margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div class="avatar">{{ a.employee }}</div>
            <div style="flex:1">
              <div style="font-size:14px;font-weight:600">{{ data.emp.find(e=>e.id===a.employee)?.name || 'Xodim' }}</div>
              <div style="font-size:12px;color:var(--text3)">{{ a.planTitle }}</div>
            </div>
            <span class="badge badge-amber"><span class="live-dot"></span> {{ a.status }}</span>
            <button class="btn btn-primary btn-sm" @click="selectedAssign=a">Ko\'rish →</button>
          </div>
          <div class="progress" style="margin-bottom:4px">
            <div class="progress-bar" :style="{width: a.progress + '%', background: 'var(--brand)'}"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3)">
            <span>Progress: {{ a.progress }}%</span>
            <span v-if="a.lane"><span v-html="I.camera" style="width:12px"></span> {{ a.lane }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tab==='completed'" class="card">
      <table>
        <thead><tr><th>Xodim</th><th>Reja</th><th>Progress</th><th>Holat</th><th>Sana</th></tr></thead>
        <tbody>
          <tr v-for="a in completedAssignments" :key="a.id">
            <td>{{ data.emp.find(e=>e.id===a.employee)?.name }}</td>
            <td>{{ a.planTitle }}</td>
            <td><span class="badge badge-green">{{ a.progress }}%</span></td>
            <td><span class="badge badge-green">{{ a.status }}</span></td>
            <td>{{ a.startedAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Детали плана -->
    <div v-if="selectedPlan" class="modal-overlay" @click.self="selectedPlan=null">
      <div class="modal" style="max-width:700px">
        <div class="modal-header">
          <span style="font-size:15px;font-weight:600">{{ selectedPlan.title }}</span>
          <button class="btn btn-ghost btn-sm" @click="selectedPlan=null"><span v-html="I.x" style="width:16px"></span></button>
        </div>
        <div class="modal-body">
          <div style="aspect-ratio:16/9;background:var(--surface2);border-radius:8px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;position:relative">
            <span style="font-size:64px">{{ selectedPlan.image }}</span>
            <button v-if="selectedPlan.video" class="btn btn-primary" style="position:absolute">
              <span v-html="I.play" style="width:16px"></span> Videoni ko\'rish
            </button>
          </div>
          <div style="font-size:14px;color:var(--text2);margin-bottom:16px">{{ selectedPlan.desc }}</div>
          <div style="display:flex;gap:8px;margin-bottom:16px">
            <span :class="'badge ' + (selectedPlan.level==='BEGINNER'?'badge-gray':selectedPlan.level==='INTERMEDIATE'?'badge-blue':selectedPlan.level==='ADVANCED'?'badge-amber':'badge-green')">{{ selectedPlan.level }}</span>
            <span class="tag">{{ selectedPlan.lessons }} dars</span>
            <span class="tag">{{ selectedPlan.duration }}</span>
          </div>
          <div class="card-title">Darslar ro\'yxati</div>
          <div v-for="i in selectedPlan.lessons" :key="i" style="padding:10px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
            <div style="width:28px;height:28px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600">{{ i }}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:500">Dars {{ i }}: Amaliy mashq</div>
              <div style="font-size:11px;color:var(--text3)">20 daqiqa</div>
            </div>
            <span v-html="I.play" style="width:16px;color:var(--brand);cursor:pointer"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Live view: камера + 3D результат -->
    <div v-if="selectedAssign" class="modal-overlay" @click.self="selectedAssign=null">
      <div class="modal" style="max-width:900px">
        <div class="modal-header">
          <span style="font-size:15px;font-weight:600">{{ data.emp.find(e=>e.id===selectedAssign.employee)?.name }} — Jonli kuzatuv</span>
          <button class="btn btn-ghost btn-sm" @click="selectedAssign=null"><span v-html="I.x" style="width:16px"></span></button>
        </div>
        <div class="modal-body">
          <div class="grid" style="grid-template-columns:1fr 1fr">
            <!-- Камера -->
            <div>
              <div class="card-title" style="display:flex;align-items:center;gap:6px">
                <span class="live-dot"></span> {{ selectedAssign.lane }} — Kamera
              </div>
              <div style="aspect-ratio:4/3;background:#000;border-radius:8px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden">
                <div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a1a2e,#16213e);opacity:.8"></div>
                <div style="position:relative;z-index:1;text-align:center">
                  <span v-html="I.camera" style="width:48px;color:var(--text3)"></span>
                  <div style="font-size:12px;color:var(--text3);margin-top:8px">Kamera jonli uzatish</div>
                </div>
                <div style="position:absolute;top:8px;left:8px;display:flex;align-items:center;gap:4px">
                  <span class="live-dot"></span><span style="font-size:10px;color:#fff;font-weight:600">LIVE</span>
                </div>
                <div style="position:absolute;bottom:8px;left:8px;right:8px;display:flex;justify-content:space-between">
                  <span style="font-size:10px;color:#fff">{{ selectedAssign.lane }}</span>
                  <span style="font-size:10px;color:#fff">{{ new Date().toLocaleTimeString() }}</span>
                </div>
              </div>
            </div>
            <!-- 3D интерактивный результат -->
            <div>
              <div class="card-title" style="display:flex;align-items:center;gap:6px">
                <span v-html="I.target" style="width:16px"></span> 3D Natija (Real-time)
              </div>
              <div style="aspect-ratio:4/3;background:var(--surface2);border-radius:8px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden">
                <!-- 3D мишень -->
                <svg viewBox="0 0 200 200" style="width:80%;height:80%">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#27272a" stroke-width="2"/>
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#27272a" stroke-width="2"/>
                  <circle cx="100" cy="100" r="50" fill="none" stroke="#27272a" stroke-width="2"/>
                  <circle cx="100" cy="100" r="30" fill="none" stroke="#27272a" stroke-width="2"/>
                  <circle cx="100" cy="100" r="15" fill="none" stroke="#ef4444" stroke-width="2"/>
                  <circle cx="100" cy="100" r="5" fill="#ef4444"/>
                  <!-- Очки попаданий -->
                  <circle cx="85" cy="95" r="4" fill="#22c55e" opacity="0.8"><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle>
                  <circle cx="115" cy="105" r="4" fill="#22c55e" opacity="0.8"><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle>
                  <circle cx="95" cy="110" r="4" fill="#f59e0b" opacity="0.8"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite"/></circle>
                  <circle cx="108" cy="88" r="4" fill="#22c55e" opacity="0.8"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite"/></circle>
                  <circle cx="92" cy="85" r="4" fill="#ef4444" opacity="0.8"><animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite"/></circle>
                </svg>
                <div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,.6);border-radius:6px;padding:4px 8px">
                  <span style="font-size:11px;color:#fff;font-weight:600">Score: {{ selectedAssign.progress }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="grid" style="grid-template-columns:1fr 1fr 1fr">
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:700;color:var(--green)">4</div>
              <div style="font-size:11px;color:var(--text3)">Aniq tegsa</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:700;color:var(--red)">1</div>
              <div style="font-size:11px;color:var(--text3)">Tegmagan</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:700;color:var(--brand)">{{ selectedAssign.progress }}%</div>
              <div style="font-size:11px;color:var(--text3)">Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  data() { return { I } }
});

// Cameras — пункт 7 (улучшенный визуал, все места)
const CamerasPage = defineComponent({
  setup() {
    const data = useData();
    const locations = computed(() => [...new Set(data.cams.map(c => c.location))]);
    return { data, locations };
  },
  template: `
  <div>
    <div class="grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-label">Jami kameralar</div>
        <div class="stat-value">{{ data.cams.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Online</div>
        <div class="stat-value" style="color:var(--green)">{{ data.cams.filter(c=>c.status==='online').length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Offline</div>
        <div class="stat-value" style="color:var(--red)">{{ data.cams.filter(c=>c.status==='offline').length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Joylar</div>
        <div class="stat-value">{{ locations.length }}</div>
      </div>
    </div>

    <div v-for="loc in locations" :key="loc" style="margin-bottom:24px">
      <div style="font-size:15px;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px">
        <span v-html="I.map" style="width:18px;color:var(--brand)"></span>
        {{ loc }}
      </div>
      <div class="cam-grid">
        <div v-for="c in data.cams.filter(x=>x.location===loc)" :key="c.id" class="cam-card">
          <div class="cam-feed">
            <div v-if="c.status==='online'" style="position:absolute;inset:0;background:linear-gradient(135deg,#0c0c0d,#1a1a2e);display:flex;align-items:center;justify-content:center">
              <span v-html="I.camera" style="width:32px;color:var(--text3)"></span>
            </div>
            <div v-else style="position:absolute;inset:0;background:#0a0a0b;display:flex;align-items:center;justify-content:center">
              <span v-html="I.alert" style="width:32px;color:var(--red)"></span>
            </div>
            <div class="cam-overlay">
              <div style="display:flex;align-items:center;gap:4px">
                <span v-if="c.status==='online'" class="live-dot"></span>
                <span style="font-weight:600">{{ c.status === 'online' ? 'LIVE' : 'OFFLINE' }}</span>
              </div>
              <span>{{ c.resolution }}</span>
            </div>
          </div>
          <div style="padding:10px 12px">
            <div style="font-size:13px;font-weight:500;margin-bottom:4px">{{ c.name }}</div>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:11px;color:var(--text3)">{{ c.ip }}</span>
              <span :class="'badge ' + (c.status==='online'?'badge-green':'badge-red')">{{ c.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  data() { return { I } }
});

// Reports — пункт 6 (merged Protokollar into Hisobotlar)
const ReportsPage = defineComponent({
  setup() {
    const data = useData();
    const tab = ref('summary'); // summary, protocols, analytics
    const search = ref('');
    const fDate = ref('');

    const filteredProtos = computed(() => {
      return data.proto.filter(p => {
        if (search.value && !p.employeeName?.toLowerCase().includes(search.value.toLowerCase())) return false;
        if (fDate.value && p.date !== fDate.value) return false;
        return true;
      });
    });

    const stats = computed(() => ({
      total: data.proto.length,
      signed: data.proto.filter(p => p.signed).length,
      unsigned: data.proto.filter(p => !p.signed).length,
      avgScore: data.proto.length ? Math.round(data.proto.reduce((a,p) => a + p.score, 0) / data.proto.length) : 0,
    }));

    return { data, tab, search, fDate, filteredProtos, stats };
  },
  template: `
  <div>
    <div class="tab-bar">
      <div class="tab" :class="{active: tab==='summary'}" @click="tab='summary'">Umumiy hisobot</div>
      <div class="tab" :class="{active: tab==='protocols'}" @click="tab='protocols'">Protokollar ({{ data.proto.length }})</div>
      <div class="tab" :class="{active: tab==='analytics'}" @click="tab='analytics'">Tahlil</div>
    </div>

    <!-- Сводка -->
    <div v-if="tab==='summary'">
      <div class="grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
        <div class="stat-card"><div class="stat-label">Jami protokollar</div><div class="stat-value">{{ stats.total }}</div></div>
        <div class="stat-card"><div class="stat-label">Imzolangan</div><div class="stat-value" style="color:var(--green)">{{ stats.signed }}</div></div>
        <div class="stat-card"><div class="stat-label">Imzolanmagan</div><div class="stat-value" style="color:var(--amber)">{{ stats.unsigned }}</div></div>
        <div class="stat-card"><div class="stat-label">O\'rt. ball</div><div class="stat-value">{{ stats.avgScore }}</div></div>
      </div>
      <div class="card">
        <div class="card-title">So\'ngi protokollar</div>
        <table>
          <thead><tr><th>ID</th><th>Sana</th><th>Xodim</th><th>Qurol</th><th>O\'q</th><th>Aniq</th><th>Ball</th><th>Imzo</th></tr></thead>
          <tbody>
            <tr v-for="p in data.proto.slice(0,10)" :key="p.id">
              <td><code>{{ p.id }}</code></td>
              <td>{{ p.date }}</td>
              <td>{{ data.emp.find(e=>e.id===p.employee)?.name || p.employee }}</td>
              <td>{{ p.weapon }}</td>
              <td>{{ p.shots }}</td>
              <td>{{ p.hits }}</td>
              <td><b>{{ p.score }}</b></td>
              <td><span :class="'badge ' + (p.signed?'badge-green':'badge-amber')">{{ p.signed ? 'Imzolangan' : 'Kutilmoqda' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Протоколы -->
    <div v-if="tab==='protocols'" class="card">
      <div class="filter-bar">
        <div style="position:relative;flex:1;max-width:280px">
          <span v-html="I.search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:16px;color:var(--text3)"></span>
          <input class="input" style="padding-left:34px" v-model="search" placeholder="Xodim bo\'yicha qidirish...">
        </div>
        <input class="input" type="date" v-model="fDate" style="max-width:160px">
        <button class="btn btn-ghost btn-sm" style="margin-left:auto"><span v-html="I.download" style="width:14px"></span> Eksport</button>
      </div>
      <table>
        <thead><tr><th>ID</th><th>Sana</th><th>Xodim</th><th>Qurol</th><th>O\'q soni</th><th>Aniq</th><th>Ball</th><th>Imzo holati</th></tr></thead>
        <tbody>
          <tr v-for="p in filteredProtos" :key="p.id">
            <td><code>{{ p.id }}</code></td>
            <td>{{ p.date }}</td>
            <td>{{ data.emp.find(e=>e.id===p.employee)?.name || p.employee }}</td>
            <td>{{ p.weapon }}</td>
            <td>{{ p.shots }}</td>
            <td>{{ p.hits }}</td>
            <td><b>{{ p.score }}</b></td>
            <td><span :class="'badge ' + (p.signed?'badge-green':'badge-amber')">{{ p.signed ? 'Imzolangan' : 'Kutilmoqda' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Аналитика -->
    <div v-if="tab==='analytics'" class="grid" style="grid-template-columns:1fr 1fr">
      <div class="card">
        <div class="card-title">Qurol turi bo\'yicha otish</div>
        <table>
          <thead><tr><th>Qurol</th><th>Sessiyalar</th><th>O\'rt. ball</th></tr></thead>
          <tbody>
            <tr v-for="w in [...new Set(data.sess.map(s=>s.weapon))]" :key="w">
              <td>{{ w }}</td>
              <td>{{ data.sess.filter(s=>s.weapon===w).length }}</td>
              <td><span class="badge badge-blue">{{ Math.round(data.sess.filter(s=>s.weapon===w).reduce((a,s)=>a+s.score,0) / data.sess.filter(s=>s.weapon===w).length) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-title">Eng yaxshi o\'qchilar (Top-5)</div>
        <div v-for="(e,i) in [...data.emp].sort((a,b)=>b.avgScore-a.avgScore).slice(0,5)" :key="e.id" style="padding:10px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
          <div style="width:24px;height:24px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600">{{ i+1 }}</div>
          <div style="flex:1"><div style="font-size:13px;font-weight:500">{{ e.name }}</div><div style="font-size:11px;color:var(--text3)">{{ e.battalion }}</div></div>
          <span class="badge badge-green">{{ e.avgScore }}</span>
        </div>
      </div>
    </div>
  </div>`,
  data() { return { I } }
});

// Profile — пункт 9 (улучшенный)
const ProfilePage = defineComponent({
  setup() {
    const auth = useAuth();
    const data = useData();
    const editing = ref(false);
    const form = reactive({ name: auth.user?.name || '', email: auth.user?.email || '', phone: '', rank: auth.user?.rank || '' });
    const userSessions = computed(() => data.sess.filter(s => s.employee === auth.user?.email)); // demo

    return { auth, data, editing, form, userSessions };
  },
  template: `
  <div style="max-width:700px">
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:20px;margin-bottom:20px">
        <div class="avatar" style="width:72px;height:72px;font-size:28px">{{ auth.user?.name?.[0] }}</div>
        <div style="flex:1">
          <div style="font-size:20px;font-weight:700">{{ auth.user?.name }}</div>
          <div style="font-size:14px;color:var(--text3);margin-top:4px">{{ auth.user?.email }}</div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <span :class="'badge ' + (auth.user?.role==='MANAGER'?'badge-purple':auth.user?.role==='INSTRUCTOR'?'badge-blue':'badge-green')">{{ auth.roleLabels[auth.user?.role] }}</span>
            <span class="badge badge-gray">{{ auth.user?.rank }}</span>
          </div>
        </div>
        <button class="btn btn-ghost" @click="editing=!editing">{{ editing ? 'Bekor' : 'Tahrirlash' }}</button>
      </div>

      <div v-if="!editing" class="grid" style="grid-template-columns:1fr 1fr;gap:16px">
        <div><div class="label">To\'liq ism</div><div style="font-size:14px">{{ auth.user?.name }}</div></div>
        <div><div class="label">Email</div><div style="font-size:14px">{{ auth.user?.email }}</div></div>
        <div><div class="label">Unvon</div><div style="font-size:14px">{{ auth.user?.rank }}</div></div>
        <div><div class="label">Rol</div><div style="font-size:14px">{{ auth.roleLabels[auth.user?.role] }}</div></div>
      </div>

      <div v-else class="grid" style="grid-template-columns:1fr 1fr;gap:16px">
        <div><label class="label">To\'liq ism</label><input class="input" v-model="form.name"></div>
        <div><label class="label">Email</label><input class="input" v-model="form.email" disabled></div>
        <div><label class="label">Unvon</label><input class="input" v-model="form.rank"></div>
        <div><label class="label">Telefon</label><input class="input" v-model="form.phone" placeholder="+998..."></div>
        <div style="grid-column:span 2"><button class="btn btn-primary" @click="editing=false">Saqlash</button></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Mening statistikam</div>
      <div class="grid" style="grid-template-columns:repeat(3,1fr)">
        <div style="text-align:center;padding:16px">
          <div style="font-size:28px;font-weight:700;color:var(--brand)">{{ userSessions.length || 0 }}</div>
          <div style="font-size:12px;color:var(--text3)">Sessiyalar</div>
        </div>
        <div style="text-align:center;padding:16px">
          <div style="font-size:28px;font-weight:700;color:var(--green)">--</div>
          <div style="font-size:12px;color:var(--text3)">O\'rt. ball</div>
        </div>
        <div style="text-align:center;padding:16px">
          <div style="font-size:28px;font-weight:700;color:var(--amber)">--</div>
          <div style="font-size:12px;color:var(--text3)">Aniqlik %</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-title">Xavfsizlik</div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
        <div><div style="font-size:13px;font-weight:500">Parolni o\'zgartirish</div><div style="font-size:12px;color:var(--text3)">Hisobingiz xavfsizligini ta\'minlang</div></div>
        <button class="btn btn-ghost btn-sm">O\'zgartirish</button>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0">
        <div><div style="font-size:13px;font-weight:500">Ikki bosqichli autentifikatsiya</div><div style="font-size:12px;color:var(--text3)">Qo\'shimcha xavfsizlik qatlami</div></div>
        <div class="toggle"><div class="toggle-dot"></div></div>
      </div>
    </div>
  </div>`,
  data() { return { I } }
});

// Settings
const SettingsPage = defineComponent({
  setup() { return {}; },
  template: `
  <div style="max-width:600px">
    <div class="card" style="margin-bottom:16px">
      <div class="card-title">Tizim sozlamalari</div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
        <div><div style="font-size:13px;font-weight:500">Til</div><div style="font-size:12px;color:var(--text3)">Interfeys tili</div></div>
        <select class="select" style="width:120px"><option>O\'zbekcha</option><option>Русский</option></select>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
        <div><div style="font-size:13px;font-weight:500">Vaqt zonasi</div><div style="font-size:12px;color:var(--text3)">Tizim vaqti</div></div>
        <select class="select" style="width:160px"><option>UTC+5 (Toshkent)</option></select>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0">
        <div><div style="font-size:13px;font-weight:500">Bildirishnomalar</div><div style="font-size:12px;color:var(--text3)">Push xabarnoma</div></div>
        <div class="toggle on"><div class="toggle-dot"></div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Kamera sozlamalari</div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
        <div><div style="font-size:13px;font-weight:500">AI tahlil</div><div style="font-size:12px;color:var(--text3)">Otomatik o\'q aniqlash</div></div>
        <div class="toggle on"><div class="toggle-dot"></div></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0">
        <div><div style="font-size:13px;font-weight:500">3D vizualizatsiya</div><div style="font-size:12px;color:var(--text3)">Real-time 3D natija</div></div>
        <div class="toggle on"><div class="toggle-dot"></div></div>
      </div>
    </div>
  </div>`
});

// 403
const ForbiddenPage = defineComponent({
  template: `
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh">
    <div style="font-size:48px;margin-bottom:12px">⛔</div>
    <div style="font-size:20px;font-weight:600;margin-bottom:8px">Ruxsat berilmagan</div>
    <div style="font-size:14px;color:var(--text3);margin-bottom:20px">Sizda ushbu sahifaga kirish huquqi yo\'q</div>
    <button class="btn btn-primary" @click="$router.push('/dashboard')">Boshqaruv paneliga qaytish</button>
  </div>`
});

// 404
const NotFoundPage = defineComponent({
  template: `
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh">
    <div style="font-size:48px;margin-bottom:12px">🔍</div>
    <div style="font-size:20px;font-weight:600;margin-bottom:8px">Sahifa topilmadi</div>
    <div style="font-size:14px;color:var(--text3);margin-bottom:20px">404</div>
    <button class="btn btn-primary" @click="$router.push('/dashboard')">Boshqaruv paneliga qaytish</button>
  </div>`
});

// ─── ROUTER ────────────────────────────────────────────────
const routes = [
  { path: '/login', component: LoginPage, meta: { public: true } },
  {
    path: '/', component: AppLayout,
    children: [
      { path: 'dashboard', component: DashboardPage },
      { path: 'sessions', component: SessionsPage },
      { path: 'employees', component: EmployeesPage },
      { path: 'training', component: TrainingPage },
      { path: 'cameras', component: CamerasPage },
      { path: 'reports', component: ReportsPage },
      { path: 'settings', component: SettingsPage },
      { path: 'profile', component: ProfilePage },
      { path: '403', component: ForbiddenPage },
    ]
  },
  { path: '/:pathMatch(.*)*', component: NotFoundPage },
];

const router = createRouter({ history: createWebHashHistory(), routes });

router.beforeEach((to, from, next) => {
  const auth = useAuth();
  if (to.meta.public) { next(); return; }
  if (!auth.isAuthenticated) { next('/login'); return; }
  const page = to.path.split('/')[1];
  if (page && !auth.canAccess(page)) { next('/403'); return; }
  next();
});

// ─── APP ───────────────────────────────────────────────────
const app = createApp({});
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.mount('#app');
