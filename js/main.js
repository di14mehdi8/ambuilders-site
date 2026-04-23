(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Intro overlay
  ------------------------------------------------------------------ */
  document.body.classList.add('intro-active');
  const intro = document.getElementById('intro');
  if (intro) {
    const release = () => {
      document.body.classList.remove('intro-active');
      intro.style.display = 'none';
    };
    intro.addEventListener('animationend', (e) => {
      if (e.animationName === 'introOut') release();
    });
    setTimeout(release, 4500);
  }

  /* ------------------------------------------------------------------
     Sticky header state
  ------------------------------------------------------------------ */
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 60) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     Mobile nav
  ------------------------------------------------------------------ */
  const toggle = document.getElementById('navToggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ------------------------------------------------------------------
     Scroll-triggered reveals
  ------------------------------------------------------------------ */
  const revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealables.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------
     Testimonial slider
  ------------------------------------------------------------------ */
  const slider = document.getElementById('tSlider');
  if (slider) {
    const slides = slider.querySelectorAll('.t-slide');
    const dots = slider.querySelectorAll('.t-dot');
    const prev = document.getElementById('tPrev');
    const next = document.getElementById('tNext');
    const count = slides.length;
    let current = 0;
    let timer = null;
    const INTERVAL = 7000;

    const go = (i) => {
      current = (i + count) % count;
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === current));
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx === current));
    };
    const start = () => {
      stop();
      timer = setInterval(() => go(current + 1), INTERVAL);
    };
    const stop = () => {
      if (timer) { clearInterval(timer); timer = null; }
    };

    prev.addEventListener('click', () => { go(current - 1); start(); });
    next.addEventListener('click', () => { go(current + 1); start(); });
    dots.forEach((d) =>
      d.addEventListener('click', () => {
        go(Number(d.dataset.dot));
        start();
      })
    );

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    // Keyboard navigation
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { go(current - 1); start(); }
      if (e.key === 'ArrowRight') { go(current + 1); start(); }
    });

    // Touch swipe
    let touchX = 0;
    slider.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; stop(); }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
      start();
    });

    // Only autoplay when user hasn't requested reduced motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) start();
  }

  /* ------------------------------------------------------------------
     Video fallback — pause on data-saver / reduced motion
  ------------------------------------------------------------------ */
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.pause();
    }
  }

  /* ------------------------------------------------------------------
     Footer year
  ------------------------------------------------------------------ */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
