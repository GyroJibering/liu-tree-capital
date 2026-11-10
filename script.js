(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  const isPaused = () => userPaused || reducedMotion.matches;
  if (!reducedMotion.matches) root.classList.add('js-motion');
  const motionButton = document.querySelector('.motion-toggle');
  function syncMotion() {
    root.classList.toggle('motion-paused', isPaused());
    motionButton.setAttribute('aria-pressed', String(isPaused()));
    const zh = root.lang === 'zh-CN';
    motionButton.disabled = reducedMotion.matches;
    motionButton.setAttribute('aria-label', reducedMotion.matches ? (zh ? '已遵循系统减少动态效果设置' : 'Animations disabled by system preference') : isPaused() ? (zh ? '播放动画' : 'Play animations') : (zh ? '暂停动画' : 'Pause animations'));
  }
  motionButton.addEventListener('click', () => { userPaused = !userPaused; syncMotion(); });
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();

  const languageButton = document.querySelector('.language-toggle');
  function setLanguage(language) {
    const zh = language === 'zh';
    root.lang = zh ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-en]').forEach(el => {
      el.replaceChildren(...el.dataset[language].split('\\n').flatMap((line, i) => i ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)]));
    });
    document.querySelector('.lang-en').classList.toggle('active', !zh);
    document.querySelector('.lang-zh').classList.toggle('active', zh);
    languageButton.setAttribute('aria-label', zh ? 'Switch to English' : '切换至中文');
    syncMenuLabel();
    try { localStorage.setItem('liu-tree-language', language); } catch { /* Optional preference storage. */ }
    syncMotion();
  }
  let language = 'en';
  try { if (localStorage.getItem('liu-tree-language') === 'zh') language = 'zh'; } catch { /* Site works without storage. */ }
  setLanguage(language);
  languageButton.addEventListener('click', () => setLanguage(root.lang === 'en' ? 'zh' : 'en'));

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-nav');
  function syncMenuLabel() {
    const zh = root.lang === 'zh-CN';
    const expanded = document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'true';
    document.querySelector('.menu-toggle').setAttribute('aria-label', expanded ? (zh ? '关闭导航' : 'Close navigation') : (zh ? '打开导航' : 'Open navigation'));
  }
  function closeMenu() { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); syncMenuLabel(); }
  menuButton.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    menuButton.setAttribute('aria-expanded', String(!menu.hidden));
    syncMenuLabel();
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.site-header')) closeMenu(); });
  matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('is-visible'));

  const progress = document.querySelector('.reading-progress');
  const conviction = document.querySelector('.conviction');
  let scrollQueued = false;
  function updateScroll() {
    const range = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`;
    const rect = conviction.getBoundingClientRect();
    conviction.style.setProperty('--conviction-progress', Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height))));
    scrollQueued = false;
  }
  addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  addEventListener('resize', updateScroll);
  updateScroll();
  document.querySelector('#year').textContent = new Date().getFullYear();

  // An abstract mathematical surface; no market data or performance is represented.
  const canvas = document.querySelector('#field');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = 0, height = 0, frame = 0, time = 0, lastFrame = 0, visible = true;
  let pointerX = 0, pointerY = 0;
  let surfacePoints = [];
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  function project(u, v) {
    const bend = Math.sin(u * 2.6 + v * .9 + time * .14) * .36 + Math.cos(v * 2.5 - time * .12) * .25;
    const peak = Math.exp(-((u - .35) ** 2 * 1.3 + (v + .1) ** 2 * 1.9)) * 1.55;
    const z = bend + peak;
    const scale = Math.min(width / 2.5, height / 1.65);
    const turn = -.32 + pointerX * .025;
    const x = u * Math.cos(turn) - v * Math.sin(turn);
    const depth = u * Math.sin(turn) + v * Math.cos(turn);
    return { x: width * .76 + (x * .78 + depth * .22) * scale, y: height * .72 + (depth * .27 - z * .43 + pointerY * .015) * scale, alpha: Math.max(.12, Math.min(.8, .52 + depth * .1)) };
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const cols = width < 700 ? 49 : 68, rows = width < 700 ? 31 : 43;
    surfacePoints = [];
    for (let j = 0; j <= rows; j++) {
      const row = [];
      for (let i = 0; i <= cols; i++) row.push(project((i / cols - .5) * 3.5, (j / rows - .5) * 3.2));
      surfacePoints.push(row);
    }
    ctx.lineWidth = .55;
    surfacePoints.forEach((row, j) => {
      ctx.beginPath(); row.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.strokeStyle = `rgba(186,210,186,${.08 + j / rows * .25})`; ctx.stroke();
    });
    for (let i = 0; i <= cols; i += 2) {
      ctx.beginPath(); surfacePoints.forEach((row, j) => { const p = row[i]; if (j === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.strokeStyle = 'rgba(186,210,186,.12)'; ctx.stroke();
    }
    surfacePoints.forEach((row, j) => row.forEach((p, i) => {
      if ((i + j) % 3 !== 0) return;
      ctx.beginPath(); ctx.arc(p.x, p.y, (i + j) % 11 === 0 ? 1.25 : .65, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,233,211,${p.alpha})`; ctx.fill();
    }));
  }
  function animate(now) {
    frame = requestAnimationFrame(animate);
    if (!visible || document.hidden || isPaused() || now - lastFrame < 40) return;
    time += Math.min((now - lastFrame) / 1000, .06); lastFrame = now;
    draw();
  }
  document.querySelector('.hero').addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || isPaused()) return;
    pointerX = e.clientX / innerWidth - .5; pointerY = e.clientY / innerHeight - .5;
  }, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(canvas);
  const resizeObserver = new ResizeObserver(resizeCanvas); resizeObserver.observe(canvas);
  resizeCanvas(); frame = requestAnimationFrame(animate);
  addEventListener('pagehide', () => { cancelAnimationFrame(frame); resizeObserver.disconnect(); });
  addEventListener('pageshow', e => { if (e.persisted) { resizeObserver.observe(canvas); frame = requestAnimationFrame(animate); } });
})();
