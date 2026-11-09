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

/* Seamless gallery loop: cloned edge slides make the wrap visually continuous. */
const gallery = document.querySelector('[data-gallery-carousel]');
if (gallery) {
    const viewport = gallery.querySelector('[data-gallery-viewport]');
    const originals = Array.from(viewport.querySelectorAll('figure'));
    const pagination = gallery.querySelector('[data-gallery-pagination]');
    const previous = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const INTERVAL_MS = 4500;
    const count = originals.length;
    let position = count;
    let timer = null;
    let settleTimer = null;
    let visible = false;
    let dragging = false;
    let keyboardInteracting = false;
    let repositioning = false;

    const clone = (item) => {
        const copy = item.cloneNode(true);
        copy.removeAttribute('id');
        copy.classList.remove('reveal-item', 'is-visible');
        copy.setAttribute('aria-hidden', 'true');
        copy.setAttribute('inert', '');
        return copy;
    };
    if (count > 1) {
        originals.forEach((item) => viewport.insertBefore(clone(item), originals[0]));
        originals.forEach((item) => viewport.appendChild(clone(item)));
    }
    const slides = Array.from(viewport.querySelectorAll('figure'));
    const logicalIndex = () => count ? ((position % count) + count) % count : 0;
    const visibleCount = () => {
        if (!slides.length) return 0;
        const gap = parseFloat(getComputedStyle(viewport).columnGap) || 0;
        const width = slides[0].getBoundingClientRect().width;
        return width > 0 ? Math.max(1, Math.round((viewport.clientWidth + gap) / (width + gap))) : 1;
    };
    const enabled = () => count > visibleCount();
    const slideLeft = (i) => slides[i].getBoundingClientRect().left
        - viewport.getBoundingClientRect().left + viewport.scrollLeft;
    const stop = () => {
        if (timer !== null) clearInterval(timer);
        timer = null;
    };
    const updateDots = () => {
        pagination.querySelectorAll('button').forEach((dot, i) => {
            const active = i === logicalIndex();
            dot.classList.toggle('is-active', active);
            if (active) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
        });
    };
    const teleport = (target) => {
        repositioning = true;
        viewport.classList.add('is-repositioning');
        position = target;
        viewport.scrollTo({ left: slideLeft(position), behavior: 'instant' });
        updateDots();
        requestAnimationFrame(() => {
            viewport.classList.remove('is-repositioning');
            repositioning = false;
        });
    };
    const settle = () => {
        clearTimeout(settleTimer);
        if (!enabled() || repositioning) return;
        // The clones are visually identical to the originals at the same logical position.
        if (position >= count * 2) teleport(position - count);
        else if (position < count) teleport(position + count);
    };
    const goTo = (target) => {
        if (!enabled()) return;
        clearTimeout(settleTimer);
        position = target;
        viewport.scrollTo({
            left: slideLeft(position),
            behavior: reducedMotion.matches ? 'instant' : 'smooth',
        });
        updateDots();
        if (reducedMotion.matches) settle();
        else settleTimer = setTimeout(settle, 850);
    };
    const start = () => {
        stop();
        if (!enabled() || !visible || document.hidden || reducedMotion.matches ||
            dragging || keyboardInteracting) return;
        timer = setInterval(() => goTo(position + 1), INTERVAL_MS);
    };
    const refresh = () => {
        const active = enabled();
        previous.hidden = !active;
        next.hidden = !active;
        pagination.replaceChildren();
        if (active) {
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'gallery-dot';
                dot.setAttribute('aria-label', `Tampilkan foto galeri ${i + 1}`);
                dot.addEventListener('click', () => { goTo(count + i); start(); });
                pagination.appendChild(dot);
            }
        }
        teleport(count + logicalIndex());
        start();
    };

    previous.addEventListener('click', () => { goTo(position - 1); start(); });
    next.addEventListener('click', () => { goTo(position + 1); start(); });
    viewport.addEventListener('scroll', () => {
        if (repositioning || !enabled()) return;
        const gap = parseFloat(getComputedStyle(viewport).columnGap) || 0;
        const step = slides[0].getBoundingClientRect().width + gap;
        if (step > 0) {
            position = Math.max(0, Math.min(slides.length - 1, Math.round(viewport.scrollLeft / step)));
            updateDots();
        }
        clearTimeout(settleTimer);
        settleTimer = setTimeout(settle, 200);
    }, { passive: true });

    viewport.addEventListener('pointerdown', () => { dragging = true; stop(); });
    window.addEventListener('pointerup', () => { dragging = false; start(); });
    window.addEventListener('pointercancel', () => { dragging = false; start(); });
    gallery.addEventListener('keydown', () => { keyboardInteracting = true; stop(); });
    gallery.addEventListener('focusout', () => requestAnimationFrame(() => {
        if (!gallery.contains(document.activeElement)) {
            keyboardInteracting = false;
            start();
        }
    }));
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', refresh);
    window.addEventListener('resize', refresh);
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            start();
        }, { threshold: 0.1 });
        observer.observe(gallery);
    } else visible = true;
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
