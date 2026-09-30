
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const loader = document.getElementById('loader');
const hero = document.getElementById('hero');
const minDisplay = prefersReducedMotion ? 0 : 1400; // ms
const startTime = Date.now();

function hideLoader() {
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, minDisplay - elapsed);
  setTimeout(() => {
    loader.classList.add('hide');
    document.body.classList.remove('loading');
    // Hero's load choreography starts as the loader fades out — one handoff, not two disconnected moments.
    hero.classList.add('hero-ready');
    setTimeout(() => loader.remove(), prefersReducedMotion ? 0 : 520);
  }, remaining);
}

if (document.readyState === 'complete') {
  hideLoader();
} else {
  window.addEventListener('load', hideLoader);
}

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const initialTarget = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
  if (initialTarget) {
    window.scrollTo({ top: initialTarget.offsetTop - 80, behavior: 'auto' });
  } else {
    window.scrollTo(0, 0);
  }
  if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);

  // :hover alone never pauses the ticker on touch devices — give them a tap-to-pause equivalent.
  const tickerStrip = document.querySelector('.ticker-strip');
  const tickerTrack = document.querySelector('.ticker-track');
  if (tickerStrip && tickerTrack) {
    tickerStrip.addEventListener('click', () => tickerTrack.classList.toggle('paused'));
  }

  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });
  // Tapping outside the open panel, or pressing Escape, should close it —
  // the hamburger toggle was previously the only way out.
  document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('open')) return;
    if (mobileMenu.contains(e.target) || hamburger.contains(e.target)) return;
    closeMobileMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobileMenu();
  });

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo({ top: el.offsetTop - 80, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      e.preventDefault();
      scrollToSection(id);
      closeMobileMenu();
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');
  const mobLinks = document.querySelectorAll('.nav-mobile-menu a.mob-link');
  const scrollTopBtn = document.getElementById('scroll-top');

  // Single rAF-throttled scroll handler drives both the active-nav state and
  // the scroll-to-top button, instead of three separate unthrottled listeners.
  let scrollTicking = false;
  function onScrollFrame() {
    const scrollY = window.scrollY;

    let current = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.dataset.section === current);
    });
    mobLinks.forEach(a => {
      const id = a.getAttribute('href').slice(1);
      a.classList.toggle('mob-active', id === current);
    });

    scrollTopBtn.classList.toggle('visible', scrollY > 400);

    scrollTicking = false;
  }
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(onScrollFrame);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScrollFrame();

  document.getElementById('footer-year').textContent = new Date().getFullYear();

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  function countUp(el, target, suffix, duration) {
    if (prefersReducedMotion) {
      const isFloat = target % 1 !== 0;
      el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
      return;
    }
    const isFloat = target % 1 !== 0;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = isFloat ? (target * ease).toFixed(1) : Math.round(target * ease);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  // startDelay mirrors the CSS transition-delay on .hero-stats > * (#hero.hero-ready rules)
  // so the counting motion is visible as each number fades in, instead of finishing while still hidden.
  const statDefs = [
    { stat: 'projects', target: 6,    suffix: '+', startDelay: 520 },
    { stat: 'jee',       target: 99.6, suffix: '',  startDelay: 680 },
  ];
  let statsAnimated = false;
  const statsObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || statsAnimated) return;
    statsAnimated = true;
    statDefs.forEach(({ stat, target, suffix, startDelay }) => {
      const el = document.querySelector(`.hero-stat-num[data-stat="${stat}"]`);
      if (el) setTimeout(() => countUp(el, target, suffix, 1200), prefersReducedMotion ? 0 : startDelay);
    });
  }, { threshold: 0.5 });
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  const observer  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));

  // Magnetic pull + 3D tilt are cursor-driven, not autoplaying, but "hover near" doesn't
  // mean anything on touch — skip both for reduced-motion and coarse/no-hover pointers.
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!prefersReducedMotion && hasFinePointer) {
    const maxPull = 10; // px
    document.querySelectorAll('.hero-ctas .btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * maxPull * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * maxPull * 2;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    const maxTilt = 6; // degrees
    document.querySelectorAll('.project-card, .cert-card, .skill-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * maxTilt * 2;
        const rotateX = (0.5 - py) * maxTilt * 2;
        card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
        card.style.boxShadow = '0 8px 24px rgba(36,26,23,0.10)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }
