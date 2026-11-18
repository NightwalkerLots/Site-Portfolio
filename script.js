'use strict';

// Subtle interaction without adding a second, misaligned dot/pattern layer.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(hover: none)').matches;
const cursorLight = document.getElementById('cursor-light');

if (!coarsePointer && !reducedMotion && cursorLight) {
  let currentX = -600;
  let currentY = -600;
  let targetX = -600;
  let targetY = -600;
  let frame = 0;
  let active = false;

  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX - 210;
    targetY = event.clientY - 210;
    cursorLight.style.opacity = '1';
    if (!active) {
      currentX = targetX;
      currentY = targetY;
      active = true;
    }
    if (!frame) frame = requestAnimationFrame(animateGlow);
  }, {passive: true});

  function animateGlow() {
    currentX += (targetX - currentX) * .12;
    currentY += (targetY - currentY) * .12;
    cursorLight.style.transform = `translate3d(${currentX}px,${currentY}px,0)`;
    if (Math.abs(currentX-targetX) > .25 || Math.abs(currentY-targetY) > .25) {
      frame = requestAnimationFrame(animateGlow);
    } else frame = 0;
  }

  document.addEventListener('mouseout', (event) => {
    if (!event.relatedTarget) cursorLight.style.opacity = '0';
  });

  // Low amplitude 3D feedback only for fine pointers. No large 3D tile flips.
  document.querySelectorAll('.interactive-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const r = card.getBoundingClientRect();
      const x = (event.clientX-r.left)/r.width;
      const y = (event.clientY-r.top)/r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.setProperty('--tx', `${((.5-y)*2.4).toFixed(2)}deg`);
      card.style.setProperty('--ty', `${((x-.5)*2.4).toFixed(2)}deg`);
    }, {passive: true});
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tx', '0deg');
      card.style.setProperty('--ty', '0deg');
    });
  });
}

// Accessible mobile navigation.
const menuToggle = document.getElementById('menu-toggle');
const navigation = document.getElementById('site-navigation');
function setMenuOpen(open) {
  if (!menuToggle || !navigation) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
}
if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
  document.addEventListener('pointerdown', event => {
    if (menuToggle.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) setMenuOpen(false);
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', e => {if (e.matches) setMenuOpen(false);});
}

// Keep the navigation highlight synced with the scrolled section.
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('#home, #projects, #about, #community')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const inView = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
    if (!inView) return;
    const match = navLinks.find(a => a.getAttribute('href') === '#' + inView.target.id);
    if (match) navLinks.forEach(a => a.classList.toggle('is-current', a === match));
  }, {rootMargin:'-20% 0px -55% 0px', threshold:[0,.15,.45]});
  sections.forEach(s => observer.observe(s));
}

// Preserve all three original mods but keep the screenshot's uncluttered single CTA.
const modsToggle = document.getElementById('mods-toggle');
const modsList = document.getElementById('mods-list');
if (modsToggle && modsList) {
  modsToggle.addEventListener('click', () => {
    const open = modsToggle.getAttribute('aria-expanded') !== 'true';
    modsToggle.setAttribute('aria-expanded', String(open));
    modsList.hidden = !open;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modsList.hidden) {
      modsList.hidden = true;
      modsToggle.setAttribute('aria-expanded', 'false');
      modsToggle.focus();
    }
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
