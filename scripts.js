/* =========================================================
   SP Projects & Togetherness — scripts.js
   ========================================================= */

// ── Sticky header shadow on scroll ──────────────────────────
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── Mobile nav toggle ────────────────────────────────────────
const menuToggle = document.getElementById('menu-toggle');
const mobileNav  = document.getElementById('mobile-nav');

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen);
    menuToggle.textContent = isOpen ? '✕' : '☰';
  });

  // Close when any mobile nav link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuToggle.textContent = '☰';
    });
  });
}

// ── Smooth scroll for in-page anchor links ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Animated stat counters (data-target attribute) ───────────
const counters = document.querySelectorAll('[data-target]');
if (counters.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter     = entry.target;
        const targetValue = +counter.dataset.target;
        let   current     = 0;
        const step        = Math.max(1, Math.floor(targetValue / 80));
        const interval    = setInterval(() => {
          current += step;
          if (current >= targetValue) { current = targetValue; clearInterval(interval); }
          counter.textContent = current;
        }, 20);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ── LIGHTBOX ─────────────────────────────────────────────────
// We use a single overlay element injected into the page so it
// works for both static gallery items AND dynamically added ones
// (project.html builds its gallery after DOMContentLoaded).

const lightboxOverlay = document.createElement('div');
lightboxOverlay.id = 'lightbox';
lightboxOverlay.innerHTML = `
  <div class="lightbox-inner">
    <button class="lightbox-close" id="lightbox-close" aria-label="Close">&times;</button>
    <img id="lightbox-image" src="" alt="Featured image">
  </div>`;
document.body.appendChild(lightboxOverlay);

const lightboxImg   = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(src) {
  if (!src) return;
  lightboxImg.src = src;
  lightboxOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxOverlay.classList.remove('active');
  document.body.style.overflow = '';
  // Clear src after transition to avoid flash of old image
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

// Close on button click
lightboxClose.addEventListener('click', closeLightbox);

// Close on backdrop click (but not on image click)
lightboxOverlay.addEventListener('click', e => {
  if (e.target === lightboxOverlay) closeLightbox();
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) closeLightbox();
});

// EVENT DELEGATION — catches clicks on gallery items added at any time,
// including ones injected by project.html's inline script.
document.addEventListener('click', e => {
  const item = e.target.closest('.gallery-item');
  if (!item) return;
  const src = item.dataset.src;
  openLightbox(src);
});

// Expose openLightbox globally so project.html inline script can use it
window.openLightbox = openLightbox;

// ── Portfolio filter tabs ─────────────────────────────────────
const filterButtons = document.querySelectorAll('.filter-button');
const portfolioGrid = document.getElementById('portfolio-grid');

if (filterButtons.length && portfolioGrid) {
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const target = button.dataset.filter;
      portfolioGrid.querySelectorAll('.project-card').forEach(card => {
        card.style.display = (target === 'all' || card.dataset.category === target) ? '' : 'none';
      });
    });
  });
}

// ── Form submission feedback ──────────────────────────────────
document.querySelectorAll('form').forEach(form => {
  const submit  = form.querySelector('button[type="submit"]');
  const origTxt = submit ? submit.textContent : '';
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!submit) return;
    submit.textContent = 'Sent! ✓';
    submit.disabled = true;
    setTimeout(() => {
      submit.textContent = origTxt;
      submit.disabled = false;
      form.reset();
    }, 2000);
  });
});
