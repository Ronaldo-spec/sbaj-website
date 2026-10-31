const carousel = document.querySelector('[data-carousel]');

if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-slide-to]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const INTERVAL_MS = 5500;
    let activeIndex = 0;
    let intervalId = null;

    const showSlide = (nextIndex) => {
        if (!slides.length) return;
        activeIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            const active = index === activeIndex;
            slide.classList.toggle('is-active', active);
            slide.setAttribute('aria-hidden', String(!active));
        });

        dots.forEach((dot, index) => {
            const active = index === activeIndex;
            dot.classList.toggle('is-active', active);
            if (active) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
        });
    };

    const stopAutoSlide = () => {
        if (intervalId !== null) window.clearInterval(intervalId);
        intervalId = null;
    };

    const startAutoSlide = () => {
        stopAutoSlide();
        if (slides.length < 2 || reducedMotion.matches || document.hidden) return;
        intervalId = window.setInterval(() => showSlide(activeIndex + 1), INTERVAL_MS);
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.slideTo));
            startAutoSlide();
        });
    });

    document.addEventListener('visibilitychange', startAutoSlide);
    reducedMotion.addEventListener('change', startAutoSlide);
    startAutoSlide();
}

const header = document.getElementById('site-header');
const toggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

const syncHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 30);
};
window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

if (toggle && mobileNav && header) {
    const closeMenu = () => {
        mobileNav.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Buka menu');
        header.classList.remove('is-menu-open');
    };

    toggle.addEventListener('click', () => {
        const willOpen = mobileNav.hidden;
        mobileNav.hidden = !willOpen;
        toggle.setAttribute('aria-expanded', String(willOpen));
        toggle.setAttribute('aria-label', willOpen ? 'Tutup menu' : 'Buka menu');
        header.classList.toggle('is-menu-open', willOpen);
    });

    mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
}
