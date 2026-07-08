const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pageTransitionMs = 180;

function isInternalPageLink(link) {
  if (!link || link.target || link.hasAttribute("download")) {
    return false;
  }

  const url = new URL(link.href, window.location.href);

  if (url.origin !== window.location.origin || url.pathname === window.location.pathname) {
    return false;
  }

  return url.pathname.endsWith(".html") || url.pathname === "/" || url.pathname.endsWith("/");
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!isInternalPageLink(link) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) {
    return;
  }

  event.preventDefault();

  if (prefersReducedMotion) {
    window.location.href = link.href;
    return;
  }

  document.body.classList.add("page-leaving");
  window.setTimeout(() => {
    window.location.href = link.href;
  }, pageTransitionMs);
});

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (siteNav && navToggle) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    {
      rootMargin: "-35% 0px -50% 0px",
      threshold: [0.2, 0.45, 0.7],
    }
  );

  sections.forEach((section) => observer.observe(section));
}

const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox img");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxBackdrop = document.querySelector(".lightbox-backdrop");
const lightboxNavButtons = Array.from(document.querySelectorAll("[data-lightbox-direction]"));
let lastPhotoTrigger = null;
let activeGalleryTriggers = [];
let activePhotoIndex = 0;

function setLightboxImage(index) {
  if (!activeGalleryTriggers.length || !lightboxImage) {
    return;
  }

  activePhotoIndex = (index + activeGalleryTriggers.length) % activeGalleryTriggers.length;
  const image = activeGalleryTriggers[activePhotoIndex].querySelector("img");

  if (!image) {
    return;
  }

  lastPhotoTrigger = activeGalleryTriggers[activePhotoIndex];
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
}

function getGalleryTriggers(trigger) {
  const gallery = trigger.closest(".photo-scroll, .school-scroll");
  const scope = gallery || document;
  return Array.from(scope.querySelectorAll(".photo-trigger"));
}

function openLightbox(trigger) {
  lastPhotoTrigger = trigger;
  activeGalleryTriggers = getGalleryTriggers(trigger);
  activePhotoIndex = Math.max(0, activeGalleryTriggers.indexOf(trigger));
  setLightboxImage(activePhotoIndex);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-lightbox");
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("has-lightbox");
  lightboxImage.src = "";
  activeGalleryTriggers = [];
  activePhotoIndex = 0;

  if (lastPhotoTrigger) {
    lastPhotoTrigger.focus();
  }
}

function showAdjacentPhoto(direction) {
  if (!lightbox || !lightbox.classList.contains("is-open")) {
    return;
  }

  setLightboxImage(activePhotoIndex + direction);
}

function scrollGallery(targetId, direction) {
  const scroller = document.getElementById(targetId);

  if (!scroller) {
    return;
  }

  scroller.scrollBy({
    left: direction * Math.round(scroller.clientWidth * 0.8),
    behavior: "smooth",
  });
}

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    scrollGallery(button.dataset.scrollTarget, Number(button.dataset.scrollDirection || 1));
  });
});

document.addEventListener("click", (event) => {
  const trigger = event.target.closest(".photo-trigger");

  if (!trigger || !lightbox || !lightboxImage || !lightboxClose) {
    return;
  }

  if (trigger.querySelector("img")) {
    openLightbox(trigger);
  }
});

lightboxNavButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showAdjacentPhoto(Number(button.dataset.lightboxDirection || 1));
  });
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightboxBackdrop) {
  lightboxBackdrop.addEventListener("click", closeLightbox);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox && lightbox.classList.contains("is-open")) {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    showAdjacentPhoto(-1);
  }

  if (event.key === "ArrowRight") {
    showAdjacentPhoto(1);
  }
});

function splitTitleWords(title) {
  if (!title) {
    return [];
  }

  const words = title.textContent.trim().split(/\s+/);
  title.textContent = "";

  return words.map((word, index) => {
    const span = document.createElement("span");
    span.className = "hero-word";
    span.textContent = word;
    title.append(span);

    if (index < words.length - 1) {
      title.append(" ");
    }

    return span;
  });
}

function splitHeroTitle() {
  return splitTitleWords(document.querySelector("#hero-title"));
}

function splitPageHeroTitle() {
  return splitTitleWords(document.querySelector(".page-hero h1"));
}

function initMotion() {
  if (prefersReducedMotion || !window.gsap) {
    return;
  }

  document.documentElement.dataset.motion = "gsap";
  const heroWords = splitHeroTitle();
  const pageHeroWords = splitPageHeroTitle();

  gsap.from(".site-header", {
    y: -8,
    opacity: 0,
    duration: 0.45,
    ease: "power2.out",
  });

  if (heroWords.length) {
    const heroTimeline = gsap.timeline({
      defaults: {
        duration: 0.55,
        ease: "power3.out",
      },
    });

    heroTimeline
      .from(heroWords, { y: 18, opacity: 0, stagger: 0.035 })
      .from(".hero-lede", { y: 12, opacity: 0 }, "-=0.25")
      .from(".hero-actions .button", { y: 10, opacity: 0, stagger: 0.06 }, "-=0.2")
      .from(".fund-card", { y: 14, opacity: 0 }, "-=0.3");
  }

  if (pageHeroWords.length) {
    const pageHeroTimeline = gsap.timeline({
      defaults: {
        duration: 0.55,
        ease: "power3.out",
      },
    });

    pageHeroTimeline
      .from(".page-hero .eyebrow", { y: 8, opacity: 0 })
      .from(pageHeroWords, { y: 18, opacity: 0, stagger: 0.035 }, "-=0.2")
      .from(".page-hero p:not(.eyebrow)", { y: 12, opacity: 0 }, "-=0.25");
  }

  const revealItems = document.querySelectorAll(
    ".banner-strip img, .summary-strip, .mission-section > *, .org-grid article, .school-copy, .school-gallery, .priority-grid article, .impact-section > *, .future-grid article, .photos-section .section-heading, .photo-scroll-wrap, .contact-section > *, .team-heading, .officer-card"
  );

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        gsap.fromTo(
          entry.target,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
            clearProps: "transform,opacity",
          }
        );
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.18,
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

initMotion();

function initCountUp() {
  const counters = document.querySelectorAll("[data-countup-end]");

  if (!counters.length || prefersReducedMotion) {
    return;
  }

  const CountUpCtor = (window.countUp && window.countUp.CountUp) || window.CountUp;

  if (!CountUpCtor) {
    return;
  }

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const el = entry.target;
        const end = Number(el.dataset.countupEnd);

        const counter = new CountUpCtor(el, end, {
          duration: 1.8,
          separator: ",",
          prefix: el.dataset.countupPrefix || "",
          suffix: el.dataset.countupSuffix || "",
        });

        if (!counter.error) {
          counter.start();
        }

        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

initCountUp();
