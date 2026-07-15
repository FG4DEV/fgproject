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

// ── Form submission feedback & contact handling ───────────────
document.querySelectorAll('form').forEach(form => {
  const submit  = form.querySelector('button[type="submit"]');
  const origTxt = submit ? submit.textContent : '';

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!submit) return;

    // If this is the contact form, perform basic validation and open mail client
    if (form.id === 'contact-form') {
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const phone = form.querySelector('#phone').value.trim();
      const subject = form.querySelector('#subject').value.trim() || 'Website enquiry';
      const message = form.querySelector('#message').value.trim();
      const consent = form.querySelector('#consent').checked;

      const feedback = document.getElementById('contact-feedback');
      feedback.textContent = '';

      // Basic validation
      if (!name || !email || !message || !consent) {
        feedback.textContent = 'Please complete all required fields marked with * and provide consent.';
        return;
      }
      // Simple email check
      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailIsValid) { feedback.textContent = 'Please provide a valid email address.'; return; }
      // Minimal phone check (digits and plus/minus/space)
      if (phone && !/^[0-9+()\-\s]{6,}$/.test(phone)) { feedback.textContent = 'Please provide a valid phone number or leave it blank.'; return; }

      // Build a mailto link so the user's default mail client can be used.
      const bodyLines = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        '',
        `Message:\n${message}`
      ];
      const body = encodeURIComponent(bodyLines.join('\n'));
      const mailto = `mailto:petrosmaphumulos@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

      // Provide UI feedback and attempt to open mail client
      submit.textContent = 'Preparing message...';
      submit.disabled = true;
      window.location.href = mailto;

      setTimeout(() => {
        submit.textContent = origTxt;
        submit.disabled = false;
        form.reset();
        if (feedback) feedback.textContent = 'Your enquiry has been prepared in your email client. If it did not open, please send your enquiry to petrosmaphumulos@gmail.com.';
      }, 1800);

      return;
    }

    // Generic form behaviour for other forms: visual sent feedback
    submit.textContent = 'Sent! ✓';
    submit.disabled = true;
    setTimeout(() => {
      submit.textContent = origTxt;
      submit.disabled = false;
      form.reset();
    }, 2000);
  });
});

// Floating label helpers: keep label floated when input/select/textarea has value
function updateFloatingState(el) {
  const group = el.closest('.input-group');
  if (!group) return;
  const val = (el.value || '').trim();
  if (val) group.classList.add('has-value'); else group.classList.remove('has-value');
}

document.querySelectorAll('.input-group input, .input-group textarea, .input-group select').forEach(el => {
  // Initialize state
  updateFloatingState(el);
  // Update on input/change
  el.addEventListener('input', () => updateFloatingState(el));
  el.addEventListener('change', () => updateFloatingState(el));
  // On blur also update (covers autofill)
  el.addEventListener('blur', () => updateFloatingState(el));
});

// ── Code Protection (End-to-End) ──────────────────────────────
(function() {
  // Disable right-click context menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });

  // Disable selecting text
  document.addEventListener('selectstart', function(e) {
    e.preventDefault();
  });

  // Disable copy and cut
  document.addEventListener('copy', function(e) {
    e.preventDefault();
  });
  document.addEventListener('cut', function(e) {
    e.preventDefault();
  });

  // Disable dragging of images and other elements
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });

  // Disable DevTools shortcuts
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
    }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
      e.preventDefault();
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
      e.preventDefault();
    }
    // Ctrl+S (Save Page)
    if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
      e.preventDefault();
    }
    // Ctrl+P (Print Page)
    if (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
      e.preventDefault();
    }
  });
})();
