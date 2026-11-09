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

/* Highlight the navigation item for the section currently below the fixed header. */
const navigationLinks = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]'));
const navigationSections = [...new Set(navigationLinks.map((link) => link.getAttribute('href').slice(1)))]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

const syncActiveNavigation = () => {
    if (!navigationSections.length) return;

    const headerHeight = header?.getBoundingClientRect().height ?? 0;
    const marker = headerHeight + 2;
    let activeSection = navigationSections[0];

    for (const section of navigationSections) {
        if (section.getBoundingClientRect().top <= marker) activeSection = section;
        else break;
    }

    // At the very bottom, the final section can be shorter than the viewport.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        activeSection = navigationSections[navigationSections.length - 1];
    }

    navigationLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${activeSection.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    });
};

if (navigationSections.length) {
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver(syncActiveNavigation, {
            rootMargin: '-15% 0px -65% 0px',
            threshold: 0,
        });
        navigationSections.forEach((section) => sectionObserver.observe(section));
    }

    window.addEventListener('scroll', syncActiveNavigation, { passive: true });
    window.addEventListener('resize', syncActiveNavigation);
    window.addEventListener('hashchange', syncActiveNavigation);
    syncActiveNavigation();
}

/* Independent gallery carousel: one-photo steps with native scroll snapping. */
const gallery = document.querySelector('[data-gallery-carousel]');
if (gallery) {
    const viewport = gallery.querySelector('[data-gallery-viewport]');
    const photos = Array.from(viewport.querySelectorAll('figure'));
    const controls = gallery.querySelector('[data-gallery-controls]');
    const previous = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let timer = null;
    let visible = true;
    let hovering = false;
    let interacting = false;

    const visibleCount = () => {
        if (!photos.length) return 0;
        const gap = parseFloat(getComputedStyle(viewport).columnGap) || 0;
        const width = photos[0].getBoundingClientRect().width;
        return Math.max(1, Math.round((viewport.clientWidth + gap) / (width + gap)));
    };
    const maxIndex = () => Math.max(0, photos.length - visibleCount());
    const stop = () => {
        if (timer !== null) clearInterval(timer);
        timer = null;
    };
    const goTo = (requested) => {
        const max = maxIndex();
        index = requested > max ? 0 : Math.max(0, requested);
        if (!photos[index]) return;
        const left = photos[index].getBoundingClientRect().left
            - viewport.getBoundingClientRect().left + viewport.scrollLeft;
        viewport.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    };
    const start = () => {
        stop();
        if (!maxIndex() || reducedMotion.matches || document.hidden || !visible ||
            hovering || interacting || gallery.contains(document.activeElement)) return;
        timer = setInterval(() => goTo(index + 1), 4500);
    };
    const refresh = () => {
        controls.hidden = maxIndex() === 0;
        if (index > maxIndex()) goTo(maxIndex());
        start();
    };

    previous.addEventListener('click', () => { goTo(index === 0 ? maxIndex() : index - 1); start(); });
    next.addEventListener('click', () => { goTo(index + 1); start(); });
    viewport.addEventListener('scroll', () => {
        if (!photos.length) return;
        const gap = parseFloat(getComputedStyle(viewport).columnGap) || 0;
        const step = photos[0].getBoundingClientRect().width + gap;
        if (step) index = Math.min(maxIndex(), Math.max(0, Math.round(viewport.scrollLeft / step)));
    }, { passive: true });
    gallery.addEventListener('mouseenter', () => { hovering = true; stop(); });
    gallery.addEventListener('mouseleave', () => { hovering = false; start(); });
    gallery.addEventListener('focusin', stop);
    gallery.addEventListener('focusout', () => requestAnimationFrame(start));
    viewport.addEventListener('pointerdown', () => { interacting = true; stop(); });
    window.addEventListener('pointerup', () => { interacting = false; start(); });
    viewport.addEventListener('touchend', () => { interacting = false; start(); }, { passive: true });
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', refresh);
    window.addEventListener('resize', refresh);
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            start();
        }, { threshold: 0.1 });
        observer.observe(gallery);
    }
    refresh();
}

/* Reveal only when supported; without JS all content remains visible. */
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const items = Array.from(document.querySelectorAll('.reveal-item'));
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
        });
    }, { threshold: 0.08 });
    items.forEach((item) => observer.observe(item));
    document.documentElement.classList.add('js-reveal-ready');
}
