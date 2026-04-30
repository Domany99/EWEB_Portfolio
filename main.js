/**
 * main.js
 * Portfolio – Scroll Reveal & Interaktionen
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initNavHighlight();
    initHamburgerMenu();
});

/* ═══════════════════════════════════════════
   Scroll Reveal
   Elemente mit der Klasse .reveal werden beim
   Scrollen sanft eingeblendet.
   ═══════════════════════════════════════════ */

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Gestaffeltes Einblenden
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 120);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    reveals.forEach((el) => observer.observe(el));
}

/* ═══════════════════════════════════════════
   Active Nav Highlight
   Markiert den aktuellen Navigationslink
   basierend auf der Scroll-Position.
   ═══════════════════════════════════════════ */

function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');

                    navLinks.forEach((link) => {
                        link.style.color = '';
                        if (link.getAttribute('href') === `#${id}`) {
                            link.style.color = 'var(--accent)';
                        }
                    });
                }
            });
        },
        {
            rootMargin: '-40% 0px -55% 0px',
        }
    );

    sections.forEach((section) => observer.observe(section));
}

/* ═══════════════════════════════════════════
   Hamburger Menu
   Öffnet/schliesst die Navigation auf
   kleinen Bildschirmen.
   ═══════════════════════════════════════════ */

function initHamburgerMenu() {
    const hamburger = document.querySelector('.nav-hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Menü schliessen wenn ein Link geklickt wird
    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
}