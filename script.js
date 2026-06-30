const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
let lastPhotoTrigger = null;

function openLightbox(image, trigger) {
  lastPhotoTrigger = trigger;
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
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

  if (lastPhotoTrigger) {
    lastPhotoTrigger.focus();
  }
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

  const image = trigger.querySelector("img");

  if (image) {
    openLightbox(image, trigger);
  }
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
});

function splitHeroTitle() {
  const title = document.querySelector("#hero-title");

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

function initMotion() {
  if (prefersReducedMotion || !window.gsap) {
    return;
  }

  document.documentElement.dataset.motion = "gsap";
  const heroWords = splitHeroTitle();

  gsap.from(".site-header", {
    y: -8,
    opacity: 0,
    duration: 0.45,
    ease: "power2.out",
  });

  const heroTimeline = gsap.timeline({
    defaults: {
      duration: 0.55,
      ease: "power3.out",
    },
  });

  heroTimeline
    .from(".hero-copy .eyebrow", { y: 8, opacity: 0 })
    .from(heroWords, { y: 18, opacity: 0, stagger: 0.035 }, "-=0.25")
    .from(".hero-lede", { y: 12, opacity: 0 }, "-=0.25")
    .from(".hero-actions .button", { y: 10, opacity: 0, stagger: 0.06 }, "-=0.2")
    .from(".fund-card", { y: 14, opacity: 0 }, "-=0.3");

  const revealItems = document.querySelectorAll(
    ".banner-strip img, .summary-strip, .mission-section > *, .org-grid article, .school-copy, .school-gallery, .priority-grid article, .impact-section > *, .future-grid article, .photos-section .section-heading, .photo-scroll-wrap, .contact-section > *"
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
