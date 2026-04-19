/**
 * GDPR Cookie Consent — Banner, Modal, Consent Mode v2
 * Single source of truth for all pages with gtag.js
 */
(function () {
  "use strict";

  const GA_MEASUREMENT_ID = "G-7HMEBM3RC9";

  function getLang() {
    var p = window.location.pathname;
    if (p.indexOf("/uk/") !== -1) return "uk";
    if (p.indexOf("/ru/") !== -1) return "ru";
    if (p.indexOf(".uk.") !== -1 || p.indexOf("-uk.") !== -1) return "uk";
    if (p.indexOf(".ru.") !== -1 || p.indexOf("-ru.") !== -1) return "ru";
    return "en";
  }

  var TEXTS = {
    en: {
      bannerText:
        'We use cookies for analytics and advertising. You can accept, reject, or customize your preferences. <a href="/cookie-policy.en.html">Cookie Policy</a>',
      acceptAll: "Accept All",
      rejectAll: "Reject All",
      managePrefs: "Manage Preferences",
      modalTitle: "Manage Cookie Preferences",
      essential: "Essential Cookies (Always active)",
      analytics: "Analytics Cookies (GA4)",
      marketing: "Marketing Cookies (Google Ads, Enhanced Conversions)",
      saveBtn: "Save Preferences",
    },
    ru: {
      bannerText:
        'Мы используем файлы cookie для аналитики и рекламы. Вы можете принять, отклонить или настроить предпочтения. <a href="/cookie-policy.ru.html">Политика Cookie</a>',
      acceptAll: "Принять все",
      rejectAll: "Отклонить все",
      managePrefs: "Настроить",
      modalTitle: "Управление настройками cookie",
      essential: "Необходимые cookie (всегда активны)",
      analytics: "Аналитические cookie (GA4)",
      marketing: "Маркетинговые cookie (Google Ads, Enhanced Conversions)",
      saveBtn: "Сохранить",
    },
    uk: {
      bannerText:
        'Ми використовуємо файли cookie для аналітики та реклами. Ви можете прийняти, відхилити або налаштувати. <a href="/cookie-policy.uk.html">Політика Cookie</a>',
      acceptAll: "Прийняти все",
      rejectAll: "Відхилити все",
      managePrefs: "Налаштувати",
      modalTitle: "Керування налаштуваннями cookie",
      essential: "Необхідні cookie (завжди активні)",
      analytics: "Аналітичні cookie (GA4)",
      marketing: "Маркетингові cookie (Google Ads, Enhanced Conversions)",
      saveBtn: "Зберегти",
    },
  };

  function loadGA4() {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") return;
    if (document.querySelector('script[src*="gtag/js?id=' + GA_MEASUREMENT_ID + '"]'))
      return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    if (typeof window.gtag === "function") {
      window.gtag("js", new Date());
      window.gtag("config", GA_MEASUREMENT_ID);
    }
  }

  function updateConsent(analytics, marketing) {
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      ad_storage: marketing ? "granted" : "denied",
      ad_user_data: marketing ? "granted" : "denied",
      ad_personalization: marketing ? "granted" : "denied",
      analytics_storage: analytics ? "granted" : "denied",
    });
  }

  function saveAndApply(prefs) {
    try {
      localStorage.setItem("cookie-consent", JSON.stringify(prefs));
    } catch (e) {}
    updateConsent(prefs.analytics, prefs.marketing);
    if (prefs.analytics) loadGA4();
  }

  function init() {
    var lang = getLang();
    var t = TEXTS[lang] || TEXTS.en;

    var saved = null;
    try {
      var raw = localStorage.getItem("cookie-consent");
      if (raw) saved = JSON.parse(raw);
    } catch (e) {}

    if (saved && typeof saved.analytics === "boolean" && typeof saved.marketing === "boolean") {
      updateConsent(saved.analytics, saved.marketing);
      if (saved.analytics) loadGA4();
      return;
    }

    var existingBanner = document.getElementById("cookie-banner");
    var existingModal = document.getElementById("cookie-modal");
    if (existingBanner) existingBanner.remove();
    if (existingModal) existingModal.remove();

    var bannerHtml =
      '<div class="cookie-content-wrapper">' +
      '<p class="cookie-text-main">' +
      t.bannerText +
      "</p>" +
      '<div class="cookie-buttons">' +
      '<button type="button" id="cookie-accept" class="cookie-btn-accept">' +
      t.acceptAll +
      "</button>" +
      '<button type="button" id="cookie-reject" class="cookie-btn-reject">' +
      t.rejectAll +
      "</button>" +
      '<button type="button" id="cookie-manage">' +
      t.managePrefs +
      "</button>" +
      "</div></div>";

    var modalHtml =
      '<div class="cookie-modal-content">' +
      '<button type="button" aria-label="Close" class="cookie-close" id="cookie-close-modal">&times;</button>' +
      "<h3>" +
      t.modalTitle +
      "</h3>" +
      '<form id="cookie-form">' +
      '<label><input type="checkbox" checked disabled/><span><strong>' +
      t.essential +
      "</strong></span></label>" +
      '<label><input type="checkbox" id="analytics-cookies"/><span>' +
      t.analytics +
      "</span></label>" +
      '<label><input type="checkbox" id="marketing-cookies"/><span>' +
      t.marketing +
      "</span></label>" +
      '<div class="cookie-modal-actions"><button type="submit">' +
      t.saveBtn +
      "</button></div></form></div>";

    var bannerEl = document.createElement("div");
    bannerEl.id = "cookie-banner";
    bannerEl.className = "cookie-banner-injected";
    bannerEl.innerHTML = bannerHtml;
    document.body.appendChild(bannerEl);

    var modalEl = document.createElement("div");
    modalEl.id = "cookie-modal";
    modalEl.className = "hidden";
    modalEl.innerHTML = modalHtml;
    document.body.appendChild(modalEl);

    var ban = document.getElementById("cookie-banner");
    var mod = document.getElementById("cookie-modal");
    var analyticsCb = document.getElementById("analytics-cookies");
    var marketingCb = document.getElementById("marketing-cookies");

    document.getElementById("cookie-accept").addEventListener("click", function () {
      saveAndApply({ analytics: true, marketing: true });
      ban.classList.add("hidden");
      mod.classList.add("hidden");
    });

    document.getElementById("cookie-reject").addEventListener("click", function () {
      try {
        localStorage.setItem("cookie-consent", JSON.stringify({ analytics: false, marketing: false }));
      } catch (e) {}
      ban.classList.add("hidden");
      mod.classList.add("hidden");
    });

    document.getElementById("cookie-manage").addEventListener("click", function () {
      ban.classList.add("hidden");
      mod.classList.remove("hidden");
      if (saved) {
        if (analyticsCb) analyticsCb.checked = saved.analytics;
        if (marketingCb) marketingCb.checked = saved.marketing;
      }
    });

    document.getElementById("cookie-close-modal").addEventListener("click", function () {
      mod.classList.add("hidden");
      if (!saved) ban.classList.remove("hidden");
    });

    mod.addEventListener("click", function (e) {
      if (e.target === mod) {
        mod.classList.add("hidden");
        if (!saved) ban.classList.remove("hidden");
      }
    });

    document.getElementById("cookie-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var a = analyticsCb ? analyticsCb.checked : false;
      var m = marketingCb ? marketingCb.checked : false;
      saveAndApply({ analytics: a, marketing: m });
      mod.classList.add("hidden");
      ban.classList.add("hidden");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
