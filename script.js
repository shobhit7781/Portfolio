
const loader = document.getElementById('loader');
const minDisplay = 1400; // ms
const startTime = Date.now();

function hideLoader() {
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, minDisplay - elapsed);
  setTimeout(() => {
    loader.classList.add('hide');
    document.body.classList.remove('loading');
    setTimeout(() => loader.remove(), 520);
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
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
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
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');
  const mobLinks = document.querySelectorAll('.nav-mobile-menu a.mob-link');
  function updateActiveNav() {
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
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  document.getElementById('footer-year').textContent = new Date().getFullYear();

  const glow = document.getElementById('cursor-glow');
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });

  const heroOrb = document.querySelector('.hero-orb');
  document.addEventListener('mousemove', e => {
    const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;
    heroOrb.style.transform = `translateY(calc(-50% + ${my * 18}px)) translateX(${mx * 14}px) scale(1)`;
  });

  const scrollTopBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function countUp(el, target, suffix, duration) {
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
  const statDefs = [
    { selector: '.col-purple', target: 6,    suffix: '+' },
    { selector: '.col-pink',   target: 8,    suffix: 'mo+' },
    { selector: '.col-teal',   target: 99.6, suffix: '' },
  ];
  let statsAnimated = false;
  const statsObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || statsAnimated) return;
    statsAnimated = true;
    statDefs.forEach(({ selector, target, suffix }) => {
      const el = document.querySelector(`.hero-stat-num${selector}`);
      if (el) countUp(el, target, suffix, 1200);
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
