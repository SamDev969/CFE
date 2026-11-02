
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const book = document.querySelector("main");
const bookPages = Array.from(book.children);

let pageFlip = null;

if (window.St && window.St.PageFlip && bookPages.length) {
    bookPages.forEach(function (page, index) {
        page.classList.add("page", "book-page");
        page.dataset.pageIndex = index;
        if (!page.id) {
            page.id = "page-" + (index + 1);
        }
    });

    try {
        pageFlip = new St.PageFlip(book, {
            width: 550,
            height: 760,
            size: "stretch",
            minWidth: 380,
            maxWidth: 1100,
            minHeight: 480,
            maxHeight: 1600,
            showCover: false,
            usePortrait: true,
            autoSize: true,
            drawShadow: true,
            flippingTime: 850,
            mobileScrollSupport: true,
            maxShadowOpacity: 0.35
        });
        pageFlip.loadFromHTML(bookPages);
        document.body.classList.add("book-ready");

        pageFlip.on("flip", function (event) {
            const page = bookPages[event.data];
            if (page && page.id) {
                history.replaceState(null, "", "#" + page.id);
            }
        });
    } catch (error) {
        console.error("The page-turn book could not be initialized.", error);
    }
}

function fitBookToViewport() {
    if (!pageFlip || !document.body.classList.contains("book-ready")) {
        return;
    }

    const bounds = book.getBoundingClientRect();
    const settings = pageFlip.getSettings();
    const portrait = bounds.width < settings.minWidth * 2;
    const pageWidth = Math.min(
        portrait ? bounds.width : bounds.width / 2,
        settings.maxWidth
    );
    const headerBottom = document.querySelector(".header").getBoundingClientRect().bottom;
    const availableHeight = Math.max(
        settings.minHeight,
        window.innerHeight - headerBottom - 20
    );

    settings.height = Math.min(
        settings.maxHeight,
        availableHeight * settings.width / pageWidth
    );
    pageFlip.update();
    pageFlip.getUI().setOrientationStyle(pageFlip.getOrientation());
}

if (pageFlip) {
    window.addEventListener("resize", fitBookToViewport);
    document.addEventListener("fullscreenchange", fitBookToViewport);
    pageFlip.on("init", fitBookToViewport);
    fitBookToViewport();
    window.setTimeout(fitBookToViewport, 100);
}

const contactForm = document.querySelector(".contact-form");
if (pageFlip && contactForm) {
    ["mousedown", "touchstart"].forEach(function (eventName) {
        contactForm.addEventListener(eventName, function (event) {
            event.stopPropagation();
        });
    });
}

document.addEventListener("click", function (event) {
    if (!pageFlip || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
    }

    const link = event.target.closest('a[href^="#"]');
    if (!link) {
        return;
    }

    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    const page = target && target.closest(".book-page");
    if (page) {
        event.preventDefault();
        pageFlip.flip(Number(page.dataset.pageIndex));
    }
});

if (pageFlip && window.location.hash) {
    const initialTarget = document.getElementById(
        decodeURIComponent(window.location.hash.slice(1))
    );
    const initialPage = initialTarget && initialTarget.closest(".book-page");
    if (initialPage) {
        pageFlip.turnToPage(Number(initialPage.dataset.pageIndex));
    }
}

// Open and close the mobile navigation
menuToggle.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
    );

    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close the menu when a navigation link is clicked
navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        menuToggle.textContent = "☰";
    });
});

// Display the current year in the footer
document.getElementById("year").textContent =
    new Date().getFullYear();

// Reveal content as it enters the viewport when motion is enabled.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(
    ".trust-grid > div, .about-image, .about-content, .section-heading, " +
    ".programme-card, .subject-card, .portal-banner-inner, " +
    ".benefit-grid article, .contact-info, .contact-form"
);

if (!reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(function (element) {
        element.classList.add("reveal");
        revealObserver.observe(element);
    });
}
