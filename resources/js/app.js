/* SBAJ Farm: accessible carousel and responsive navigation. No libraries needed. */
const carousel = document.querySelector('[data-carousel]');

if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-slide-to]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const INTERVAL_MS = 5500;
    let activeIndex = 0;
    let intervalId = null;
    let carouselVisible = true;
    let pointerInside = false;
    let touchStart = null;

    const showSlide = (nextIndex) => {
        if (!slides.length) return;
        const index = ((nextIndex % slides.length) + slides.length) % slides.length;
        if (index === activeIndex) return;
        activeIndex = index;

        slides.forEach((slide, i) => {
            const isActive = i === activeIndex;
            slide.classList.toggle('is-active', isActive);
            slide.setAttribute('aria-hidden', String(!isActive));
        });

        dots.forEach((dot, i) => {
            const isActive = i === activeIndex;
            dot.classList.toggle('is-active', isActive);
            if (isActive) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
        });
    };

    const stopAutoSlide = () => {
        if (intervalId !== null) window.clearInterval(intervalId);
        intervalId = null;
    };

    const startAutoSlide = () => {
        stopAutoSlide();
        if (
            slides.length < 2 ||
            reducedMotion.matches ||
            document.hidden ||
            !carouselVisible ||
            pointerInside ||
            carousel.contains(document.activeElement) && document.activeElement !== document.body
        ) return;
        intervalId = window.setInterval(() => showSlide(activeIndex + 1), INTERVAL_MS);
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.slideTo));
            startAutoSlide();
        });
    });

    /* A horizontal swipe changes slides; a vertical gesture still scrolls the page. */
    carousel.addEventListener('touchstart', (event) => {
        if (event.touches.length !== 1) return;
        touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });

    carousel.addEventListener('touchend', (event) => {
        if (!touchStart || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - touchStart.x;
        const dy = event.changedTouches[0].clientY - touchStart.y;
        touchStart = null;
        if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
        showSlide(activeIndex + (dx < 0 ? 1 : -1));
        startAutoSlide();
    }, { passive: true });

    carousel.addEventListener('touchcancel', () => { touchStart = null; });
    carousel.addEventListener('mouseenter', () => { pointerInside = true; stopAutoSlide(); });
    carousel.addEventListener('mouseleave', () => { pointerInside = false; startAutoSlide(); });
    carousel.addEventListener('focusin', stopAutoSlide);
    carousel.addEventListener('focusout', () => window.requestAnimationFrame(startAutoSlide));
    document.addEventListener('visibilitychange', startAutoSlide);
    reducedMotion.addEventListener('change', startAutoSlide);

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
            carouselVisible = entry.isIntersecting;
            startAutoSlide();
        }, { threshold: 0.1 });
        observer.observe(carousel);
    }
    startAutoSlide();
}

/* The mobile navigation covers the viewport without extending past small screens. */
const header = document.getElementById('site-header');
const toggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const compactNavigation = window.matchMedia('(max-width: 1120px)');

const syncHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 30);
};
window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

if (toggle && mobileNav && header) {
    const closeMenu = (restoreFocus = false) => {
        if (mobileNav.hidden) return;
        mobileNav.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Buka menu');
        header.classList.remove('is-menu-open');
        document.body.classList.remove('menu-open');
        if (restoreFocus) toggle.focus();
    };

    const openMenu = () => {
        mobileNav.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Tutup menu');
        header.classList.add('is-menu-open');
        document.body.classList.add('menu-open');
    };

    toggle.addEventListener('click', () => {
        if (mobileNav.hidden) openMenu();
        else closeMenu();
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('pointerdown', (event) => {
        if (!header.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu(true);
    });

    compactNavigation.addEventListener('change', closeMenu);
}
