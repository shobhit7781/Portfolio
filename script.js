
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
  if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
  window.scrollTo(0, 0);

  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
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
      // close mobile menu if open
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
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
    { selector: '.col-purple', target: 6,    suffix: '+',    startDelay: 520 },
    { selector: '.col-pink',   target: 8,    suffix: 'mo+',  startDelay: 600 },
    { selector: '.col-teal',   target: 99.6, suffix: '',     startDelay: 680 },
  ];
  let statsAnimated = false;
  const statsObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || statsAnimated) return;
    statsAnimated = true;
    statDefs.forEach(({ selector, target, suffix, startDelay }) => {
      const el = document.querySelector(`.hero-stat-num${selector}`);
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
