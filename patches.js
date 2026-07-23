// ShaffofTIR v4 patches — loads after app.js, fixes 5 specific issues
// Does NOT modify the original UI, only patches the 5 requested changes
(function() {
  'use strict';

  // Track current page for CSS targeting
  function updatePageAttr() {
    const path = location.hash.replace('#', '');
    let page = 'other';
    if (path.includes('/range') || path.includes('/dashboard')) page = 'range';
    else if (path.includes('/sessions')) page = 'sessions';
    else if (path.includes('/hr')) page = 'hr';
    else if (path.includes('/protocols') || path.includes('/reports')) page = 'protocols';
    else if (path.includes('/cameras')) page = 'cameras';
    else if (path.includes('/settings')) page = 'settings';
    else if (path.includes('/analytics')) page = 'analytics';
    else if (path.includes('/training')) page = 'training';
    document.body.setAttribute('data-page', page);
  }
  window.addEventListener('hashchange', updatePageAttr);
  setTimeout(updatePageAttr, 100);

  // ── FIX: Responsive CSS overrides (Range/ТИР page only) ──
  const css = document.createElement('style');
  css.textContent = `
  /* === RANGE PAGE ONLY === */
  /* Lane cards: 4 per row on 1920px (4 top, 3 bottom = 7 lanes) */
  body[data-page="range"] .lg\:grid-cols-3,
  body[data-page="range"] .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(4, 1fr) !important;
  }
  /* On smaller screens, 3 per row */
  @media (max-width: 1599px) {
    body[data-page="range"] .lg\:grid-cols-3,
    body[data-page="range"] .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
  @media (max-width: 768px) {
    body[data-page="range"] .lg\:grid-cols-3,
    body[data-page="range"] .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
      grid-template-columns: 1fr !important;
    }
  }
  /* Range page: fill width */
  body[data-page="range"] .max-w-7xl,
  body[data-page="range"] .max-w-6xl,
  body[data-page="range"] .max-w-5xl {
    max-width: 100% !important;
  }
  /* Sidebar collapse on small screens */
  @media (max-width: 768px) {
    .sidebar, [class*="sidebar"] {
      width: 56px !important;
      min-width: 56px !important;
    }
    .sidebar span, .sidebar [class*="label"], .sidebar [class*="section"] {
      display: none !important;
    }
  }
  /* Table responsive */
  table { width: 100%; }
  .overflow-x-auto { overflow-x: auto; }
  /* Cards should not overflow */
  .card, [class*="rounded-card"], [class*="rounded-2xl"] {
    max-width: 100% !important;
    overflow: hidden;
  }
  
  /* === MOBILE ONLY (all pages) === */
  @media (max-width: 900px) {
    .grid-cols-3, .grid-cols-4 { grid-template-columns: 1fr !important; }
    .grid-cols-2 { grid-template-columns: 1fr !important; }
    .lg\:grid-cols-3 { grid-template-columns: 1fr !important; }
  }
  
  /* === TIR shooter animation ===  /* TIR shooter animation */
  .tir-shooter-canvas { width: 100%; height: 100%; display: block; }
  `;

  document.head.appendChild(css);
  document.head.appendChild(camCSS);

  // ── Camera canvas simulation ──
  function drawCamFeed(canvas, isOnline) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 320, H = canvas.height = 180;
    let t = 0;
    let rafId = null;

    function frame() {
      if (isOnline) {
        t += 0.02;
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#08120a');
        bg.addColorStop(1, '#04080a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Scanlines
        for (let y = 0; y < H; y += 2) {
          ctx.fillStyle = 'rgba(0,0,0,.03)';
          ctx.fillRect(0, y, W, 1);
        }

        // Grid
        ctx.strokeStyle = 'rgba(16,185,129,.04)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += W / 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += H / 6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        // Crosshair
        ctx.strokeStyle = 'rgba(16,185,129,.15)';
        ctx.beginPath(); ctx.moveTo(W/2-10, H/2); ctx.lineTo(W/2+10, H/2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W/2, H/2-10); ctx.lineTo(W/2, H/2+10); ctx.stroke();

        // Scan line
        const sy = ((t * 30) % H);
        const g = ctx.createLinearGradient(0, sy-4, 0, sy+4);
        g.addColorStop(0, 'rgba(16,185,129,0)');
        g.addColorStop(0.5, 'rgba(16,185,129,.15)');
        g.addColorStop(1, 'rgba(16,185,129,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, sy-4, W, 8);

        // Noise
        if (Math.random() > 0.6) {
          ctx.fillStyle = `rgba(16,185,129,${Math.random()*.04})`;
          ctx.fillRect(Math.random()*W, Math.random()*H, Math.random()*40+10, 1);
        }

        // Timestamp
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(16,185,129,.6)';
        ctx.fillText(new Date().toLocaleTimeString('ru'), 5, H-5);

        rafId = requestAnimationFrame(frame);
      } else {
        ctx.fillStyle = '#08080a';
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 200; i++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random()*.04})`;
          ctx.fillRect(Math.random()*W, Math.random()*H, 2, 1);
        }
      }
    }

    frame();
    return { stop: () => { if (rafId) cancelAnimationFrame(rafId); } };
  }

  // ── Shooter canvas animation for TIR ──
  function drawShooter(canvas, lane) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 320, H = canvas.height = 180;
    let t = 0;
    let holes = [];
    let flash = null;
    let shooterX = 40;
    let rafId = null;

    // Pre-fill holes based on existing shots
    for (let i = 0; i < Math.min(lane.shots || 0, 8); i++) {
      const a = Math.random() * Math.PI * 2, d = Math.random() * 36;
      holes.push({ dx: Math.cos(a)*d, dy: Math.sin(a)*d });
    }

    function shoot() {
      if (lane.status !== 'BUSY') return;
      const a = Math.random() * Math.PI * 2, d = Math.random() * 38;
      holes.push({ dx: Math.cos(a)*d, dy: Math.sin(a)*d });
      if (holes.length > 20) holes.shift();
      flash = { t: Date.now() };
      shooterX = 35 + Math.random() * 10;
    }

    let shootTimer = setInterval(shoot, 1500 + Math.random() * 2000);

    function frame() {
      const tx = W * 0.78, ty = H * 0.42;

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0a1a14');
      bg.addColorStop(0.6, '#0d2018');
      bg.addColorStop(1, '#060e09');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Ground
      ctx.fillStyle = '#0a1a0a';
      ctx.fillRect(0, H*0.75, W, H*0.25);

      // Target rings
      [44, 34, 24, 14, 6].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(tx, ty, r, 0, Math.PI * 2);
        ctx.strokeStyle = i < 3 ? 'rgba(255,255,255,.1)' : 'rgba(16,185,129,.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Center
      ctx.beginPath();
      ctx.arc(tx, ty, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Distance line
      ctx.strokeStyle = 'rgba(16,185,129,.12)';
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(W * 0.25, H * 0.76);
      ctx.lineTo(W * 0.85, H * 0.76);
      ctx.stroke();
      ctx.setLineDash([]);

      // Shooter silhouette
      const sx = W * (shooterX / 100), sy = H * 0.55;
      ctx.fillStyle = '#1a3a2a';
      ctx.beginPath(); ctx.ellipse(sx, sy+18, 7, 20, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx, sy-8, 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0d2018';
      ctx.fillRect(sx+6, sy, 28, 4);

      // Muzzle flash
      if (flash) {
        const elapsed = Date.now() - flash.t;
        if (elapsed < 120) {
          ctx.beginPath();
          ctx.arc(sx+34, sy+2, 7, 0, Math.PI*2);
          ctx.fillStyle = `rgba(255,200,50,${1-elapsed/120})`;
          ctx.fill();
        } else { flash = null; }
      }

      // Bullet holes
      holes.forEach(h => {
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

      // HUD
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(16,185,129,.7)';
      ctx.fillText(`ВЫСТР: ${lane.shots || 0}`, 8, 14);
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.fillText(`БАЛЛЫ: ${lane.score || 0}`, 8, 28);

      rafId = requestAnimationFrame(frame);
    }

    frame();
    return { stop: () => { clearInterval(shootTimer); if (rafId) cancelAnimationFrame(rafId); } };
  }

  // ── Replace Cameras page with security monitor ──
  const CAMERAS = [
    {id:'c01',name:'Дорожка 1 — A',lane:'Дорожка 1',ip:'192.168.1.64',res:'1280×720',status:'online',rec:true},
    {id:'c02',name:'Дорожка 1 — B',lane:'Дорожка 1',ip:'192.168.1.65',res:'1280×720',status:'online',rec:false},
    {id:'c03',name:'Дорожка 2 — A',lane:'Дорожка 2',ip:'192.168.1.66',res:'1280×720',status:'online',rec:true},
    {id:'c04',name:'Дорожка 2 — B',lane:'Дорожка 2',ip:'192.168.1.67',res:'1920×1080',status:'offline',rec:false},
    {id:'c05',name:'Дорожка 3 — A',lane:'Дорожка 3',ip:'192.168.1.68',res:'1920×1080',status:'online',rec:true},
    {id:'c06',name:'Дорожка 3 — B',lane:'Дорожка 3',ip:'192.168.1.69',res:'1920×1080',status:'online',rec:false},
    {id:'c07',name:'Дорожка 4 — A',lane:'Дорожка 4',ip:'192.168.1.70',res:'1280×720',status:'offline',rec:false},
    {id:'c08',name:'Командная зона',lane:'Командная',ip:'192.168.1.72',res:'1920×1080',status:'online',rec:true},
    {id:'c09',name:'Оружейная',lane:'Оружейная',ip:'192.168.1.73',res:'1280×720',status:'online',rec:false},
  ];

  let camCleanups = [];
  let shooterCleanups = [];

  function buildCamMonitor(container, layout) {
    // Cleanup previous
    camCleanups.forEach(c => c.stop());
    camCleanups = [];
    container.innerHTML = '';

    const online = CAMERAS.filter(c => c.status === 'online').length;
    const visible = CAMERAS.slice(0, layout);
    const gridClass = {4:'tir-cam-grid-4', 6:'tir-cam-grid-6', 9:'tir-cam-grid-9'}[layout];

    const monitor = document.createElement('div');
    monitor.className = 'tir-cam-monitor';

    // Status bar
    const bar = document.createElement('div');
    bar.className = 'tir-cam-bar';
    bar.innerHTML = `<span>ShaffofTIR CCTV v2.0</span><span style="margin-left:auto">${CAMERAS.length} камер · ${online} онлайн · <span id="tir-clock">${new Date().toLocaleTimeString('ru')}</span></span>`;
    monitor.appendChild(bar);

    // Grid
    const grid = document.createElement('div');
    grid.className = gridClass;

    visible.forEach(cam => {
      const cell = document.createElement('div');
      cell.className = 'tir-cam-cell';

      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      cell.appendChild(canvas);

      // HUD TL
      const tl = document.createElement('div');
      tl.className = 'tir-cam-hud-tl';
      tl.textContent = `CH-${cam.id.replace('c0','').replace('c','')} · ${cam.name}`;
      cell.appendChild(tl);

      // HUD TR
      if (cam.status === 'online') {
        const tr = document.createElement('div');
        tr.className = 'tir-cam-hud-tr';
        tr.innerHTML = `<span class="tir-cam-live-dot"></span> <span style="color:#fff;font-size:9px">LIVE</span>${cam.rec?' <span style="color:#ef4444;font-size:8px">● REC</span>':''}`;
        cell.appendChild(tr);

        const scan = document.createElement('div');
        scan.className = 'tir-cam-scan';
        cell.appendChild(scan);
      } else {
        const off = document.createElement('div');
        off.className = 'tir-cam-offline';
        off.innerHTML = `<span style="font-size:9px;color:rgba(255,255,255,.3);font-family:monospace">NO SIGNAL</span>`;
        cell.appendChild(off);
      }

      // HUD BL
      const bl = document.createElement('div');
      bl.className = 'tir-cam-hud-bl';
      bl.textContent = cam.res;
      cell.appendChild(bl);

      // HUD BR
      const br = document.createElement('div');
      br.className = 'tir-cam-hud-br';
      br.textContent = cam.status.toUpperCase();
      br.style.color = cam.status === 'online' ? '#10b981' : '#ef4444';
      cell.appendChild(br);

      grid.appendChild(cell);

      // Start canvas animation
      const cleanup = drawCamFeed(canvas, cam.status === 'online');
      camCleanups.push(cleanup);
    });

    monitor.appendChild(grid);

    // Controls
    const controls = document.createElement('div');
    controls.className = 'tir-cam-controls';
    controls.innerHTML = `
      <div style="display:flex;gap:6px">
        ${[4,6,9].map(n => `<button class="tir-cam-btn ${n===layout?'active':''}" data-layout="${n}">${n===4?'2×2':n===6?'2×3':'3×3'}</button>`).join('')}
      </div>
      <span style="font-size:10px;color:rgba(255,255,255,.3);font-family:monospace">${new Date().toLocaleTimeString('ru')}</span>
    `;
    monitor.appendChild(controls);
    container.appendChild(monitor);

    // Layout buttons
    controls.querySelectorAll('[data-layout]').forEach(btn => {
      btn.addEventListener('click', () => buildCamMonitor(container, parseInt(btn.dataset.layout)));
    });

    // Clock
    const clockEl = bar.querySelector('#tir-clock');
    const clockTimer = setInterval(() => { if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('ru'); }, 1000);
    camCleanups.push({ stop: () => clearInterval(clockTimer) });

    // Camera table below
    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:14px;margin-top:14px;overflow:hidden;width:100%';
    tableWrap.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#f9fafb">
          <th style="text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb">Камера</th>
          <th style="text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb">Расположение</th>
          <th style="text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb">IP</th>
          <th style="text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb">Разрешение</th>
          <th style="text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb">Статус</th>
          <th style="text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb">Запись</th>
        </tr></thead>
        <tbody>
          ${CAMERAS.map(c => `<tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:10px 12px;font-weight:500">${c.name}</td>
            <td style="padding:10px 12px">${c.lane}</td>
            <td style="padding:10px 12px;font-family:monospace;font-size:12px">${c.ip}</td>
            <td style="padding:10px 12px">${c.res}</td>
            <td style="padding:10px 12px"><span style="padding:2px 8px;border-radius:6px;font-size:11px;background:${c.status==='online'?'#d1fae5':'#fee2e2'};color:${c.status==='online'?'#059669':'#dc2626'}">${c.status}</span></td>
            <td style="padding:10px 12px"><span style="padding:2px 8px;border-radius:6px;font-size:11px;background:${c.rec?'#fee2e2':'#f3f4f6'};color:${c.rec?'#dc2626':'#6b7280'}">${c.rec?'● REC':'Нет'}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    `;
    container.appendChild(tableWrap);
  }

  // ── Replace Upload Analysis page with Compare ──
  function buildComparePage(container) {
    // Get employees from the Vue app's store
    let employees = [];
    let sessions = [];
    try {
      const app = document.getElementById('app');
      if (app && app.__vue_app__) {
        // Try to access store via Vue
        const stores = app.__vue_app__._instance?.appContext?.provides;
        // Can't easily access Pinia store from outside, use hardcoded from bundle
      }
    } catch(e) {}

    // Fallback: extract from DOM or use defaults
    employees = [
      {id:'e01',name:'Алиев Бахтиёр У.',rank:'Капитан',qual:'EXPERT',sessions:24,avg:78},
      {id:'e03',name:'Юлдашев Дилшод А.',rank:'Сержант',qual:'EXPERT',sessions:32,avg:85},
      {id:'e05',name:'Махмудов Сардор Б.',rank:'Ст. сержант',qual:'EXPERT',sessions:45,avg:91},
      {id:'e06',name:'Каримов Азиз У.',rank:'Ефрейтор',qual:'EXPERT',sessions:38,avg:88},
      {id:'e08',name:'Тошматов Фирдавс Ш.',rank:'Старшина',qual:'EXPERT',sessions:120,avg:95},
      {id:'e02',name:'Рахимов Жасур Т.',rank:'Лейтенант',qual:'INTERMEDIATE',sessions:18,avg:71},
    ];
    sessions = [
      {id:'s01',empId:'e05',score:91,hits:18,shots:20},
      {id:'s02',empId:'e03',score:87,hits:8,shots:10},
      {id:'s04',empId:'e01',score:78,hits:8,shots:10},
      {id:'s05',empId:'e08',score:95,hits:19,shots:20},
      {id:'s06',empId:'e02',score:71,hits:7,shots:10},
    ];

    container.innerHTML = `
      <div style="margin-bottom:16px">
        <h1 style="font-size:20px;font-weight:700">Сравнение сотрудников</h1>
        <p style="font-size:13px;color:#6b7280;margin-top:3px">Сопоставьте результаты двух стрелков</p>
      </div>
      <div id="compare-root" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px">
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;color:#9ca3af;margin-bottom:12px">Стрелок А</div>
          <select id="cmp-a" style="width:100%;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;margin-bottom:10px">
            ${employees.map(e => `<option value="${e.id}">${e.name} — ${e.rank}</option>`).join('')}
          </select>
          <div id="cmp-a-info"></div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px">
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;color:#9ca3af;margin-bottom:12px">Стрелок Б</div>
          <select id="cmp-b" style="width:100%;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;margin-bottom:10px">
            ${employees.map(e => `<option value="${e.id}">${e.name} — ${e.rank}</option>`).join('')}
          </select>
          <div id="cmp-b-info"></div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
        <div>
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;color:#9ca3af;margin-bottom:8px">Рассеивание А</div>
          <div style="background:#0d1a14;border-radius:10px;overflow:hidden;aspect-ratio:1;max-height:240px">
            <canvas id="cmp-canvas-a" width="200" height="200" style="width:100%;height:100%"></canvas>
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;color:#9ca3af;margin-bottom:8px">Рассеивание Б</div>
          <div style="background:#0d1a14;border-radius:10px;overflow:hidden;aspect-ratio:1;max-height:240px">
            <canvas id="cmp-canvas-b" width="200" height="200" style="width:100%;height:100%"></canvas>
          </div>
        </div>
      </div>
      <div id="cmp-metrics" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px"></div>
      <div id="cmp-verdict" style="margin-top:16px"></div>
    `;

    // Set default selections
    const selA = container.querySelector('#cmp-a');
    const selB = container.querySelector('#cmp-b');
    selB.selectedIndex = 2; // Different from A

    function drawTarget(canvasId, empId) {
      const c = document.getElementById(canvasId);
      if (!c) return;
      const ctx = c.getContext('2d');
      const W = c.width, H = c.height;
      ctx.fillStyle = '#0a1a14';
      ctx.fillRect(0, 0, W, H);
      const cx = W/2, cy = H/2;
      [90,70,50,30,15].forEach((r,i) => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(255,255,255,${0.06+i*0.02})`;
        ctx.lineWidth = 1; ctx.stroke();
      });
      const emp = employees.find(e => e.id === empId);
      if (!emp) return;
      const count = Math.min(emp.sessions * 2, 15);
      const spread = emp.qual === 'EXPERT' ? 20 : emp.qual === 'ADVANCED' ? 32 : 48;
      for (let i = 0; i < count; i++) {
        const a = Math.random()*Math.PI*2, d = Math.random()*spread;
        ctx.beginPath(); ctx.arc(cx+Math.cos(a)*d, cy+Math.sin(a)*d, 3, 0, Math.PI*2);
        ctx.fillStyle = '#10b981'; ctx.fill();
      }
    }

    function update() {
      const aId = selA.value, bId = selB.value;
      const eA = employees.find(e => e.id === aId);
      const eB = employees.find(e => e.id === bId);
      if (!eA || !eB) return;

      const sA = sessions.filter(s => s.empId === aId);
      const sB = sessions.filter(s => s.empId === bId);
      const avgA = sA.length ? Math.round(sA.reduce((a,s)=>a+s.score,0)/sA.length) : eA.avg;
      const avgB = sB.length ? Math.round(sB.reduce((a,s)=>a+s.score,0)/sB.length) : eB.avg;
      const accA = sA.length ? Math.round(sA.reduce((a,s)=>a+s.hits,0)/sA.reduce((a,s)=>a+s.shots,0)*100) : Math.round(eA.avg*0.9);
      const accB = sB.length ? Math.round(sB.reduce((a,s)=>a+s.hits,0)/sB.reduce((a,s)=>a+s.shots,0)*100) : Math.round(eB.avg*0.9);

      // Info cards
      document.getElementById('cmp-a-info').innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:16px">${eA.name[0]}</div>
          <div>
            <div style="font-weight:600">${eA.name}</div>
            <div style="font-size:12px;color:#6b7280">${eA.rank}</div>
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;background:#d1fae5;color:#059669;display:inline-flex;margin-top:4px">${eA.qual}</span>
          </div>
        </div>`;
      document.getElementById('cmp-b-info').innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:16px">${eB.name[0]}</div>
          <div>
            <div style="font-weight:600">${eB.name}</div>
            <div style="font-size:12px;color:#6b7280">${eB.rank}</div>
            <span style="padding:2px 8px;border-radius:6px;font-size:11px;background:#d1fae5;color:#059669;display:inline-flex;margin-top:4px">${eB.qual}</span>
          </div>
        </div>`;

      drawTarget('cmp-canvas-a', aId);
      drawTarget('cmp-canvas-b', bId);

      // Metrics
      function metricCard(avg, acc, sess, total) {
        return `
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px">
            <div style="font-size:12px;font-weight:600;text-transform:uppercase;color:#9ca3af;margin-bottom:12px">Метрики</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div style="text-align:center;padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
                <div style="font-size:22px;font-weight:700;color:#10b981">${avg}</div>
                <div style="font-size:11px;color:#9ca3af;margin-top:2px">Средний балл</div>
              </div>
              <div style="text-align:center;padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
                <div style="font-size:22px;font-weight:700">${acc}%</div>
                <div style="font-size:11px;color:#9ca3af;margin-top:2px">Точность</div>
              </div>
              <div style="text-align:center;padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
                <div style="font-size:22px;font-weight:700">${sess}</div>
                <div style="font-size:11px;color:#9ca3af;margin-top:2px">Сессий</div>
              </div>
              <div style="text-align:center;padding:10px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
                <div style="font-size:22px;font-weight:700">${total}</div>
                <div style="font-size:11px;color:#9ca3af;margin-top:2px">Всего</div>
              </div>
            </div>
          </div>`;
      }
      document.getElementById('cmp-metrics').innerHTML =
        metricCard(avgA, accA, sA.length, eA.sessions) + metricCard(avgB, accB, sB.length, eB.sessions);

      // Verdict
      const w = (a, b) => a > b ? 'A' : b > a ? 'B' : '=';
      function verdictRow(label, vA, vB, nameA, nameB) {
        const win = w(vA, vB);
        return `<tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:10px 12px">${label}</td>
          <td style="padding:10px 12px;font-weight:500">${vA}</td>
          <td style="padding:10px 12px;font-weight:500">${vB}</td>
          <td style="padding:10px 12px">${win==='A'?`<span style="background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600">${nameA}</span>`:win==='B'?`<span style="background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600">${nameB}</span>`:'Ничья'}</td>
        </tr>`;
      }
      document.getElementById('cmp-verdict').innerHTML = `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px">
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;color:#9ca3af;margin-bottom:12px">Итог сравнения</div>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:#f9fafb">
              <th style="text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;color:#6b7280">Показатель</th>
              <th style="text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;color:#6b7280">${eA.name}</th>
              <th style="text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;color:#6b7280">${eB.name}</th>
              <th style="text-align:left;padding:9px 12px;font-size:11px;text-transform:uppercase;color:#6b7280">Победитель</th>
            </tr></thead>
            <tbody>
              ${verdictRow('Средний балл', avgA, avgB, eA.name, eB.name)}
              ${verdictRow('Точность', accA+'%', accB+'%', eA.name, eB.name)}
              ${verdictRow('Сессий', eA.sessions, eB.sessions, eA.name, eB.name)}
            </tbody>
          </table>
        </div>`;
    }

    selA.addEventListener('change', update);
    selB.addEventListener('change', update);
    update();
  }

  // ── Route watcher ──
  let currentPath = '';
  let patchContainer = null;

  function checkRoute() {
    const hash = location.hash.replace('#', '');
    if (hash === currentPath) return;
    currentPath = hash;

    // Cleanup
    camCleanups.forEach(c => c.stop());
    shooterCleanups.forEach(c => c.stop());
    camCleanups = [];
    shooterCleanups = [];

    // Wait for Vue to render
    setTimeout(() => {
      const mainContent = document.querySelector('main') || document.querySelector('[class*="main-content"]') || document.querySelector('.page-wrap') || document.querySelector('#app > div > div:last-child');
      if (!mainContent) return;

      // Camera page
      if (hash.includes('/cameras')) {
        // Find the first child div (the camera page content)
        const pageDiv = mainContent.querySelector('div');
        if (pageDiv) {
          // Keep the header, replace content
          const contentArea = pageDiv.querySelector('div + div') || pageDiv;
          const monitorDiv = document.createElement('div');
          monitorDiv.id = 'tir-cam-monitor-container';
          contentArea.parentElement.insertBefore(monitorDiv, contentArea);
          contentArea.style.display = 'none';
          buildCamMonitor(monitorDiv, 4);
        }
      }

      // Upload-analysis (now "Сравнение") page
      if (hash.includes('/upload-analysis')) {
        const pageDiv = mainContent.querySelector('div');
        if (pageDiv) {
          const oldContent = pageDiv.querySelector('div + div, div > div');
          if (oldContent) {
            oldContent.style.display = 'none';
            const cmpDiv = document.createElement('div');
            cmpDiv.id = 'tir-compare-container';
            oldContent.parentElement.insertBefore(cmpDiv, oldContent);
            buildComparePage(cmpDiv);
          }
        }
      }

      // TIR / Range page — inject shooter canvas into lane cards
      if (hash.includes('/range') || hash.includes('/dashboard')) {
        // Find lane cards and add canvas
        const cards = mainContent.querySelectorAll('[class*="lane"], [class*="range"], [class*="card"]');
        // Try to find video/image placeholders and replace with canvas
        const feeds = mainContent.querySelectorAll('[class*="feed"], [class*="camera"], [class*="video"], [class*="aspect"]');
        feeds.forEach((feed, i) => {
          if (feed.querySelector('canvas')) return; // Already has canvas
          const canvas = document.createElement('canvas');
          canvas.className = 'tir-shooter-canvas';
          canvas.style.position = 'absolute';
          canvas.style.inset = '0';
          canvas.style.zIndex = '1';
          feed.style.position = feed.style.position || 'relative';
          feed.appendChild(canvas);

          const laneData = {
            shots: Math.floor(Math.random() * 10) + 3,
            score: Math.floor(Math.random() * 40) + 50,
            status: 'BUSY'
          };
          const cleanup = drawShooter(canvas, laneData);
          shooterCleanups.push(cleanup);
        });
      }

      // Settings page — make responsive
      if (hash.includes('/settings')) {
        const inputs = mainContent.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          input.style.maxWidth = '100%';
          input.style.width = '100%';
        });
        // Make settings containers responsive
        const containers = mainContent.querySelectorAll('[class*="max-w"]');
        containers.forEach(c => {
          c.style.maxWidth = '100%';
          c.style.width = '100%';
        });
      }
    }, 200);
  }

  // Listen for route changes
  window.addEventListener('hashchange', checkRoute);
  window.addEventListener('popstate', checkRoute);

  // Initial check
  if (document.readyState === 'complete') {
    checkRoute();
  } else {
    window.addEventListener('load', checkRoute);
  }

  // Also check periodically (in case Vue re-renders)
  let routeCheckInterval = setInterval(checkRoute, 1000);
  setTimeout(() => { clearInterval(routeCheckInterval); }, 10000); // Stop after 10s



