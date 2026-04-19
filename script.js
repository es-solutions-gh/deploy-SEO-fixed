document.addEventListener("DOMContentLoaded", () => {
  // Initialize gtag if not already defined (for GA4 events)
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  // ====================
  // MOBILE MENU
  // ====================
  const burger = document.getElementById("burger-btn");
  const nav = document.querySelector(".nav");
  const body = document.body;

  if (burger && nav) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("open");
      body.classList.toggle("menu-open");
    });

    // Close menu when clicking on a link
    const navLinks = nav.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        body.classList.remove("menu-open");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !nav.contains(e.target) &&
        !burger.contains(e.target) &&
        nav.classList.contains("open")
      ) {
        nav.classList.remove("open");
        body.classList.remove("menu-open");
      }
    });
  }

  // ====================
  // LANGUAGE SWITCHER
  // ====================
  const langButtons = [
    {
      button: document.getElementById("current-lang"),
      menu: document.getElementById("lang-menu"),
      flag: document.getElementById("current-flag"),
      code: document.getElementById("current-code"),
    },
    {
      button: document.getElementById("current-lang-desktop"),
      menu: document.getElementById("lang-menu-desktop"),
      flag: document.getElementById("current-flag-desktop"),
      code: document.getElementById("current-code-desktop"),
    },
  ];

  const langData = {
    en: { flag: "/assets/flags/ENG.svg", code: "ENG", path: "/en/" },
    uk: { flag: "/assets/flags/UKR.svg", code: "UKR", path: "/uk/" },
    ru: { flag: "/assets/flags/RUS.svg", code: "RUS", path: "/ru/" },
  };

  // Determine current language from URL
  const currentPath = window.location.pathname;
  let currentLang = "en";
  if (currentPath.includes("/uk/")) currentLang = "uk";
  else if (currentPath.includes("/ru/")) currentLang = "ru";

  // Restore scroll position after language switch
  const savedScroll = sessionStorage.getItem('langSwitchScroll');
  if (savedScroll) {
    window.scrollTo(0, parseInt(savedScroll));
    sessionStorage.removeItem('langSwitchScroll');
  }

  langButtons.forEach(({ button, menu, flag, code }) => {
    if (!button || !menu) return;

    // Set current language
    if (flag) flag.src = langData[currentLang].flag;
    if (code) code.textContent = langData[currentLang].code;

    // Open/close menu
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("hidden");
    });

    // Language selection
    menu.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => {
        const selectedLang = li.getAttribute("data-lang");
        if (selectedLang && langData[selectedLang]) {
          // Save current scroll position
          sessionStorage.setItem('langSwitchScroll', window.scrollY.toString());

          // Extract current page filename
          const pathParts = currentPath.split('/');
          const currentPage = pathParts[pathParts.length - 1] || 'index.html';

          // Special handling for cookie policy pages
          if (currentPage.startsWith('cookie-policy')) {
            window.location.href = `/cookie-policy.${selectedLang}.html`;
            return;
          }
          // Special handling for privacy policy pages
          if (currentPage.startsWith('privacy-policy')) {
            window.location.href = `/privacy-policy.${selectedLang}.html`;
            return;
          }

          // Thank-you page: always go to language home
          if (currentPage === 'thank_you.html') {
            window.location.href = langData[selectedLang].path;
            return;
          }

          // Regular page handling
          let newPath;
          if (selectedLang === 'en') {
            newPath = currentPage === 'index.html' ? '/' : `/en/${currentPage}`;
          } else {
            newPath = `${langData[selectedLang].path}${currentPage}`;
          }

          window.location.href = newPath;
        }
      });
    });
  });

  // Close language menu when clicking outside
  document.addEventListener("click", () => {
    langButtons.forEach(({ menu }) => {
      if (menu) menu.classList.add("hidden");
    });
  });

  // ====================
  // CALENDLY WIDGET
  // ====================
  const calendlyScript = document.createElement("script");
  calendlyScript.src = "https://assets.calendly.com/assets/external/widget.js";
  calendlyScript.async = true;
  document.head.appendChild(calendlyScript);

  // ====================
  // GA4 EVENT TRACKING (Calendly & WhatsApp)
  // ====================
  // Dedupe: avoid double-send when both touchstart and click fire on mobile
  let lastCalendlyTrack = { el: null, t: 0 };
  let lastWhatsAppTrack = { el: null, t: 0 };
  const DEDUPE_MS = 600;

  function sendCalendlyEvent() {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "calendly_click", {
      event_category: "engagement",
      event_label: "Book consultation",
    });
  }

  function sendWhatsAppEvent() {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "whatsapp_click", {
      event_category: "engagement",
      event_label: "WhatsApp contact",
    });
  }

  function findCalendlyButton(target) {
    let el = target;
    while (el && el !== document) {
      if (el.onclick && el.onclick.toString().includes("Calendly")) {
        return el;
      }
      if (el.classList && el.classList.contains("cta-link")) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  function handleEngagementClick(e) {
    const calendlyEl = findCalendlyButton(e.target);
    const whatsappEl = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"]');

    if (calendlyEl) {
      const now = Date.now();
      if (lastCalendlyTrack.el === calendlyEl && now - lastCalendlyTrack.t < DEDUPE_MS) return;
      lastCalendlyTrack = { el: calendlyEl, t: now };
      sendCalendlyEvent();
    }
    if (whatsappEl) {
      const now = Date.now();
      if (lastWhatsAppTrack.el === whatsappEl && now - lastWhatsAppTrack.t < DEDUPE_MS) return;
      lastWhatsAppTrack = { el: whatsappEl, t: now };
      sendWhatsAppEvent();
    }
  }

  function handleEngagementTouchStart(e) {
    const calendlyEl = findCalendlyButton(e.target);
    const whatsappEl = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"]');

    if (calendlyEl) {
      lastCalendlyTrack = { el: calendlyEl, t: Date.now() };
      sendCalendlyEvent();
    }
    if (whatsappEl) {
      lastWhatsAppTrack = { el: whatsappEl, t: Date.now() };
      sendWhatsAppEvent();
    }
  }

  document.addEventListener("click", handleEngagementClick, true);
  document.addEventListener("touchstart", handleEngagementTouchStart, true);

  // ====================
  // ENHANCED CONVERSIONS (Google Ads) — Calendly postMessage
  // ====================
  window.addEventListener("message", function (e) {
    if (e.origin !== "https://calendly.com" && !e.origin.endsWith(".calendly.com")) return;
    if (e.data.event && e.data.event === "calendly.event_scheduled") {
      var p = e.data.payload;
      var email = (p && p.invitee && p.invitee.email) || (p && p.data && p.data.invitee && p.data.invitee.email);
      if (email && typeof window.gtag === "function") {
        window.gtag("set", "user_data", { email: email });
      }
    }
  });

  // ====================
  // PROOF CAROUSEL DOTS (Military Crisis promo page)
  // ====================
  const proofCarousel = document.querySelector(".proof-carousel");
  const proofDots = document.querySelectorAll(".proof-carousel-dot");
  if (proofCarousel && proofDots.length > 0) {
    proofDots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        const slideWidth = proofCarousel.clientWidth;
        proofCarousel.scrollTo({ left: i * slideWidth, behavior: "smooth" });
        proofDots.forEach((d) => d.classList.remove("active"));
        dot.classList.add("active");
      });
    });
    proofCarousel.addEventListener("scroll", () => {
      const scrollLeft = proofCarousel.scrollLeft;
      const slideWidth = proofCarousel.clientWidth;
      const activeIdx = slideWidth <= 0 ? 0 : Math.round(scrollLeft / slideWidth);
      proofDots.forEach((d, i) => d.classList.toggle("active", i === activeIdx));
    });
  }
});
