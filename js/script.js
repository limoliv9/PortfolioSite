(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ Footer year ============ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============ Theme toggle ============ */
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  function currentTheme() {
    const stored = localStorage.getItem('ol-theme');
    if (stored) return stored;
    return 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark'
        ? '<svg width="19" height="19"><use href="#icon-sun"/></svg>'
        : '<svg width="19" height="19"><use href="#icon-moon"/></svg>';
    }
  }

  applyTheme(currentTheme());

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ol-theme', next);
    applyTheme(next);
  });

  /* ============ Boot sequence ============ */
  const bootEl = document.getElementById('boot-sequence');
  const bootTextEl = document.getElementById('boot-text');
  const bootLines = [
    '$ ssh oliver@portfolio.local',
    'access granted.',
    '$ launch portfolio --interactive',
  ];

  function skipBoot() {
    if (bootEl) { bootEl.remove(); }
    document.body.style.removeProperty('overflow');
  }

  if (!bootEl || prefersReducedMotion || sessionStorage.getItem('ol-booted')) {
    skipBoot();
  } else {
    document.body.style.overflow = 'hidden';
    let li = 0, ci = 0;
    let buffer = '';

    function typeBootLine() {
      if (li >= bootLines.length) {
        sessionStorage.setItem('ol-booted', '1');
        setTimeout(() => {
          bootEl.classList.add('is-hidden');
          document.body.style.removeProperty('overflow');
          setTimeout(() => bootEl.remove(), 350);
        }, 150);
        return;
      }
      const line = bootLines[li];
      if (ci <= line.length) {
        bootTextEl.textContent = buffer + line.slice(0, ci) + (ci % 2 === 0 ? '_' : '');
        ci++;
        setTimeout(typeBootLine, 6 + Math.random() * 8);
      } else {
        buffer += line + '\n';
        bootTextEl.textContent = buffer;
        li++;
        ci = 0;
        setTimeout(typeBootLine, 70);
      }
    }
    typeBootLine();

    bootEl.addEventListener('click', () => {
      sessionStorage.setItem('ol-booted', '1');
      bootEl.classList.add('is-hidden');
      document.body.style.removeProperty('overflow');
      setTimeout(() => bootEl.remove(), 350);
    });
  }

  /* ============ Mobile nav ============ */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  navToggle?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.innerHTML = isOpen
      ? '<svg width="22" height="22"><use href="#icon-close"/></svg>'
      : '<svg width="22" height="22"><use href="#icon-menu"/></svg>';
  });

  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
      if (navToggle) navToggle.innerHTML = '<svg width="22" height="22"><use href="#icon-menu"/></svg>';
    });
  });

  /* ============ Header scroll state + progress bar ============ */
  const header = document.getElementById('site-header');
  const progressBar = document.getElementById('nav-progress');

  function onScroll() {
    const scrollTop = window.scrollY;
    header?.classList.toggle('is-scrolled', scrollTop > 8);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============ Scrollspy ============ */
  const sections = [...document.querySelectorAll('main section[id]')];
  const navAnchors = [...document.querySelectorAll('[data-nav]')];

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => spyObserver.observe(s));

  /* ============ Scroll reveal ============ */
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), i % 6 * 60);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ============ Typewriter ============ */
  const typewriterEl = document.getElementById('typewriter');
  const phrases = [
    'Vendor Risk Analyst.',
    'Cybersecurity Practitioner.',
    'Automation Builder.',
    'Aspiring Penetration Tester.'
  ];

  if (typewriterEl) {
    if (prefersReducedMotion) {
      typewriterEl.textContent = phrases[0];
    } else {
      let phraseIndex = 0, charIndex = 0, deleting = false;

      function tick() {
        const phrase = phrases[phraseIndex];
        if (!deleting) {
          charIndex++;
          typewriterEl.textContent = phrase.slice(0, charIndex);
          if (charIndex === phrase.length) {
            deleting = true;
            setTimeout(tick, 1600);
            return;
          }
        } else {
          charIndex--;
          typewriterEl.textContent = phrase.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
          }
        }
        setTimeout(tick, deleting ? 35 : 65);
      }
      tick();
    }
  }

  /* ============ Stat counters ============ */
  const statEls = document.querySelectorAll('.stat-num');

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (prefersReducedMotion) { el.textContent = target; return; }
    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => statObserver.observe(el));

  /* ============ Timeline dot icons ============ */
  const iconMap = { briefcase: 'icon-briefcase', users: 'icon-users', cap: 'icon-cap' };
  document.querySelectorAll('.timeline-dot[data-icon]').forEach(dot => {
    const key = dot.getAttribute('data-icon');
    const iconId = iconMap[key];
    if (iconId) dot.innerHTML = `<svg width="18" height="18"><use href="#${iconId}"/></svg>`;
  });

  /* ============ Skills filter tabs ============ */
  const skillTabs = document.querySelectorAll('.skill-tab');
  const tags = document.querySelectorAll('#skills-cloud .tag');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const cat = tab.getAttribute('data-cat');
      tags.forEach(tag => {
        const match = cat === 'all' || tag.getAttribute('data-cat') === cat;
        tag.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ============ Back to top ============ */
  document.getElementById('back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ============ Contact form (mailto handoff, no backend) ============ */
  const form = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      formNote.textContent = 'Please fill in every field before sending.';
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:lim.oliv9@gmail.com?subject=${subject}&body=${body}`;
    formNote.textContent = 'Opening your email client — thanks for reaching out!';
    form.reset();
  });

  /* ============ Cursor glow ============ */
  const glow = document.querySelector('.cursor-glow');
  if (glow && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  /* ============ Hero network canvas ============ */
  const canvas = document.getElementById('network-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, nodes = [];
    const NODE_COUNT = 46;
    const LINK_DIST = 130;

    function getAccentColor() {
      const theme = root.getAttribute('data-theme');
      return theme === 'dark' ? '57, 255, 136' : '10, 143, 82';
    }

    function resize() {
      const hero = canvas.parentElement;
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
    }

    function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      const rgb = getAccentColor();

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(${rgb}, ${0.16 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.fillStyle = `rgba(${rgb}, 0.55)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(step);
    }

    resize();
    initNodes();
    requestAnimationFrame(step);
    window.addEventListener('resize', () => { resize(); }, { passive: true });
  }

  /* ============ Matrix rain canvas ============ */
  const rainCanvas = document.getElementById('matrix-rain');
  if (rainCanvas && !prefersReducedMotion) {
    const rctx = rainCanvas.getContext('2d');
    const GLYPHS = 'アイウエオカキクケコサシスセソ01アカサタナ$#{}<>/\\;:'.split('');
    const FONT_SIZE = 15;
    let rw, rh, columns, drops;

    function rainResize() {
      const hero = rainCanvas.parentElement;
      rw = rainCanvas.width = hero.offsetWidth;
      rh = rainCanvas.height = hero.offsetHeight;
      columns = Math.floor(rw / FONT_SIZE);
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    }

    function rainStep() {
      rctx.fillStyle = 'rgba(3, 6, 4, 0.14)';
      rctx.fillRect(0, 0, rw, rh);
      rctx.font = `${FONT_SIZE}px ${getComputedStyle(document.body).getPropertyValue('--font-mono') || 'monospace'}`;

      for (let i = 0; i < columns; i++) {
        const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;
        rctx.fillStyle = 'rgba(57, 255, 136, 0.75)';
        rctx.fillText(char, x, y);
        if (y > rh && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      requestAnimationFrame(rainStep);
    }

    rainResize();
    requestAnimationFrame(rainStep);
    window.addEventListener('resize', () => { rainResize(); }, { passive: true });
  }

  /* ============ Occasional glitch on hero name ============ */
  const glitchEl = document.querySelector('.glitch');
  if (glitchEl && !prefersReducedMotion) {
    setInterval(() => {
      glitchEl.classList.add('is-glitching');
      setTimeout(() => glitchEl.classList.remove('is-glitching'), 220);
    }, 5000 + Math.random() * 3000);
  }

  /* ============ Occasional glitch on photos ============ */
  const photoGlitchEls = document.querySelectorAll('.hero-photo-frame, .about-photo, .timeline-photo');
  if (!prefersReducedMotion) {
    photoGlitchEls.forEach((el, i) => {
      setInterval(() => {
        el.classList.add('is-glitching');
        setTimeout(() => el.classList.remove('is-glitching'), 500);
      }, 4500 + i * 900 + Math.random() * 3500);
    });
  }

})();
