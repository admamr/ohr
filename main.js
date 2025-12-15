// main.js

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  initMobileMenu();
  initScrollReveal();
  initInteractiveBackgrounds();
  initTimelineCarousel();
  initEventFilters();
  initEventModal();
  initLanguageSwitcher();
  initCookieConsent();

  function initMobileMenu() {
    const mobileToggle = document.querySelector(".mobile-menu-toggle");
    const mainNav = document.querySelector(".main-nav");
    if (!mobileToggle || !mainNav) return;

    mobileToggle.addEventListener("click", () => {
      const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";
      mobileToggle.setAttribute("aria-expanded", String(!isExpanded));
      mainNav.classList.toggle("active");

      body.style.overflow = !isExpanded ? "hidden" : "";
    });

    document.addEventListener("click", (e) => {
      const isOpen = mainNav.classList.contains("active");
      if (!isOpen) return;
      const clickedInsideNav = mainNav.contains(e.target);
      const clickedToggle = mobileToggle.contains(e.target);
      if (!clickedInsideNav && !clickedToggle) {
        mainNav.classList.remove("active");
        mobileToggle.setAttribute("aria-expanded", "false");
        body.style.overflow = "";
      }
    });
  }

  function initScrollReveal() {
    if (!("IntersectionObserver" in window)) return;

    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.1 };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
      "section, .hero-content, .hero-image-wrapper, .vision-card, .munir-content, .munir-image-wrapper, .event-card, .contact-banner"
    );

    animatedElements.forEach((el) => {
      el.classList.add("fade-on-scroll");

      if (
        el.classList.contains("vision-card") ||
        el.classList.contains("event-card")
      ) {
        const cardType = el.classList.contains("vision-card")
          ? ".vision-card"
          : ".event-card";
        const cardIndex = Array.from(
          document.querySelectorAll(cardType)
        ).indexOf(el);
        if (cardIndex === 1) el.classList.add("delay-100");
        if (cardIndex === 2) el.classList.add("delay-200");
      }

      observer.observe(el);
    });
  }

  function initInteractiveBackgrounds() {
    const sections = document.querySelectorAll(
      ".hero-internal, .vision-mission-section"
    );
    if (!sections.length) return;

    sections.forEach((section) => {
      if (section.querySelector(".interactive-canvas")) return;

      const canvas = document.createElement("canvas");
      canvas.classList.add("interactive-canvas");
      section.prepend(canvas);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let width = 0;
      let height = 0;
      let particles = [];
      let animationFrameId = null;

      const particleCount = 40;
      const connectionDistance = 150;
      const mouseDistance = 200;
      const mouse = { x: null, y: null };

      const resize = () => {
        width = canvas.width = section.offsetWidth;
        height = canvas.height = section.offsetHeight;
        initParticles();
      };

      class Particle {
        constructor() {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
          this.size = Math.random() * 2 + 1;
        }

        update() {
          this.x += this.vx;
          this.y += this.vy;

          if (this.x < 0 || this.x > width) this.vx *= -1;
          if (this.y < 0 || this.y > height) this.vy *= -1;

          if (mouse.x != null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0 && distance < mouseDistance) {
              const fx = dx / distance;
              const fy = dy / distance;
              const force = (mouseDistance - distance) / mouseDistance;
              this.vx -= fx * force * 1;
              this.vy -= fy * force * 1;
            }
          }
        }

        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(199, 168, 109, 0.4)";
          ctx.fill();
        }
      }

      function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
      }

      function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          p1.update();
          p1.draw();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(199, 168, 109, ${
                1 - distance / connectionDistance
              })`;
              ctx.lineWidth = 1;
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        animationFrameId = requestAnimationFrame(animate);
      }

      section.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });

      section.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
      });

      window.addEventListener("resize", resize);
      resize();
      animate();

      window.addEventListener("beforeunload", () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      });
    });
  }

  function initTimelineCarousel() {
    const track = document.querySelector(".timeline-track");
    const viewport = document.querySelector(".timeline-viewport");
    if (!track || !viewport) return;

    const slides = Array.from(track.children);
    const nextButton = document.querySelector(".timeline-next");
    const prevButton = document.querySelector(".timeline-prev");
    let currentIndex = 0;

    const isRTL = () =>
      document.documentElement.dir === "rtl" ||
      document.dir === "rtl" ||
      getComputedStyle(document.body).direction === "rtl";

    function updateCarousel() {
      const dirMultiplier = isRTL() ? 1 : -1;
      track.style.transform = `translateX(${
        currentIndex * 100 * dirMultiplier
      }%)`;

      const activeSlide = slides[currentIndex];
      if (activeSlide) viewport.style.height = activeSlide.offsetHeight + "px";

      slides.forEach((slide, idx) => {
        if (idx === currentIndex) {
          slide.setAttribute("data-active", "true");
          slide.setAttribute("aria-hidden", "false");
        } else {
          slide.removeAttribute("data-active");
          slide.setAttribute("aria-hidden", "true");
        }
      });

      if (prevButton) prevButton.disabled = currentIndex === 0;
      if (nextButton) nextButton.disabled = currentIndex === slides.length - 1;
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        if (currentIndex < slides.length - 1) {
          currentIndex += 1;
          updateCarousel();
        }
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex -= 1;
          updateCarousel();
        }
      });
    }

    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    track.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const threshold = 50;
        const diff = touchStartX - touchEndX;

        if (diff < -threshold) {
          if (currentIndex < slides.length - 1) {
            currentIndex += 1;
            updateCarousel();
          }
        } else if (diff > threshold) {
          if (currentIndex > 0) {
            currentIndex -= 1;
            updateCarousel();
          }
        }
      },
      { passive: true }
    );

    window.addEventListener("resize", updateCarousel);
    const images = track.querySelectorAll("img");
    images.forEach((img) => {
      if (img.complete) return;
      img.addEventListener("load", updateCarousel);
    });

    updateCarousel();
    setTimeout(updateCarousel, 200);
  }

  function initEventFilters() {
    const filters = document.querySelectorAll(".filter-btn");
    const sections = document.querySelectorAll(".events-section");
    if (!filters.length) return;

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((f) => {
          f.classList.remove("active");
          f.setAttribute("aria-selected", "false");
        });

        sections.forEach((s) => {
          s.classList.remove("is-active");
          s.hidden = true;
        });

        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");

        const targetId = btn.getAttribute("aria-controls");
        const targetSection = targetId
          ? document.getElementById(targetId)
          : null;
        if (targetSection) {
          targetSection.classList.add("is-active");
          targetSection.hidden = false;
        }
      });
    });
  }

  function initEventModal() {
    const modal = document.getElementById("event-modal");
    if (!modal) return;

    const overlay = modal.querySelector(".modal-overlay");
    const closeBtns = modal.querySelectorAll("[data-close]");
    const track = modal.querySelector(".modal-gallery-track");
    const prevBtn = modal.querySelector(".modal-nav.prev");
    const nextBtn = modal.querySelector(".modal-nav.next");

    const dateTag = modal.querySelector(".modal-date-tag");
    const titleEl = modal.querySelector(".modal-title");
    const descEl = modal.querySelector(".modal-desc");

    const triggers = document.querySelectorAll(".event-trigger");

    if (!track || !prevBtn || !nextBtn || !titleEl || !descEl || !dateTag)
      return;
    if (!triggers.length) return;

    let images = [];
    let index = 0;

    function safeParseImages(value) {
      if (!value) return [];
      const raw = String(value).trim();

      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        try {
          let cleaned = raw;
          cleaned = cleaned.replace(/,\s*\]/g, "]");
          cleaned = cleaned.replace(/\]\s*'\s*$/g, "]");
          cleaned = cleaned.replace(/^'\s*/, "");
          cleaned = cleaned.replace(/\s*'$/, "");
          const parsed2 = JSON.parse(cleaned);
          return Array.isArray(parsed2) ? parsed2 : [];
        } catch (e2) {
          return [];
        }
      }
    }

    function render() {
      track.innerHTML = "";

      if (!images.length) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        prevBtn.setAttribute("aria-disabled", "true");
        nextBtn.setAttribute("aria-disabled", "true");
        return;
      }

      const img = document.createElement("img");
      img.src = images[index];
      img.alt = `${titleEl.textContent || "Event"} ${index + 1}`;
      img.loading = "eager";
      img.decoding = "async";
      img.className = "modal-image";
      track.appendChild(img);

      const hasMany = images.length > 1;
      prevBtn.disabled = !hasMany;
      nextBtn.disabled = !hasMany;
      prevBtn.setAttribute("aria-disabled", hasMany ? "false" : "true");
      nextBtn.setAttribute("aria-disabled", hasMany ? "false" : "true");
    }

    function openModal(payload) {
      dateTag.textContent = payload.date || "";
      titleEl.textContent = payload.title || "";
      descEl.textContent = payload.description || "";

      images = payload.images || [];
      index = 0;

      render();

      modal.classList.add("is-open"); // was "active"
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("is-open"); // was "active"
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    triggers.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();

        const title = btn.getAttribute("data-title") || "";
        const date = btn.getAttribute("data-date") || "";
        const description = btn.getAttribute("data-description") || "";
        const imgs = safeParseImages(btn.getAttribute("data-images"));

        openModal({ title, date, description, images: imgs });
      });
    });

    closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));
    if (overlay) overlay.addEventListener("click", closeModal);

    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!images.length) return;
      index = (index - 1 + images.length) % images.length;
      render();
    });

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!images.length) return;
      index = (index + 1) % images.length;
      render();
    });

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("active")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") prevBtn.click();
      if (e.key === "ArrowRight") nextBtn.click();
    });
  }

  function initLanguageSwitcher() {
    const wrappers = document.querySelectorAll(".lang-wrapper");
    if (!wrappers.length) return;

    wrappers.forEach((wrapper) => {
      const switchBtn = wrapper.querySelector(".lang-switch");
      const dropdown = wrapper.querySelector(".lang-dropdown");
      const options = wrapper.querySelectorAll(".lang-option");
      if (!switchBtn || !dropdown) return;

      switchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        wrappers.forEach((w) => {
          if (w === wrapper) return;
          w.querySelector(".lang-dropdown")?.classList.remove("show");
        });

        dropdown.classList.toggle("show");
      });

      dropdown.addEventListener("click", (e) => e.stopPropagation());

      options.forEach((option) => {
        option.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const lang = option.getAttribute("data-lang");
          if (lang) switchLanguage(lang);
          dropdown.classList.remove("show");
        });
      });
    });

    document.addEventListener("click", (e) => {
      wrappers.forEach((wrapper) => {
        const dropdown = wrapper.querySelector(".lang-dropdown");
        if (
          dropdown &&
          dropdown.classList.contains("show") &&
          !wrapper.contains(e.target)
        ) {
          dropdown.classList.remove("show");
        }
      });
    });

    function switchLanguage(targetLang) {
      const currentPath = window.location.pathname;
      const isEnglishPage = currentPath.includes("/en/");
      const currentLang = isEnglishPage ? "en" : "he";
      if (targetLang === currentLang) return;

      const fileName = currentPath.split("/").pop() || "index.html";

      const map = {
        "index.html": "index.html",
        "about-he.html": "about.html",
        "monir-he.html": "monir.html",
        "events-he.html": "events.html",
        "contact-he.html": "contact.html",
        "privacy-he.html": "privacy.html",
        "terms-he.html": "terms.html",

        "about.html": "about-he.html",
        "monir.html": "monir-he.html",
        "events.html": "events-he.html",
        "contact.html": "contact-he.html",
        "privacy.html": "privacy-he.html",
        "terms.html": "terms-he.html",
      };

      if (targetLang === "en") {
        const targetFile = map[fileName] || "index.html";
        window.location.href = `en/${targetFile}`;
      } else {
        const targetFile = map[fileName] || "index.html";
        window.location.href = `../${targetFile}`;
      }
    }
  }

  function initCookieConsent() {
    class CookieConsent {
      constructor() {
        this.consentKey = "ohr_cookie_consent_v1";
        this.isRTL = document.documentElement.dir === "rtl";
        this.lang = document.documentElement.lang || (this.isRTL ? "he" : "en");

        this.consent = this.getConsent() || {
          essential: true,
          analytics: false,
          marketing: false,
          timestamp: null,
          version: 1,
        };

        this.text = {
          he: {
            bannerTitle: "אנו משתמשים בעוגיות",
            bannerBody:
              "אנו משתמשים בעוגיות חיוניות להפעלת האתר, ועוגיות אופציונליות לניתוח ושיווק. ניתן לבחור העדפות בכל עת.",
            acceptAll: "קבל הכל",
            reject: "דחה הכל",
            manage: "הגדרות",
            modalTitle: "העדפות עוגיות",
            save: "שמור העדפות",
            close: "סגור",
            categories: {
              essential: {
                title: "עוגיות חיוניות",
                desc: "נדרשות לתפקוד תקין של האתר. לא ניתן לבטל.",
              },
              analytics: {
                title: "ניתוח וסטטיסטיקה",
                desc: "עוזרות לנו לשפר את האתר על ידי איסוף נתונים אנונימיים.",
              },
              marketing: {
                title: "שיווק",
                desc: "משמשות למעקב אחר משתמשים לצורך הצגת תוכן רלוונטי.",
              },
            },
          },
          en: {
            bannerTitle: "We use cookies",
            bannerBody:
              "We use essential cookies to run the site, and optional cookies for analytics and marketing. You can change your preferences at any time.",
            acceptAll: "Accept All",
            reject: "Reject All",
            manage: "Preferences",
            modalTitle: "Cookie Preferences",
            save: "Save Preferences",
            close: "Close",
            categories: {
              essential: {
                title: "Essential Cookies",
                desc: "Required for the site to function properly. Cannot be disabled.",
              },
              analytics: {
                title: "Analytics",
                desc: "Help us improve the site by collecting anonymous usage data.",
              },
              marketing: {
                title: "Marketing",
                desc: "Used to track visitors across websites to display relevant ads.",
              },
            },
          },
        };

        this.init();
      }

      init() {
        if (!this.hasConsent()) {
          this.renderBanner();
        } else {
          this.applyConsent();
        }
        this.renderModal();
        this.attachGlobalListeners();
      }

      getConsent() {
        try {
          const stored = localStorage.getItem(this.consentKey);
          return stored ? JSON.parse(stored) : null;
        } catch (e) {
          return null;
        }
      }

      setConsent(c) {
        this.consent = {
          ...this.consent,
          ...c,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(this.consentKey, JSON.stringify(this.consent));
        this.applyConsent();
      }

      hasConsent() {
        return !!this.getConsent();
      }

      applyConsent() {
        if (this.consent.analytics) console.log("Analytics cookies enabled");
        if (this.consent.marketing) console.log("Marketing cookies enabled");
      }

      renderBanner() {
        if (document.getElementById("cookie-banner")) return;

        const t = this.text[this.lang === "he" ? "he" : "en"];
        const html = `
          <div id="cookie-banner" class="cookie-banner" role="dialog" aria-labelledby="cb-title">
            <div class="cb-content">
              <h3 id="cb-title">${t.bannerTitle}</h3>
              <p>${t.bannerBody}</p>
            </div>
            <div class="cb-actions">
              <button id="cb-accept" class="btn btn-sm btn-primary">${t.acceptAll}</button>
              <button id="cb-reject" class="btn btn-sm btn-outline">${t.reject}</button>
              <button id="cb-manage" class="btn btn-sm btn-link">${t.manage}</button>
            </div>
          </div>
        `;
        document.body.insertAdjacentHTML("beforeend", html);
        document.body.classList.add("has-cookie-banner");

        document.getElementById("cb-accept").addEventListener("click", () => {
          this.setConsent({ analytics: true, marketing: true });
          this.closeBanner();
        });

        document.getElementById("cb-reject").addEventListener("click", () => {
          this.setConsent({ analytics: false, marketing: false });
          this.closeBanner();
        });

        document
          .getElementById("cb-manage")
          .addEventListener("click", () => this.openModal());
      }

      closeBanner() {
        const banner = document.getElementById("cookie-banner");
        if (banner) banner.remove();
        document.body.classList.remove("has-cookie-banner");
      }

      renderModal() {
        if (document.getElementById("cookie-modal")) return;

        const t = this.text[this.lang === "he" ? "he" : "en"];
        const html = `
          <div id="cookie-modal" class="cookie-modal" aria-hidden="true">
            <div class="cookie-modal-overlay" tabindex="-1"></div>
            <div class="cookie-modal-content" role="dialog" aria-modal="true" aria-labelledby="cm-title">
              <header class="cm-header">
                <h3 id="cm-title">${t.modalTitle}</h3>
                <button id="cm-close" aria-label="${t.close}">&times;</button>
              </header>
              <div class="cm-body">
                <div class="cm-section">
                  <div class="cm-row">
                    <div class="cm-info">
                      <h4>${t.categories.essential.title}</h4>
                      <p>${t.categories.essential.desc}</p>
                    </div>
                    <div class="cm-toggle">
                      <input type="checkbox" checked disabled>
                      <span class="slider"></span>
                    </div>
                  </div>
                </div>

                <div class="cm-section">
                  <div class="cm-row">
                    <div class="cm-info">
                      <h4>${t.categories.analytics.title}</h4>
                      <p>${t.categories.analytics.desc}</p>
                    </div>
                    <div class="cm-toggle">
                      <input type="checkbox" id="toggle-analytics" ${
                        this.consent.analytics ? "checked" : ""
                      }>
                      <label for="toggle-analytics" class="slider"></label>
                    </div>
                  </div>
                </div>

                <div class="cm-section">
                  <div class="cm-row">
                    <div class="cm-info">
                      <h4>${t.categories.marketing.title}</h4>
                      <p>${t.categories.marketing.desc}</p>
                    </div>
                    <div class="cm-toggle">
                      <input type="checkbox" id="toggle-marketing" ${
                        this.consent.marketing ? "checked" : ""
                      }>
                      <label for="toggle-marketing" class="slider"></label>
                    </div>
                  </div>
                </div>
              </div>
              <footer class="cm-footer">
                <button id="cm-save" class="btn btn-primary">${t.save}</button>
              </footer>
            </div>
          </div>
        `;
        document.body.insertAdjacentHTML("beforeend", html);

        const modal = document.getElementById("cookie-modal");
        const overlay = modal.querySelector(".cookie-modal-overlay");
        const closeBtn = document.getElementById("cm-close");
        const saveBtn = document.getElementById("cm-save");

        const close = () => {
          modal.classList.remove("active");
          modal.setAttribute("aria-hidden", "true");
        };

        overlay.addEventListener("click", close);
        closeBtn.addEventListener("click", close);

        saveBtn.addEventListener("click", () => {
          const analytics = document.getElementById("toggle-analytics").checked;
          const marketing = document.getElementById("toggle-marketing").checked;
          this.setConsent({ analytics, marketing });
          close();
          this.closeBanner();
        });
      }

      openModal() {
        const modal = document.getElementById("cookie-modal");
        if (!modal) return;

        const analyticsToggle = document.getElementById("toggle-analytics");
        const marketingToggle = document.getElementById("toggle-marketing");
        if (analyticsToggle) analyticsToggle.checked = !!this.consent.analytics;
        if (marketingToggle) marketingToggle.checked = !!this.consent.marketing;

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
      }

      attachGlobalListeners() {
        document.addEventListener("click", (e) => {
          const target = e.target;
          if (!(target instanceof Element)) return;
          if (target.matches("[data-cookie-open]")) {
            e.preventDefault();
            this.openModal();
          }
        });
      }
    }

    new CookieConsent();
  }
});