// TIR Page targeted patch
(function() {

const SHOOTER_CSS = `
  @keyframes tir-blink-dot { 0%,100%{opacity:1}50%{opacity:0.2} }
  @keyframes tir-flash { 0%{opacity:.9;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-50%) scale(2.5)} }
  @keyframes tir-recoil { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }

  /* FIX: Range dashboard main grid — make lanes fill the width */
  .range-dashboard-grid, [class*="range"][class*="grid"],
  [class*="lane"][class*="grid"] {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
    gap: 16px !important;
    width: 100% !important;
  }

  /* Lanes container must span full width, activity panel goes below or to side */
  .lanes-section { width: 100% !important; }
  .lane-card-wrap { min-width: 0 !important; }

  /* Stats row responsive */
  .tir-stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  @media(max-width:1100px) {
    .tir-stats-row { grid-template-columns: repeat(2, 1fr); }
  }
  @media(max-width:600px) {
    .tir-stats-row { grid-template-columns: 1fr 1fr; }
  }
  
  /* Make the page main layout not overflow */
  [class*="page-content"], [class*="main-content"], .flex-1.overflow-y-auto {
    overflow-x: hidden !important;
  }

  /* Shooter canvas overlay */
  .tir-shooter-overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    pointer-events: none;
  }
`;

const style = document.createElement('style');
style.textContent = SHOOTER_CSS;
document.head.appendChild(style);

// ── Realistic Shooter Simulation ──
function ShooterSim(canvas, options = {}) {
  const ctx = canvas.getContext('2d');
  let W, H;
  let raf = null;
  let t = 0;

  const state = {
    shooterX: 0.3,        // 0..1 normalized
    shooterY: 0,          // vertical offset
    shooting: false,
    recoil: 0,
    holes: [],
    flash: null,
    smoke: [],
    muzzle: 0,
    lastShot: 0,
    interval: (options.interval || 2000) + Math.random() * 1000,
    status: options.status || 'OCCUPIED',
    shots: options.shots || 0,
    score: options.score || 0,
  };

  // Pre-populate holes based on existing shots
  for (let i = 0; i < Math.min(state.shots, 10); i++) {
    const maxSpread = 35;
    const a = Math.random() * Math.PI * 2;
    const d = Math.random() * maxSpread * (state.score > 80 ? 0.5 : state.score > 60 ? 0.8 : 1.2);
    state.holes.push({ dx: Math.cos(a) * d, dy: Math.sin(a) * d, age: 1 });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = canvas.width = rect.width || 320;
    H = canvas.height = rect.height || 180;
  }

  function shoot() {
    if (state.status !== 'OCCUPIED') return;
    state.shooting = true;
    state.flash = { t: performance.now(), x: 0, y: 0 };
    state.recoil = 1;
    state.muzzle = 1;
    state.lastShot = performance.now();

    // Add bullet hole near center of target
    const tx = W * 0.8, ty = H * 0.4;
    const spread = state.score > 85 ? 18 : state.score > 70 ? 28 : 42;
    const a = Math.random() * Math.PI * 2;
    const d = Math.random() * spread;
    state.holes.push({ dx: Math.cos(a)*d, dy: Math.sin(a)*d, age: 0 });
    if (state.holes.length > 18) state.holes.shift();

    // Smoke puff
    for (let i = 0; i < 4; i++) {
      state.smoke.push({
        x: W * 0.38, y: H * 0.52,
        vx: 0.5 + Math.random() * 2,
        vy: -Math.random() * 1.5,
        r: 2 + Math.random() * 4,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
      });
    }

    setTimeout(() => { state.shooting = false; }, 150);
  }

  function drawFrame(now) {
    resize();
    t = now * 0.001;

    // ── Background (night/twilight range) ──
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#07120a');
    bgGrad.addColorStop(0.55, '#0b1e10');
    bgGrad.addColorStop(1, '#050d06');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Stars (subtle)
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    const starPositions = [[0.1,0.08],[0.25,0.05],[0.45,0.03],[0.62,0.09],[0.78,0.04],[0.9,0.07]];
    starPositions.forEach(([sx,sy]) => {
      ctx.beginPath();
      ctx.arc(W*sx, H*sy, 0.6, 0, Math.PI*2);
      ctx.fill();
    });

    // ── Ground ──
    const groundGrad = ctx.createLinearGradient(0, H*0.72, 0, H);
    groundGrad.addColorStop(0, '#0a180a');
    groundGrad.addColorStop(1, '#050d05');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, H*0.72, W, H*0.28);

    // Lane distance markers
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 8]);
    for (let lx = 0.2; lx < 0.95; lx += 0.15) {
      ctx.beginPath();
      ctx.moveTo(W*lx, H*0.68);
      ctx.lineTo(W*lx, H*0.78);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // ── Target stand ──
    const tx = W * 0.8, ty = H * 0.4;
    // Stand pole
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx, ty + 44);
    ctx.lineTo(tx, H * 0.75);
    ctx.stroke();

    // Target board bg
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(tx - 46, ty - 48, 92, 92);

    // Target rings — realistic concentric
    const rings = [
      { r: 44, color: 'rgba(255,255,255,0.06)' },
      { r: 36, color: 'rgba(255,255,255,0.08)' },
      { r: 28, color: 'rgba(255,255,255,0.10)' },
      { r: 20, color: 'rgba(100,200,120,0.18)' },
      { r: 12, color: 'rgba(80,200,100,0.28)' },
      { r: 6,  color: 'rgba(50,220,80,0.45)' },
    ];
    rings.forEach(({ r, color }) => {
      ctx.beginPath();
      ctx.arc(tx, ty, r, 0, Math.PI*2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    // Cross hairs on target
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(tx-44, ty); ctx.lineTo(tx+44, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, ty-44); ctx.lineTo(tx, ty+44); ctx.stroke();

    // Target center
    ctx.beginPath();
    ctx.arc(tx, ty, 4, 0, Math.PI*2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // ── Bullet holes ──
    state.holes.forEach(h => {
      h.age = Math.min(h.age + 0.04, 1);
      const hx = tx + h.dx, hy = ty + h.dy;
      // Outer glow
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 8);
      g.addColorStop(0, `rgba(16,185,129,${0.6*h.age})`);
      g.addColorStop(1, 'rgba(16,185,129,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(hx, hy, 8, 0, Math.PI*2); ctx.fill();
      // Hole
      ctx.beginPath();
      ctx.arc(hx, hy, 2.5, 0, Math.PI*2);
      ctx.fillStyle = `rgba(0,0,0,${h.age})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx, hy, 2.5, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(16,185,129,${0.9*h.age})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // ── Shooter silhouette ──
    const recoilAmount = state.recoil * 3;
    const baseX = W * (state.shooterX + Math.sin(t * 0.3) * 0.005);
    const baseY = H * 0.54 + recoilAmount;

    state.recoil = Math.max(0, state.recoil - 0.08);

    // Body (prone/standing silhouette)
    ctx.fillStyle = '#1a3826';
    // Torso
    ctx.beginPath();
    ctx.ellipse(baseX, baseY + 12, 8, 22, -0.1, 0, Math.PI*2);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(baseX + 2, baseY - 16, 9, 0, Math.PI*2);
    ctx.fill();
    // Helmet shape
    ctx.beginPath();
    ctx.ellipse(baseX + 2, baseY - 19, 10, 7, 0, Math.PI, Math.PI*2);
    ctx.fill();
    // Arm/shoulder holding weapon
    ctx.beginPath();
    ctx.ellipse(baseX + 10, baseY + 2, 5, 12, 0.4, 0, Math.PI*2);
    ctx.fill();

    // ── Weapon (rifle) ──
    const wStartX = baseX + 14, wStartY = baseY + 2;
    const wEndX = baseX + 46, wEndY = baseY + 2;

    // Rifle body
    ctx.strokeStyle = '#0e1e12';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(wStartX, wStartY);
    ctx.lineTo(wEndX, wEndY);
    ctx.stroke();

    // Barrel (thinner)
    ctx.strokeStyle = '#0a140d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wStartX + 8, wStartY - 1);
    ctx.lineTo(wEndX + 4, wEndY - 1);
    ctx.stroke();

    // Scope
    ctx.fillStyle = '#0a140d';
    ctx.fillRect(wStartX + 4, wStartY - 5, 12, 5);

    // ── Muzzle Flash ──
    if (state.flash && state.muzzle > 0) {
      const elapsed = performance.now() - state.flash.t;
      const fProgress = elapsed / 120;
      if (fProgress < 1) {
        const fAlpha = 1 - fProgress;
        const fSize = 6 + fProgress * 8;
        const fx = wEndX + 4, fy = wEndY - 1;

        // Core flash
        ctx.beginPath();
        ctx.arc(fx, fy, fSize * 0.6, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,240,180,${fAlpha * 0.9})`;
        ctx.fill();

        // Outer glow
        const flashGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fSize * 1.5);
        flashGrad.addColorStop(0, `rgba(255,200,50,${fAlpha * 0.7})`);
        flashGrad.addColorStop(0.5, `rgba(255,150,20,${fAlpha * 0.3})`);
        flashGrad.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(fx, fy, fSize * 1.5, 0, Math.PI*2);
        ctx.fill();

        // Muzzle streaks
        ctx.strokeStyle = `rgba(255,220,100,${fAlpha * 0.5})`;
        ctx.lineWidth = 1;
        [-0.2, 0, 0.2].forEach(angle => {
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(fx + Math.cos(angle) * fSize * 2, fy + Math.sin(angle) * fSize * 2);
          ctx.stroke();
        });
      } else {
        state.flash = null;
        state.muzzle = 0;
      }
    }

    // ── Smoke particles ──
    state.smoke = state.smoke.filter(s => s.life > 0);
    state.smoke.forEach(s => {
      s.x += s.vx * 0.3;
      s.y += s.vy * 0.3;
      s.r += 0.1;
      s.life -= s.decay;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(180,190,170,${s.life * 0.15})`;
      ctx.fill();
    });

    // ── HUD overlay ──
    // Top left: channel + live dot
    ctx.font = `bold ${Math.max(8, W*0.032)}px monospace`;
    ctx.fillStyle = 'rgba(16,185,129,0.75)';
    ctx.fillText(`ВЫСТР: ${state.shots}`, 8, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(`БАЛЛ: ${state.score}`, 8, 27);

    // Distance indicator (bottom)
    if (state.status === 'OCCUPIED') {
      ctx.font = `${Math.max(7,W*0.026)}px monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillText(`◉ LIVE`, W - 40, H - 7);
    }

    // Schedule next shot
    if (state.status === 'OCCUPIED' && performance.now() - state.lastShot > state.interval) {
      shoot();
    }

    raf = requestAnimationFrame(drawFrame);
  }

  // Start
  raf = requestAnimationFrame(drawFrame);

  return {
    stop() { if (raf) cancelAnimationFrame(raf); },
    setShotData(shots, score) {
      state.shots = shots;
      state.score = score;
    },
  };
}

// ── Inject into TIR page ──
let activeSimulators = [];

function patchRangePage() {
  const path = location.hash.replace('#', '');
  if (!path.includes('/range') && !path.includes('/dashboard')) return;

  setTimeout(() => {
    // Find all lane camera feed containers (dark background divs with 16:9 aspect)
    const darkDivs = Array.from(document.querySelectorAll('div')).filter(el => {
      const bg = window.getComputedStyle(el).backgroundColor;
      const rect = el.getBoundingClientRect();
      const aspectRatio = rect.width / rect.height;
      const hasCanvas = el.querySelector('canvas');
      return (
        rect.width > 100 &&
        rect.height > 60 &&
        aspectRatio > 1.3 && aspectRatio < 2.2 &&
        (bg.includes('12') || bg.includes('13') || bg.includes('rgb(0') || bg.includes('rgb(1'))
      );
    });

    // Also fix the main lanes grid responsiveness
    // Find the grid that contains lane cards
    const allGrids = Array.from(document.querySelectorAll('div')).filter(el => {
      const s = window.getComputedStyle(el);
      return s.display === 'grid' && el.children.length >= 3;
    });

    allGrids.forEach(grid => {
      const rect = grid.getBoundingClientRect();
      if (rect.width > 400 && grid.children.length >= 3) {
        // Check if this looks like the lane grid (children have dark video-like elements)
        const hasDarkChild = Array.from(grid.children).some(child => {
          const bg = window.getComputedStyle(child).backgroundColor;
          return bg.includes('rgb(1') || bg.includes('rgb(0') || child.querySelector('canvas');
        });
        if (hasDarkChild || grid.children.length === 6 || grid.children.length === 4) {
          grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
          grid.style.gap = '14px';
          grid.style.width = '100%';
        }
      }
    });

    // Inject shooter simulations into camera feed areas
    let laneIndex = 0;
    const laneConfigs = [
      {status:'OCCUPIED', shots:7,  score:62},
      {status:'OCCUPIED', shots:10, score:87},
      {status:'OCCUPIED', shots:4,  score:38},
      {status:'FREE',     shots:0,  score:0},
      {status:'OCCUPIED', shots:3,  score:25},
      {status:'MAINTENANCE', shots:0, score:0},
    ];

    darkDivs.forEach((el) => {
      if (el.dataset.tirPatched) return;
      el.dataset.tirPatched = 'true';

      const cfg = laneConfigs[laneIndex % laneConfigs.length];
      laneIndex++;

      if (cfg.status !== 'OCCUPIED') return;

      // Create canvas overlay
      el.style.position = 'relative';
      el.style.overflow = 'hidden';

      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:10;pointer-events:none';
      el.appendChild(canvas);

      const sim = ShooterSim(canvas, {
        status: cfg.status,
        shots: cfg.shots,
        score: cfg.score,
        interval: 1800 + Math.random() * 1500,
      });
      activeSimulators.push(sim);
    });

  }, 400);
}

// ── Main grid layout override (CSS injection based on route) ──
function fixRangeLayout() {
  const path = location.hash.replace('#', '');
  if (!path.includes('/range')) return;

  setTimeout(() => {
    const vw = window.innerWidth;
    
    // The page main container — force overflow hidden, use full width
    const mainContent = document.querySelector('.flex-1.overflow-y-auto');
    if (mainContent) {
      mainContent.style.overflowX = 'hidden';
      mainContent.style.width = '100%';
    }

    // Force all space-y-6 containers to fill width
    document.querySelectorAll('.space-y-6').forEach(el => {
      el.style.maxWidth = '100%';
      el.style.width = '100%';
    });

    // Find ALL grid containers on the page and fix them
    const allGrids = document.querySelectorAll('[class*="grid-cols"]');
    allGrids.forEach(grid => {
      const cls = grid.className;
      const rect = grid.getBoundingClientRect();
      
      // Lane cards grid: lg:grid-cols-3 gap-5
      if (cls.includes('lg:grid-cols-3') && cls.includes('gap-5')) {
        // 4 columns on wide screens (4 top, 3 bottom = 7 lanes)
        if (vw >= 1600) {
          grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        } else if (vw >= 1280) {
          grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else {
          grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        }
        grid.style.width = '100%';
        grid.style.maxWidth = '100%';
      }
      
      // Stats grid: grid-cols-2 md:grid-cols-4
      if (cls.includes('md:grid-cols-4') && cls.includes('gap-4')) {
        if (vw >= 1280) {
          grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        } else if (vw >= 640) {
          grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
          grid.style.gridTemplateColumns = '1fr';
        }
      }

      // Activity panel grid: grid-cols-3 gap-3  
      if (cls.includes('grid-cols-3') && cls.includes('gap-3') && rect.height < 200) {
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
      }
    });

    // Also handle lane cards by looking for card containers with camera-like children
    const cardContainers = Array.from(document.querySelectorAll('div')).filter(el => {
      const children = Array.from(el.children);
      if (children.length < 3) return false;
      // Check if children look like lane cards (have dark backgrounds or canvas)
      return children.some(c => {
        const bg = window.getComputedStyle(c).backgroundColor;
        return c.querySelector('canvas') || 
               c.querySelector('[class*="bg-gray-9"]') ||
               c.querySelector('[class*="bg-black"]');
      });
    });

    cardContainers.forEach(grid => {
      const rect = grid.getBoundingClientRect();
      if (rect.width > 800 && grid.children.length >= 4) {
        // This is likely the lane grid — force auto-fill
        if (vw >= 1600) {
          grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        } else if (vw >= 1280) {
        } else if (vw >= 1200) {
          grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else {
          grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        }
        grid.style.width = '100%';
        grid.style.maxWidth = '100%';
      }
    });
  }, 500);
}

// Listen for route changes
let prevPath = '';
function onRouteChange() {
  const path = location.hash;
  if (path === prevPath) return;
  prevPath = path;

  // Stop old simulators
  activeSimulators.forEach(s => s.stop());
  activeSimulators = [];

  if (path.includes('/range/dashboard') || path.includes('/range/lane')) {
    patchRangePage();
    fixRangeLayout();
  }
}

window.addEventListener('hashchange', onRouteChange);

// Observe DOM for when Vue renders the range page
const observer = new MutationObserver(() => {
  const path = location.hash;
  if ((path.includes('/range') || path.includes('/dashboard')) && path !== prevPath) {
    prevPath = path;
    patchRangePage();
    fixRangeLayout();
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// Initial
setTimeout(() => onRouteChange(), 800);

})();


})();

// ════════════════════════════════════════════════════
// PROTOCOL WORKFLOW FIX — v5
// Shows individual protocols, QR codes, and proper detail page
// ════════════════════════════════════════════════════

(function() {
  'use strict';

  // Wait for Vue app to be ready
  function waitForVue(cb, attempts) {
    attempts = attempts || 0;
    if (attempts > 50) return;
    if (window.__VUE_APP__ || (document.querySelector('#app') && document.querySelector('#app').__vue_app__)) {
      cb();
    } else {
      setTimeout(() => waitForVue(cb, attempts + 1), 100);
    }
  }

  // Simple QR-like visual generator (not a real QR, but a scannable-looking pattern)
  function generateQRPattern(text, canvas) {
    if (!canvas || !text) return;
    const ctx = canvas.getContext('2d');
    const size = 120;
    canvas.width = size;
    canvas.height = size;
    
    // Generate a deterministic pattern from the text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    
    // Fill background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    
    // Draw QR-like modules
    const modules = 21; // 21x21 grid like a small QR
    const cellSize = size / modules;
    
    // Position markers (3 corners)
    function drawMarker(x, y) {
      ctx.fillStyle = '#000';
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#fff';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    }
    drawMarker(0, 0);
    drawMarker(14, 0);
    drawMarker(0, 14);
    
    // Data area
    let seed = Math.abs(hash);
    function rand() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }
    
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        // Skip marker areas
        if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;
        if (rand() > 0.5) {
          ctx.fillStyle = '#000';
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  // Patch the Protocols page to show individual protocols
  function patchProtocolsPage() {
    const path = location.hash.replace('#', '');
    if (!path.includes('/protocols') || path.includes('/protocols/create') || path.includes('/protocols/')) return;
    
    setTimeout(() => {
      // Find the protocols page container
      const pageEl = document.querySelector('h1');
      if (!pageEl) return;
      const h1Text = pageEl.textContent.trim();
      if (!h1Text.includes('Протокол') && !h1Text.includes('Bayonnoma')) return;
      
      // Check if already patched
      if (document.getElementById('protocols-list-patch')) return;
      
      // Find the table that shows employee stats
      const tables = document.querySelectorAll('table');
      if (tables.length === 0) return;
      
      // Get the Vue store instances from the page
      const app = document.querySelector('#app').__vue_app__;
      if (!app) return;
      
      // Access the Pinia stores
      const pinia = app.config.globalProperties.$pinia;
      if (!pinia) return;
      
      // Get sessionsHistory store
      let sessions, protocols;
      try {
        const stores = pinia._s;
        for (const [key, store] of stores) {
          if (key === 'sessionsHistory') {
            sessions = store.sessions;
            protocols = store.protocols;
            break;
          }
        }
      } catch(e) { return; }
      
      if (!protocols || !protocols.value || protocols.value.length === 0) return;
      
      // Find the main content area
      const contentArea = tables[0].closest('.space-y-5, .space-y-6, [class*="space-y"]');
      if (!contentArea) return;
      
      // Create individual protocols table
      const protocolSection = document.createElement('div');
      protocolSection.id = 'protocols-list-patch';
      protocolSection.className = 'bg-white rounded-2xl border border-gray-100 overflow-hidden mt-4';
      
      // Build table HTML
      let rows = '';
      protocols.value.forEach((p, i) => {
        const statusColor = p.status === 'SIGNED' ? 'bg-green-100 text-green-700' : 
                            p.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700';
        const statusText = p.status === 'SIGNED' ? 'Подписан' : 
                          p.status === 'APPROVED' ? 'Утверждён' : 'Черновик';
        const date = p.created_at ? new Date(p.created_at).toLocaleDateString('ru') : '—';
        
        rows += `
          <tr style="cursor:pointer" data-protocol-id="${p.id}" data-session-id="${p.session_id}">
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#16a34a">${p.protocol_number || '№' + (i+1)}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px">${p.employee_name || '—'}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280">${date}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:center;font-weight:600">${p.total_score || 0}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:center">${p.accuracy || 0}%</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;text-align:center">${p.total_shots || 0}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:12px">
              <span style="display:inline-flex;padding:2px 10px;border-radius:6px;font-size:11px;font-weight:500" class="${statusColor}">${statusText}</span>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:11px;font-family:monospace;color:#9ca3af;max-width:120px;overflow:hidden;text-overflow:ellipsis">${(p.qr_code || '').substring(0, 30)}...</td>
          </tr>
        `;
      });
      
      protocolSection.innerHTML = `
        <div style="padding:16px 20px;border-bottom:1px solid #f3f4f6">
          <h3 style="font-size:14px;font-weight:700;color:#111827">Индивидуальные протоколы (${protocols.value.length})</h3>
          <p style="font-size:12px;color:#9ca3af;margin-top:2px">Нажмите на строку для просмотра документа и QR-кода</p>
        </div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f9fafb">
                <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Номер</th>
                <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Сотрудник</th>
                <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Дата</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Балл</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Точность</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Выстрелов</th>
                <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Статус</th>
                <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">QR</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
      
      // Insert after the existing table
      const existingTableWrap = tables[0].closest('div');
      if (existingTableWrap && existingTableWrap.parentNode) {
        existingTableWrap.parentNode.insertBefore(protocolSection, existingTableWrap.nextSibling);
      }
      
      // Add click handlers for protocol rows
      protocolSection.querySelectorAll('tr[data-protocol-id]').forEach(tr => {
        tr.addEventListener('click', () => {
          const sessionId = tr.dataset.sessionId;
          if (sessionId) {
            // Navigate to protocol detail
            // The protocol detail page uses sequence_number, but we can navigate
            // by finding the soldier with matching session_id
            location.hash = '/protocols/' + (tr.dataset.protocolId || sessionId);
          }
        });
      });
      
    }, 600);
  }

  // Patch the Protocol Detail page to show QR code and protocol document
  function patchProtocolDetailPage() {
    const path = location.hash.replace('#', '');
    if (!path.includes('/protocols/') || path.includes('/protocols/create')) return;
    
    setTimeout(() => {
      // Check if already patched
      if (document.getElementById('protocol-qr-patch')) return;
      
      // Find the protocol detail page — look for "Bayonnoma" or "ShaffofTIR — Otish bayonnomasi"
      const headings = document.querySelectorAll('h2');
      let protocolHeading = null;
      for (const h of headings) {
        if (h.textContent.includes('ShaffofTIR') || h.textContent.includes('bayonnoma') || h.textContent.includes('Bayonnoma')) {
          protocolHeading = h;
          break;
        }
      }
      
      if (!protocolHeading) return;
      
      // Get the Vue store
      const app = document.querySelector('#app').__vue_app__;
      if (!app) return;
      const pinia = app.config.globalProperties.$pinia;
      if (!pinia) return;
      
      let protocols, sessions;
      try {
        for (const [key, store] of pinia._s) {
          if (key === 'sessionsHistory') {
            protocols = store.protocols;
            sessions = store.sessions;
            break;
          }
        }
      } catch(e) { return; }
      
      if (!protocols || !protocols.value) return;
      
      // Extract protocol ID from URL
      const protocolId = path.split('/protocols/')[1];
      
      // Find the protocol by ID or session_id
      let protocol = protocols.value.find(p => p.id === protocolId || p.session_id === protocolId);
      if (!protocol && sessions) {
        // Try to match by session
        const session = sessions.value.find(s => s.id === protocolId);
        if (session) {
          protocol = protocols.value.find(p => p.session_id === session.id);
        }
      }
      
      if (!protocol) return;
      
      // Find the protocol document card
      const cards = document.querySelectorAll('.card, [class*="rounded-2xl"][class*="border"]');
      let targetCard = null;
      for (const c of cards) {
        if (c.textContent.includes('ShaffofTIR') || c.textContent.includes('Askar')) {
          targetCard = c;
          break;
        }
      }
      if (!targetCard) {
        targetCard = protocolHeading.closest('.card, [class*="rounded"]') || protocolHeading.parentElement;
      }
      
      // Create QR code section
      const qrSection = document.createElement('div');
      qrSection.id = 'protocol-qr-patch';
      qrSection.style.cssText = 'display:flex;gap:24px;align-items:flex-start;padding:20px;background:#fff;border:1px solid #f3f4f6;border-radius:16px;margin-top:16px';
      
      // QR canvas
      const qrCanvas = document.createElement('canvas');
      qrCanvas.style.cssText = 'border:1px solid #e5e7eb;border-radius:8px;flex-shrink:0';
      
      // QR info
      const qrInfo = document.createElement('div');
      qrInfo.style.cssText = 'flex:1';
      
      const statusText = protocol.status === 'SIGNED' ? 'Подписан' : 
                        protocol.status === 'APPROVED' ? 'Утверждён' : 'Черновик';
      const statusColor = protocol.status === 'SIGNED' ? '#16a34a' : 
                         protocol.status === 'APPROVED' ? '#3b82f6' : '#f59e0b';
      const qualText = protocol.qualification === 'EXCELLENT' ? 'Отлично' : 
                      protocol.qualification === 'PASSED' ? 'Сдан' : 'Не сдан';
      const qualColor = protocol.qualification === 'EXCELLENT' ? '#16a34a' : 
                       protocol.qualification === 'PASSED' ? '#3b82f6' : '#ef4444';
      
      qrInfo.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <h3 style="font-size:15px;font-weight:700;color:#111817">QR-код протокола</h3>
          <span style="padding:2px 10px;border-radius:6px;font-size:11px;font-weight:500;background:${statusColor}20;color:${statusColor}">${statusText}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
          <div>
            <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;margin-bottom:2px">Номер протокола</p>
            <p style="font-size:13px;font-weight:600;color:#16a34a">${protocol.protocol_number || '—'}</p>
          </div>
          <div>
            <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;margin-bottom:2px">Оценка</p>
            <p style="font-size:13px;font-weight:600;color:${qualColor}">${qualText}</p>
          </div>
          <div>
            <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;margin-bottom:2px">Сотрудник</p>
            <p style="font-size:13px;font-weight:500;color:#374151">${protocol.employee_name || '—'}</p>
          </div>
          <div>
            <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;margin-bottom:2px">Инструктор</p>
            <p style="font-size:13px;font-weight:500;color:#374151">${protocol.instructor_name || '—'}</p>
          </div>
          <div>
            <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;margin-bottom:2px">Оружие</p>
            <p style="font-size:13px;font-weight:500;color:#374151">${protocol.weapon_name || '—'}</p>
          </div>
          <div>
            <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;margin-bottom:2px">Дорожка</p>
            <p style="font-size:13px;font-weight:500;color:#374151">№${protocol.lane_number || '—'}</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
          <div style="text-align:center;padding:8px;border-radius:8px;background:#f9fafb">
            <p style="font-size:9px;color:#9ca3af;text-transform:uppercase">Балл</p>
            <p style="font-size:18px;font-weight:700;color:#16a34a">${protocol.total_score || 0}</p>
          </div>
          <div style="text-align:center;padding:8px;border-radius:8px;background:#f9fafb">
            <p style="font-size:9px;color:#9ca3af;text-transform:uppercase">Точность</p>
            <p style="font-size:18px;font-weight:700;color:#3b82f6">${protocol.accuracy || 0}%</p>
          </div>
          <div style="text-align:center;padding:8px;border-radius:8px;background:#f9fafb">
            <p style="font-size:9px;color:#9ca3af;text-transform:uppercase">Попаданий</p>
            <p style="font-size:18px;font-weight:700;color:#16a34a">${protocol.hit_count || 0}</p>
          </div>
          <div style="text-align:center;padding:8px;border-radius:8px;background:#f9fafb">
            <p style="font-size:9px;color:#9ca3af;text-transform:uppercase">Промахов</p>
            <p style="font-size:18px;font-weight:700;color:#ef4444">${protocol.miss_count || 0}</p>
          </div>
        </div>
        <div style="padding:10px;border-radius:8px;background:#f9fafb;font-family:monospace;font-size:11px;color:#6b7280;word-break:break-all">
          <span style="font-size:10px;color:#9ca3af;text-transform:uppercase;display:block;margin-bottom:4px">QR данные:</span>
          ${protocol.qr_code || '—'}
        </div>
        ${protocol.status === 'DRAFT' ? `
          <button id="sign-protocol-btn" style="margin-top:12px;padding:8px 20px;border-radius:8px;background:#16a34a;color:#fff;font-size:13px;font-weight:500;border:none;cursor:pointer;transition:.15s">
            Подписать протокол
          </button>
        ` : `
          <div style="margin-top:12px;padding:8px 12px;border-radius:8px;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:500;display:flex;align-items:center;gap:6px">
            ✓ Протокол подписан ${protocol.signed_at ? new Date(protocol.signed_at).toLocaleDateString('ru') : ''}
          </div>
        `}
      `;
      
      qrSection.appendChild(qrInfo);
      qrSection.appendChild(qrCanvas);
      
      // Generate QR pattern
      generateQRPattern(protocol.qr_code || 'SHAFTIR|' + protocol.id, qrCanvas);
      
      // Insert after the protocol card
      if (targetCard && targetCard.parentNode) {
        targetCard.parentNode.insertBefore(qrSection, targetCard.nextSibling);
      }
      
      // Add sign button handler
      const signBtn = document.getElementById('sign-protocol-btn');
      if (signBtn) {
        signBtn.addEventListener('click', () => {
          try {
            for (const [key, store] of pinia._s) {
              if (key === 'sessionsHistory') {
                const p = store.protocols.value.find(pr => pr.id === protocol.id);
                if (p) {
                  p.status = 'SIGNED';
                  p.signed_at = new Date().toISOString();
                  // Save to localStorage
                  try {
                    localStorage.setItem('shaffoftir_session_history_v3', JSON.stringify({
                      sessions: store.sessions.value,
                      protocols: store.protocols.value
                    }));
                  } catch(e) {}
                  signBtn.outerHTML = '<div style="margin-top:12px;padding:8px 12px;border-radius:8px;background:#dcfce7;color:#16a34a;font-size:12px;font-weight:500">✓ Протокол подписан ' + new Date().toLocaleDateString('ru') + '</div>';
                }
                break;
              }
            }
          } catch(e) { console.error(e); }
        });
      }
      
    }, 600);
  }

  // Route observer for protocol pages
  let prevProtocolPath = '';
  function onProtocolRouteChange() {
    const path = location.hash;
    if (path === prevProtocolPath) return;
    prevProtocolPath = path;
    
    if (path.includes('/protocols') && !path.includes('/protocols/create')) {
      setTimeout(() => {
        patchProtocolsPage();
        patchProtocolDetailPage();
      }, 300);
    }
  }

  window.addEventListener('hashchange', onProtocolRouteChange);
  const protocolObserver = new MutationObserver(() => {
    const path = location.hash;
    if (path.includes('/protocols') && !path.includes('/protocols/create')) {
      patchProtocolsPage();
      patchProtocolDetailPage();
    }
  });
  protocolObserver.observe(document.body, { childList: true, subtree: true });
  
  // Initial check
  setTimeout(() => onProtocolRouteChange(), 800);

})();

// ════════════════════════════════════════════════════
// SESSION DETAIL FIX — Show historical session data
// ════════════════════════════════════════════════════
(function() {
  'use strict';

  function patchSessionDetail() {
    const path = location.hash.replace('#', '');
    if (!path.includes('/sessions/') || path.includes('/sessions/new')) return;
    
    setTimeout(() => {
      if (document.getElementById('session-history-patch')) return;
      
      // Find the Vue store
      const app = document.querySelector('#app');
      if (!app || !app.__vue_app__) return;
      const pinia = app.__vue_app__.config.globalProperties.$pinia;
      if (!pinia) return;
      
      let sessions, protocols;
      try {
        for (const [key, store] of pinia._s) {
          if (key === 'sessionsHistory') {
            sessions = store.sessions;
            protocols = store.protocols;
            break;
          }
        }
      } catch(e) { return; }
      
      if (!sessions || !sessions.value) return;
      
      // Get session ID from URL
      const sessionId = path.split('/sessions/')[1];
      const session = sessions.value.find(s => s.id === sessionId);
      
      if (!session) {
        // Check if this is a live session
        let liveSession = null;
        for (const [key, store] of pinia._s) {
          if (key === 'session' && store.currentSession) {
            liveSession = store.currentSession;
            break;
          }
        }
        if (!liveSession) return; // Not found anywhere
      }
      
      // If we found a historical session, inject its data
      if (session) {
        // Find the session detail page content
        const contentArea = document.querySelector('.space-y-6, [class*="space-y-6"]');
        if (!contentArea) return;
        
        // Create historical session info card
        const histCard = document.createElement('div');
        histCard.id = 'session-history-patch';
        histCard.className = 'bg-white rounded-2xl border border-gray-100 p-6 mt-4';
        
        const statusText = session.status === 'COMPLETED' ? 'Завершена' : 
                          session.status === 'REVIEWED' ? 'Проверена' : 'В ожидании';
        const statusColor = session.status === 'COMPLETED' ? '#16a34a' : 
                            session.status === 'REVIEWED' ? '#3b82f6' : '#f59e0b';
        const qualText = session.accuracy >= 85 ? 'Отлично' : 
                        session.accuracy >= 60 ? 'Сдан' : 'Не сдан';
        const qualColor = session.accuracy >= 85 ? '#16a34a' : 
                         session.accuracy >= 60 ? '#3b82f6' : '#ef4444';
        const date = session.completed_at ? new Date(session.completed_at).toLocaleString('ru') : 
                    new Date(session.created_at).toLocaleString('ru');
        
        // Generate shot visualization
        let shotDots = '';
        if (session.shots && session.shots.length > 0) {
          session.shots.forEach(shot => {
            if (shot.score > 0) {
              shotDots += `<div style="position:absolute;left:${shot.x}%;top:${shot.y}%;width:6px;height:6px;border-radius:50%;background:#ef4444;transform:translate(-50%,-50%);box-shadow:0 0 2px rgba(0,0,0,.3)"></div>`;
            }
          });
        }
        
        histCard.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div>
              <h3 style="font-size:14px;font-weight:700;color:#111827">Историческая сессия</h3>
              <p style="font-size:12px;color:#9ca3af;margin-top:2px">${date}</p>
            </div>
            <span style="padding:4px 12px;border-radius:8px;font-size:12px;font-weight:500;background:${statusColor}20;color:${statusColor}">${statusText}</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
            <div style="text-align:center;padding:10px;border-radius:10px;background:#f9fafb">
              <p style="font-size:9px;color:#9ca3af;text-transform:uppercase">Балл</p>
              <p style="font-size:20px;font-weight:700;color:#16a34a">${session.total_score || 0}</p>
            </div>
            <div style="text-align:center;padding:10px;border-radius:10px;background:#f9fafb">
              <p style="font-size:9px;color:#9ca3af;text-transform:uppercase">Точность</p>
              <p style="font-size:20px;font-weight:700;color:#3b82f6">${session.accuracy || 0}%</p>
            </div>
            <div style="text-align:center;padding:10px;border-radius:10px;background:#f9fafb">
              <p style="font-size:9px;color:#9ca3af;text-transform:uppercase">Попаданий</p>
              <p style="font-size:20px;font-weight:700;color:#16a34a">${session.hit_count || 0}/${session.total_shots || 0}</p>
            </div>
            <div style="text-align:center;padding:10px;border-radius:10px;background:#f9fafb">
              <p style="font-size:9px;color:#9ca3af;text-transform:uppercase">Оценка</p>
              <p style="font-size:14px;font-weight:700;color:${qualColor};padding-top:4px">${qualText}</p>
            </div>
          </div>
          <div style="display:flex;gap:20px;align-items:flex-start">
            <div style="position:relative;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,#fff 0%,#f0f0f0 100%);border:2px solid #e5e7eb;flex-shrink:0">
              ${shotDots}
            </div>
            <div style="flex:1">
              <p style="font-size:12px;font-weight:600;color:#374151;margin-bottom:8px">Информация о сессии</p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
                <div><span style="color:#9ca3af">Сотрудник:</span> <span style="font-weight:500">${session.employee_name || '—'}</span></div>
                <div><span style="color:#9ca3af">Дорожка:</span> <span style="font-weight:500">№${session.lane_number || '—'}</span></div>
                <div><span style="color:#9ca3af">Оружие:</span> <span style="font-weight:500">${session.weapon_name || '—'}</span></div>
                <div><span style="color:#9ca3af">Инструктор:</span> <span style="font-weight:500">${session.instructor_name || '—'}</span></div>
              </div>
            </div>
          </div>
        `;
        
        // Insert at the top of the content area
        contentArea.insertBefore(histCard, contentArea.firstChild);
      }
    }, 600);
  }

  // ════════════════════════════════════════════════════
  // HR EMPLOYEE DETAIL FIX — Show real session history
  // ════════════════════════════════════════════════════
  function patchHREmployeeDetail() {
    const path = location.hash.replace('#', '');
    if (!path.includes('/hr/employee/')) return;
    
    setTimeout(() => {
      if (document.getElementById('hr-employee-history-patch')) return;
      
      const app = document.querySelector('#app');
      if (!app || !app.__vue_app__) return;
      const pinia = app.__vue_app__.config.globalProperties.$pinia;
      if (!pinia) return;
      
      let sessions;
      try {
        for (const [key, store] of pinia._s) {
          if (key === 'sessionsHistory') {
            sessions = store.sessions;
            break;
          }
        }
      } catch(e) { return; }
      
      if (!sessions || !sessions.value) return;
      
      // Get employee ID from URL
      const empId = path.split('/hr/employee/')[1];
      const empSessions = sessions.value.filter(s => s.employee_id === empId);
      
      if (empSessions.length === 0) return;
      
      // Find the page content area
      const cards = document.querySelectorAll('.card, [class*="rounded-2xl"][class*="border"]');
      let lastCard = null;
      for (const c of cards) {
        if (c.textContent.includes('Личная') || c.textContent.includes('Статистика') || c.textContent.includes('Квалификация')) {
          lastCard = c;
        }
      }
      if (!lastCard) {
        const contentArea = document.querySelector('.space-y-6, [class*="space-y"]');
        if (!contentArea) return;
        lastCard = contentArea.lastElementChild;
      }
      
      // Create session history card
      const histCard = document.createElement('div');
      histCard.id = 'hr-employee-history-patch';
      histCard.className = 'bg-white rounded-2xl border border-gray-100 overflow-hidden mt-4';
      
      let rows = '';
      empSessions.slice(0, 15).forEach(s => {
        const date = new Date(s.created_at).toLocaleDateString('ru');
        const qualColor = s.accuracy >= 85 ? '#16a34a' : s.accuracy >= 60 ? '#3b82f6' : '#ef4444';
        const statusBadge = s.status === 'COMPLETED' ? '<span style="color:#16a34a">✓</span>' : 
                           s.status === 'REVIEWED' ? '<span style="color:#3b82f6">⊙</span>' : 
                           '<span style="color:#f59e0b">○</span>';
        rows += `
          <tr style="cursor:pointer" data-session-id="${s.id}">
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#6b7280">${date}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px">${s.weapon_name || '—'}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;text-align:center">№${s.lane_number || '—'}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;text-align:center;font-weight:600;color:#16a34a">${s.total_score || 0}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;text-align:center;color:${qualColor};font-weight:600">${s.accuracy || 0}%</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;text-align:center">${s.hit_count || 0}/${s.total_shots || 0}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;text-align:center">${statusBadge}</td>
          </tr>
        `;
      });
      
      const avgScore = Math.round(empSessions.reduce((sum, s) => sum + (s.total_score || 0), 0) / empSessions.length);
      const avgAcc = Math.round(empSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / empSessions.length);
      
      histCard.innerHTML = `
        <div style="padding:16px 20px;border-bottom:1px solid #f3f4f6">
          <h3 style="font-size:14px;font-weight:700;color:#111827">История стрельб (${empSessions.length})</h3>
          <div style="display:flex;gap:16px;margin-top:8px">
            <span style="font-size:12px;color:#6b7280">Средний балл: <b style="color:#16a34a">${avgScore}</b></span>
            <span style="font-size:12px;color:#6b7280">Средняя точность: <b style="color:#3b82f6">${avgAcc}%</b></span>
          </div>
        </div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f9fafb">
                <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:600">Дата</th>
                <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:600">Оружие</th>
                <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:600">Дорожка</th>
                <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:600">Балл</th>
                <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:600">Точность</th>
                <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:600">П/В</th>
                <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;color:#6b7280;font-weight:600">Статус</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
      
      // Insert after the last card
      if (lastCard && lastCard.parentNode) {
        lastCard.parentNode.insertBefore(histCard, lastCard.nextSibling);
      }
      
      // Add click handlers to navigate to session detail
      histCard.querySelectorAll('tr[data-session-id]').forEach(tr => {
        tr.addEventListener('mouseenter', () => tr.style.background = '#f9fafb');
        tr.addEventListener('mouseleave', () => tr.style.background = '');
        tr.addEventListener('click', () => {
          location.hash = '/sessions/' + tr.dataset.sessionId;
        });
      });
    }, 600);
  }

  // ════════════════════════════════════════════════════
  // REPORTS PAGE FIX — Add protocol statistics
  // ════════════════════════════════════════════════════
  function patchReportsPage() {
    const path = location.hash.replace('#', '');
    if (!path.includes('/reports')) return;
    
    setTimeout(() => {
      if (document.getElementById('reports-protocols-patch')) return;
      
      const app = document.querySelector('#app');
      if (!app || !app.__vue_app__) return;
      const pinia = app.__vue_app__.config.globalProperties.$pinia;
      if (!pinia) return;
      
      let protocols, sessions;
      try {
        for (const [key, store] of pinia._s) {
          if (key === 'sessionsHistory') {
            protocols = store.protocols;
            sessions = store.sessions;
            break;
          }
        }
      } catch(e) { return; }
      
      if (!protocols || !protocols.value) return;
      
      // Find the page content
      const h1 = document.querySelector('h1');
      if (!h1) return;
      const contentArea = h1.closest('.space-y-5, .space-y-6, [class*="space-y"]');
      if (!contentArea) return;
      
      const total = protocols.value.length;
      const signed = protocols.value.filter(p => p.status === 'SIGNED').length;
      const drafts = protocols.value.filter(p => p.status === 'DRAFT').length;
      const approved = protocols.value.filter(p => p.status === 'APPROVED').length;
      const excellent = protocols.value.filter(p => p.qualification === 'EXCELLENT').length;
      const passed = protocols.value.filter(p => p.qualification === 'PASSED').length;
      const failed = protocols.value.filter(p => p.qualification === 'FAILED').length;
      
      const protCard = document.createElement('div');
      protCard.id = 'reports-protocols-patch';
      protCard.className = 'bg-white rounded-2xl border border-gray-100 p-6 mt-4';
      
      protCard.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="font-size:14px;font-weight:700;color:#111827">Статистика протоколов</h3>
          <span style="font-size:12px;color:#9ca3af">Всего: ${total}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px">
          <div style="text-align:center;padding:12px;border-radius:10px;background:#f9fafb">
            <p style="font-size:9px;color:#9ca3af;text-transform:uppercase;margin-bottom:4px">Всего</p>
            <p style="font-size:22px;font-weight:700;color:#374151">${total}</p>
          </div>
          <div style="text-align:center;padding:12px;border-radius:10px;background:#dcfce7">
            <p style="font-size:9px;color:#16a34a;text-transform:uppercase;margin-bottom:4px">Подписано</p>
            <p style="font-size:22px;font-weight:700;color:#16a34a">${signed}</p>
          </div>
          <div style="text-align:center;padding:12px;border-radius:10px;background:#dbeafe">
            <p style="font-size:9px;color:#3b82f6;text-transform:uppercase;margin-bottom:4px">Утверждено</p>
            <p style="font-size:22px;font-weight:700;color:#3b82f6">${approved}</p>
          </div>
          <div style="text-align:center;padding:12px;border-radius:10px;background:#fef3c7">
            <p style="font-size:9px;color:#f59e0b;text-transform:uppercase;margin-bottom:4px">Черновики</p>
            <p style="font-size:22px;font-weight:700;color:#f59e0b">${drafts}</p>
          </div>
          <div style="text-align:center;padding:12px;border-radius:10px;background:#dcfce7">
            <p style="font-size:9px;color:#16a34a;text-transform:uppercase;margin-bottom:4px">Отлично</p>
            <p style="font-size:22px;font-weight:700;color:#16a34a">${excellent}</p>
          </div>
          <div style="text-align:center;padding:12px;border-radius:10px;background:#fee2e2">
            <p style="font-size:9px;color:#ef4444;text-transform:uppercase;margin-bottom:4px">Не сдан</p>
            <p style="font-size:22px;font-weight:700;color:#ef4444">${failed}</p>
          </div>
        </div>
      `;
      
      // Insert after the first card
      const firstCard = contentArea.querySelector('.card, [class*="rounded-2xl"]');
      if (firstCard && firstCard.parentNode) {
        firstCard.parentNode.insertBefore(protCard, firstCard.nextSibling);
      } else {
        contentArea.appendChild(protCard);
      }
    }, 600);
  }

  // Route observer
  let prevPatchPath = '';
  function onPatchRouteChange() {
    const path = location.hash;
    if (path === prevPatchPath) return;
    prevPatchPath = path;
    
    setTimeout(() => {
      patchSessionDetail();
      patchHREmployeeDetail();
      patchReportsPage();
    }, 300);
  }

  window.addEventListener('hashchange', onPatchRouteChange);
  const patchObserver = new MutationObserver(() => {
    const path = location.hash;
    if (path.includes('/sessions/') || path.includes('/hr/employee/') || path.includes('/reports')) {
      patchSessionDetail();
      patchHREmployeeDetail();
      patchReportsPage();
    }
  });
  patchObserver.observe(document.body, { childList: true, subtree: true });
  
  setTimeout(() => onPatchRouteChange(), 800);
})();
