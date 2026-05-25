// Dezentes Partikelfeld nur für die Hero-Section.
// Feine Punkte, die sich leicht zum Cursor neigen.
// Liegt hinter dem Inhalt (pointer-events: none), respektiert
// prefers-reduced-motion und pausiert bei unsichtbarem Tab.

(function () {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Bewegung reduzieren? Dann statisches Feld, keine Animation.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Canvas anlegen und in die Hero einfügen
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-particles';
    hero.prepend(canvas);
    const ctx = canvas.getContext('2d');

    // Akzentfarbe aus den CSS-Variablen lesen (bleibt konsistent mit dem Design)
    const accent = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent').trim() || '#2d5a27';

    let width, height, dpr;
    let particles = [];
    const mouse = { x: -9999, y: -9999, active: false };

    // Partikelanzahl an die Fläche koppeln, aber deckeln
    function particleCount() {
        const area = width * height;
        return Math.min(150, Math.max(30, Math.floor(area / 16000)));
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = hero.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initParticles();
    }

    function initParticles() {
        particles = [];
        const n = particleCount();
        for (let i = 0; i < n; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                // Ausgangsposition merken, damit Partikel zurückdriften
                baseX: 0,
                baseY: 0,
                r: Math.random() * 1.6 + 0.6,
                // leichte Eigenbewegung
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                alpha: Math.random() * 0.35 + 0.15,
            });
        }
        particles.forEach((p) => { p.baseX = p.x; p.baseY = p.y; });
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        for (const p of particles) {
            if (mouse.active) {
                // Sanftes Neigen ZUM Cursor (kein Wegstoßen)
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.hypot(dx, dy);
                const radius = 180;
                if (dist < radius) {
                    const pull = (1 - dist / radius) * 0.04;
                    p.x += dx * pull;
                    p.y += dy * pull;
                }
            }

            // Eigenbewegung + leichtes Zurückdriften zur Ausgangslage
            p.x += p.vx;
            p.y += p.vy;
            p.x += (p.baseX - p.x) * 0.008;
            p.y += (p.baseY - p.y) * 0.008;

            // an den Rändern sanft umkehren
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(accent, p.alpha);
            ctx.fill();
        }
    }

    function hexToRgba(hex, a) {
        const h = hex.replace('#', '');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    let rafId = null;
    let running = false;

    function loop() {
        draw();
        rafId = requestAnimationFrame(loop);
    }

    function start() {
        if (running) return;
        running = true;
        loop();
    }

    function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
    }

    // Mausposition relativ zur Hero
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    });
    hero.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    // Bei unsichtbarem Tab pausieren (spart Akku/CPU)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else if (!reduceMotion) start();
    });

    window.addEventListener('resize', resize);

    // Init
    resize();
    if (reduceMotion) {
        draw(); // einmal statisch zeichnen
    } else {
        start();
    }
})();