/* ============================================================
   KAYAL SoulPath — Global JavaScript
   Handles: Nav, scroll reveals, mobile menu, marquee,
            counters, shared utilities
   ============================================================ */

(function () {
  'use strict';

  /* ── SCROLL REVEAL ──────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ── NAV SCROLL STATE ───────────────────────────────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── NAV DROPDOWNS (desktop hover + click) ──────────────── */
  let closeTimer = null;
  document.querySelectorAll('.nav-item').forEach((item) => {
    const toggle = item.querySelector('.nav-link[data-dropdown]');
    if (!toggle) return;

    item.addEventListener('mouseenter', () => {
      clearTimeout(closeTimer);
      document.querySelectorAll('.nav-item').forEach((i) => { if (i !== item) i.classList.remove('active'); });
      item.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
    });
    item.addEventListener('mouseleave', () => {
      closeTimer = setTimeout(() => {
        item.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }, 220);
    });

    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      clearTimeout(closeTimer);
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.nav-item').forEach((i) => {
        i.classList.remove('active');
        const t = i.querySelector('.nav-link[data-dropdown]');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      if (!isActive) {
        item.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      clearTimeout(closeTimer);
      document.querySelectorAll('.nav-item').forEach((i) => {
        i.classList.remove('active');
        const t = i.querySelector('.nav-link[data-dropdown]');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      clearTimeout(closeTimer);
      document.querySelectorAll('.nav-item').forEach((i) => {
        i.classList.remove('active');
        const t = i.querySelector('.nav-link[data-dropdown]');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ── MOBILE MENU ────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileClose = document.getElementById('mobile-close');

  hamburger?.addEventListener('click', () => {
    mobileNav?.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  mobileClose?.addEventListener('click', closeMobile);
  mobileNav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMobile));

  function closeMobile() {
    mobileNav?.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* Mobile sub-menus */
  document.querySelectorAll('.nav-mobile-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sub = btn.nextElementSibling;
      sub?.classList.toggle('open');
    });
  });

  /* ── ANNOUNCEMENT BAR CLOSE ─────────────────────────────── */
  document.querySelectorAll('.announcement-bar-close').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.closest('.announcement-bar')?.remove();
    });
  });

  /* ── MARQUEE BUILD ──────────────────────────────────────── */
  const marqueeEl = document.getElementById('marquee-track');
  if (marqueeEl) {
    const items = [
      'Soul Blueprint Science',
      'Life Path Mapping',
      'Kayal LifeOS',
      'Mind Development',
      'Spirit Science',
      'Soul Contract Reading',
      'Ancestral Pattern Study',
      'Personal Year Cycles',
      'Consciousness Studies',
      'Holistic Life Synthesis',
      'Inner Compass Calibration',
      'Destiny Decoding',
    ];
    let html = '';
    for (let r = 0; r < 2; r++) {
      items.forEach((item) => {
        html += `<span class="marquee-item"><span class="marquee-dot"></span>${item}</span>`;
      });
    }
    marqueeEl.innerHTML = html;
  }

  /* ── COUNTER ANIMATION ──────────────────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.querySelector('[data-val]').textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));

  /* ── DAILY ENERGY WIDGET ────────────────────────────────── */
  const energyWidgets = document.querySelectorAll('[data-energy-widget]');
  if (energyWidgets.length) {
    const now = new Date();
    let s = 0;
    [now.getDate(), now.getMonth() + 1, now.getFullYear()].forEach((n) => {
      String(n).split('').forEach((c) => (s += +c));
    });
    while (s > 9) {
      let t = 0;
      String(s).split('').forEach((c) => (t += +c));
      s = t;
    }
    const energyNum = s || 9;

    const insights = {
      1: 'A day for initiation. Bold new starts are energetically supported.',
      2: 'A day for patience and partnership. Listen more than you speak.',
      3: 'A day for expression and connection. Create, communicate, celebrate.',
      4: 'A day for discipline. Methodical work brings lasting results today.',
      5: 'A day for change. Stay flexible — unexpected openings emerge.',
      6: 'A day for care and service. Be fully present for those around you.',
      7: 'A day for stillness. Truth arrives in the quiet of reflection.',
      8: 'A day for authority. Business and financial decisions are well-supported.',
      9: 'A day for completion. Release what no longer serves with grace.',
    };

    energyWidgets.forEach((w) => {
      const numEl = w.querySelector('[data-energy-num]');
      const insightEl = w.querySelector('[data-energy-insight]');
      const barsEl = w.querySelector('[data-energy-bars]');
      const dateEl = w.querySelector('[data-energy-date]');

      if (numEl) numEl.textContent = energyNum;
      if (insightEl) insightEl.textContent = insights[energyNum] || '';
      if (dateEl)
        dateEl.textContent = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      if (barsEl) {
        const bars = barsEl.querySelectorAll('.e-bar');
        bars.forEach((b, i) => { if (i < energyNum) b.classList.add('lit'); });
      }
    });
  }

  /* ── MOON PHASE WIDGET ──────────────────────────────────── */
  const moonWidgets = document.querySelectorAll('[data-moon-widget]');
  if (moonWidgets.length) {
    const phases = [
      { s: '🌑', n: 'New Moon', d: 'Plant seeds of intention. A fresh cycle begins.' },
      { s: '🌒', n: 'Waxing Crescent', d: 'Nurture what was begun. Build momentum with small daily actions.' },
      { s: '🌓', n: 'First Quarter', d: 'Take decisive action. Push through resistance.' },
      { s: '🌔', n: 'Waxing Gibbous', d: 'Refine and adjust. The final preparation before fullness.' },
      { s: '🌕', n: 'Full Moon', d: 'Culmination and illumination. What was planted now blooms.' },
      { s: '🌖', n: 'Waning Gibbous', d: 'Share your harvest. Express gratitude for what has manifested.' },
      { s: '🌗', n: 'Last Quarter', d: 'Release and let go. Create space for the next cycle.' },
      { s: '🌘', n: 'Waning Crescent', d: 'Rest, reflect, and integrate. Prepare the ground for new seeds.' },
    ];
    const idx = Math.floor(Date.now() / (3.69 * 24 * 3600 * 1000)) % 8;
    const ph = phases[idx];

    moonWidgets.forEach((w) => {
      const sym = w.querySelector('[data-moon-symbol]');
      const name = w.querySelector('[data-moon-name]');
      const desc = w.querySelector('[data-moon-desc]');
      if (sym) sym.textContent = ph.s;
      if (name) name.textContent = ph.n;
      if (desc) desc.textContent = ph.d;
    });
  }

  /* ── PERSONAL DAY WIDGET ────────────────────────────────── */
  document.querySelectorAll('[data-pd-form]').forEach((form) => {
    const input = form.querySelector('[data-pd-input]');
    const btn = form.querySelector('[data-pd-btn]');
    const result = form.querySelector('[data-pd-result]');
    const numEl = form.querySelector('[data-pd-num]');
    const textEl = form.querySelector('[data-pd-text]');

    const pdInsights = {
      1: "New beginnings. Start what you've been holding back.",
      2: 'Patience and connection. Reach out — do not push.',
      3: 'Express yourself. Create, communicate, celebrate.',
      4: 'Discipline. The work you do today builds tomorrow.',
      5: 'Freedom. Say yes to the unexpected.',
      6: 'Service and care. Be present for those you love.',
      7: 'Stillness. Reflect before you act.',
      8: 'Authority. Make the financial or career move you have been considering.',
      9: 'Release. Let go with grace.',
      11: 'Heightened intuition. Trust what you sense.',
      22: 'Master builder energy. Think in systems today.',
    };

    function reduce(n) {
      while (n > 9 && n !== 11 && n !== 22) {
        let t = 0;
        String(n).split('').forEach((c) => (t += +c));
        n = t;
      }
      return n;
    }

    btn?.addEventListener('click', () => {
      const val = input?.value;
      if (!val) return;
      const dob = new Date(val);
      const now = new Date();
      const pm = reduce(
        reduce(dob.getMonth() + 1) + reduce(dob.getDate()) + reduce(now.getFullYear())
      );
      const pd = reduce(pm + reduce(now.getDate()));
      if (numEl) numEl.textContent = pd;
      if (textEl) textEl.textContent = pdInsights[pd] || pdInsights[pd % 9 || 9];
      if (result) result.style.display = 'block';
    });
  });

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMobile();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── EXPOSE HELPERS GLOBALLY ────────────────────────────── */
  window.KAYAL = {
    reduce: function (n) {
      while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
        let t = 0;
        String(n).split('').forEach((c) => (t += +c));
        n = t;
      }
      return n;
    },
    lifePath: function (dob) {
      const d = new Date(dob);
      const parts = [d.getFullYear(), d.getMonth() + 1, d.getDate()];
      return this.reduce(parts.reduce((a, n) => a + this.reduce(n), 0));
    },
    pinnacles: function (dob) {
      const d = new Date(dob);
      const m = this.reduce(d.getMonth() + 1);
      const dy = this.reduce(d.getDate());
      const y = this.reduce(d.getFullYear());
      return [
        this.reduce(m + dy),
        this.reduce(dy + y),
        this.reduce(this.reduce(m + dy) + this.reduce(dy + y)),
        this.reduce(m + y),
      ];
    },
    lpDesc: {
      1: 'A natural leader with strong independence. Your path is about developing unshakeable self-confidence and originality. You are designed to stand at the front — to begin things others only imagine.',
      2: 'A peacemaker and collaborator at heart. Your path is about cooperation, diplomacy, and building lasting bridges between people. You bring harmony to every environment you enter.',
      3: 'Creative and expressive with a joyful approach to life. Your path is about communication, self-expression, and uplifting others. You have a rare gift for making the world feel lighter.',
      4: 'Practical and dedicated to building solid foundations. Your path is about discipline, hard work, and creating the structures that others depend upon. You build the things that last.',
      5: 'Adventurous and freedom-loving. Your path is about embracing change, adaptability, and experiencing life fully. You are designed to teach others that uncertainty is where life lives.',
      6: 'Nurturing and deeply responsible. Your path is about service, family, and creating environments where others can flourish. You carry others — and you are built for it.',
      7: 'The seeker. Analytical, spiritual, and with a profound need for understanding. Your path is about introspection, wisdom, and uncovering what is hidden. You ask the questions no one else thinks to ask.',
      8: 'Ambitious and powerful in the material world. Your path is about mastering authority, abundance, and the mechanics of achievement. You are built for significant material and professional accomplishment.',
      9: 'Compassionate and idealistic on a large scale. Your path is about humanitarianism, completion, and universal love. You find your truest purpose in service to something larger than yourself.',
      11: 'An intuitive and inspirational master number. You are a channel — designed to inspire, illuminate, and serve as a guiding light. Your heightened sensitivity is your greatest gift.',
      22: 'The master builder. Your path is about turning grand vision into tangible reality for the benefit of many. Few people have your capacity to operate at this scale.',
      33: 'The master teacher. Your path is about uplifting humanity through unconditional love and compassionate guidance. You carry a rare and serious responsibility.',
    },
    pinDesc: {
      1: 'A period of independence, new beginnings, and self-discovery. The energy supports bold initiative.',
      2: 'A period of cooperation and sensitivity. Relationships and partnerships are the central theme.',
      3: 'A period of creativity, self-expression, and social connection. Your gifts come forward.',
      4: 'A period of hard work and foundation-building. The structures you build now last a lifetime.',
      5: 'A period of change and freedom. Adaptability is rewarded; rigidity is challenged.',
      6: 'A period of responsibility and service. Family and community call for your attention.',
      7: 'A period of introspection and spiritual deepening. Study, solitude, and inner work.',
      8: 'A period of material achievement and authority. The energy supports significant accomplishment.',
      9: 'A period of completion, compassion, and releasing the old. A cycle nears its end.',
      11: 'A period of spiritual illumination and heightened intuition. Trust the inner voice.',
      22: 'A period of large-scale vision and master building. Your greatest work begins now.',
      33: 'A period of teaching, healing, and unconditional love. You serve at the highest level.',
    },
  };
})();
