document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const body = document.body;

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";

      mobileToggle.setAttribute("aria-expanded", !isExpanded);
      mainNav.classList.toggle("active");

      // Prevent scrolling when menu is open
      if (!isExpanded) {
        body.style.overflow = "hidden";
      } else {
        body.style.overflow = "";
      }
    });
  }

  // Scroll Animations
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll(
    "section, .hero-content, .hero-image-wrapper, .vision-card, .munir-content, .munir-image-wrapper, .event-card, .contact-banner"
  );

  animatedElements.forEach((el, index) => {
    el.classList.add("fade-on-scroll");

    // Add staggered delays for vision cards and event cards
    if (
      el.classList.contains("vision-card") ||
      el.classList.contains("event-card")
    ) {
      const cardType = el.classList.contains("vision-card")
        ? ".vision-card"
        : ".event-card";
      const cardIndex = Array.from(document.querySelectorAll(cardType)).indexOf(
        el
      );
      if (cardIndex === 1) el.classList.add("delay-100");
      if (cardIndex === 2) el.classList.add("delay-200");
    }

    // Special animation for Munir's image (if needed different class)
    if (el.classList.contains("munir-image-wrapper")) {
      // Logic handled via CSS class addition
    }

    observer.observe(el);
  });

  /* Interactive Background (Particles) */
  function initInteractiveBackgrounds() {
    // Targeted for About Us page sections
    const sections = document.querySelectorAll(
      ".hero-internal, .vision-mission-section"
    );

    // Check if sections exist to avoid errors
    if (sections.length === 0) return;

    sections.forEach((section) => {
      // Avoid Duplicate Canvas
      if (section.querySelector(".interactive-canvas")) return;

      const canvas = document.createElement("canvas");
      canvas.classList.add("interactive-canvas");
      section.prepend(canvas);

      const ctx = canvas.getContext("2d");
      let width, height;
      let particles = [];
      let animationFrameId;

      const particleCount = 40; // Adjust for density
      const connectionDistance = 150;
      const mouseDistance = 200;
      let mouse = { x: null, y: null };

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

          // Bounce off edges
          if (this.x < 0 || this.x > width) this.vx *= -1;
          if (this.y < 0 || this.y > height) this.vy *= -1;

          // Mouse interaction (repel)
          if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseDistance) {
              const forceDirectionX = dx / distance;
              const forceDirectionY = dy / distance;
              const maxDistance = mouseDistance;
              const force = (maxDistance - distance) / maxDistance;
              const directionX = forceDirectionX * force * 1; // Strength
              const directionY = forceDirectionY * force * 1;

              this.vx -= directionX;
              this.vy -= directionY;
            }
          }
        }

        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(199, 168, 109, 0.4)"; // Gold color
          ctx.fill();
        }
      }

      function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle());
        }
      }

      function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();

          for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(199, 168, 109, ${
                1 - distance / connectionDistance
              })`;
              ctx.lineWidth = 1;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
        animationFrameId = requestAnimationFrame(animate);
      }

      // Mouse Listeners
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
    });
  }

  // Initialize Particles if on relevant pages
  initInteractiveBackgrounds();

  /* Timeline Carousel */
  function initTimelineCarousel() {
    const track = document.querySelector(".timeline-track");
    const viewport = document.querySelector(".timeline-viewport");

    // Only proceed if elements exist
    if (!track || !viewport) return;

    const slides = Array.from(track.children);
    const nextButton = document.querySelector(".timeline-next");
    const prevButton = document.querySelector(".timeline-prev");
    let currentIndex = 0;

    function updateCarousel() {
      const isRTL =
        document.dir === "rtl" ||
        document.documentElement.dir === "rtl" ||
        getComputedStyle(document.body).direction === "rtl";
      const dirMultiplier = isRTL ? 1 : -1;

      const slideWidth = 100;
      track.style.transform = `translateX(${
        currentIndex * slideWidth * dirMultiplier
      }%)`;

      // Adaptive Height
      const activeSlide = slides[currentIndex];
      if (activeSlide) {
        viewport.style.height = activeSlide.offsetHeight + "px";
      }

      // Update active state
      slides.forEach((slide, index) => {
        if (index === currentIndex) {
          slide.setAttribute("data-active", "true");
          slide.setAttribute("aria-hidden", "false");
        } else {
          slide.removeAttribute("data-active");
          slide.setAttribute("aria-hidden", "true");
        }
      });

      // Update buttons
      if (prevButton) prevButton.disabled = currentIndex === 0;
      if (nextButton) nextButton.disabled = currentIndex === slides.length - 1;
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        if (currentIndex < slides.length - 1) {
          currentIndex++;
          updateCarousel();
        }
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      });
    }

    // Touch Support
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
        handleSwipe();
      },
      { passive: true }
    );

    function handleSwipe() {
      const threshold = 50;
      const diff = touchStartX - touchEndX;
      // In RTL: Next Item is to the Left.
      // To see Next Item, we must move Track Right.
      // Move Track Right = Swipe Right (Finger moves Left to Right).
      // Swipe Right -> diff (Start - End) -> (Small - Large) -> Negative.
      // diff < 0 -> Next.

      if (diff < -threshold) {
        // Swipe Right -> Next
        if (currentIndex < slides.length - 1) {
          currentIndex++;
          updateCarousel();
        }
      } else if (diff > threshold) {
        // Swipe Left -> Prev
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      }
    }

    // Handle Resizes and Image Loads
    window.addEventListener("resize", updateCarousel);
    const images = track.querySelectorAll("img");
    images.forEach((img) => {
      if (img.complete) {
        updateCarousel();
      } else {
        img.addEventListener("load", updateCarousel);
      }
    });

    // Init
    updateCarousel();
    setTimeout(updateCarousel, 200); // Safety check
  }

  initTimelineCarousel();

  /* Events Filters logic */
  function initEventFilters() {
    const filters = document.querySelectorAll(".filter-btn");
    const sections = document.querySelectorAll(".events-section");

    if (!filters.length) return;

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Deactivate all
        filters.forEach((f) => {
          f.classList.remove("active");
          f.setAttribute("aria-selected", "false");
        });
        sections.forEach((s) => {
          s.classList.remove("is-active");
          s.hidden = true;
        });

        // Activate Current
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");

        const targetId = btn.getAttribute("aria-controls");
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.classList.add("is-active");
          targetSection.hidden = false;
        }
      });
    });
  }

  initEventFilters();

  /* Modal Logic for Events Page */
  function initEventModal() {
    const modal = document.getElementById("event-modal");
    if (!modal) return;

    const modalTitle = modal.querySelector(".modal-title");
    const modalDescription = modal.querySelector(".modal-description");
    const modalImage = modal.querySelector(".carousel-image");
    const prevBtn = modal.querySelector(".modal-nav.prev");
    const nextBtn = modal.querySelector(".modal-nav.next");
    const closeModalBtn = modal.querySelector(".modal-close");
    const readMoreButtons = document.querySelectorAll(".read-more");

    let currentImages = [];
    let currentImageIndex = 0;

    // Open Modal
    readMoreButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); // If it's an anchor
        const eventCard = btn.closest(".event-card");

        // Get Data
        const title = eventCard.querySelector(".card-title").textContent;
        // In a real scenario, full description might be stored in a data attribute
        const description = eventCard.getAttribute("data-description") || "";
        const images = JSON.parse(
          eventCard.getAttribute("data-images") || "[]"
        );

        // Populate Modal
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        currentImages = images;
        currentImageIndex = 0;
        updateCarouselImage();

        modal.classList.add("active");
        body.style.overflow = "hidden";
      });
    });

    // Close Modal
    const closeModal = () => {
      modal.classList.remove("active");
      body.style.overflow = "";
    };

    closeModalBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      // Close if clicked outside the content (backdrop)
      if (e.target === modal) closeModal();
    });

    // Carousel Navigation
    const updateCarouselImage = () => {
      if (currentImages.length > 0) {
        modalImage.src = currentImages[currentImageIndex];
        modalImage.alt = `Event Image ${currentImageIndex + 1}`;
      } else {
        // Fallback or placeholder if no images
        modalImage.src = "";
        modalImage.alt = "No Image Available";
      }
    };

    prevBtn.addEventListener("click", () => {
      if (currentImages.length > 0) {
        currentImageIndex =
          (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        updateCarouselImage();
      }
    });

    nextBtn.addEventListener("click", () => {
      if (currentImages.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        updateCarouselImage();
      }
    });

    // Keyboard navigation for modal
    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("active")) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") prevBtn.click();
      if (e.key === "ArrowRight") nextBtn.click();
    });
  }

  initEventModal();

  /* Language Switcher Logic (Revised) */
  function initLanguageSwitcher() {
    const wrappers = document.querySelectorAll(".lang-wrapper"); // Handle duplicates (mobile/desktop)

    if (!wrappers.length) return;

    wrappers.forEach((wrapper) => {
      const switchBtn = wrapper.querySelector(".lang-switch");
      const dropdown = wrapper.querySelector(".lang-dropdown");
      const options = wrapper.querySelectorAll(".lang-option");

      // Guard, skip incomplete wrapper instances (common in mobile panel markup)
      if (!switchBtn || !dropdown) return;

      // Toggle Dropdown
      switchBtn.addEventListener("click", (e) => {
        e.preventDefault(); // important if .lang-switch is an <a>
        e.stopPropagation();

        wrappers.forEach((w) => {
          if (w !== wrapper)
            w.querySelector(".lang-dropdown")?.classList.remove("show");
        });

        dropdown.classList.toggle("show");
      });

      // Prevent document click closer from immediately closing when tapping inside dropdown
      dropdown.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // Handle Option Click
      options.forEach((option) => {
        option.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const lang = option.getAttribute("data-lang");
          switchLanguage(lang);
          dropdown.classList.remove("show");
        });
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      wrappers.forEach((wrapper) => {
        const dropdown = wrapper.querySelector(".lang-dropdown");
        const switchBtn = wrapper.querySelector(".lang-switch");
        if (
          dropdown &&
          dropdown.classList.contains("show") &&
          !wrapper.contains(e.target)
        ) {
          dropdown.classList.remove("show");
        }
      });
    });
  }

  function switchLanguage(targetLang) {
    const currentPath = window.location.pathname;
    const isEnglishPage = currentPath.includes("/en/");
    const currentLang = isEnglishPage ? "en" : "he";

    if (targetLang === currentLang) return; // Already on target language

    const fileName = currentPath.split("/").pop() || "index.html"; // Default to index.html
    let newUrl = "";

    // Mapping for specific internal pages if names differ greatly
    // Convention:
    // Hebrew: index.html, about-he.html, monir-he.html, events-he.html, contact-he.html, privacy-he.html, terms-he.html
    // English: en/index.html, en/about.html, en/monir.html, en/events.html, en/contact.html, en/privacy.html, en/terms.html

    const pageMapping = {
      // Hebrew to English Key map
      "index.html": "index.html",
      "about-he.html": "about.html",
      "monir-he.html": "monir.html",
      "events-he.html": "events.html",
      "contact-he.html": "contact.html",
      "privacy-he.html": "privacy.html",
      "terms-he.html": "terms.html",

      // English to Hebrew Key map (reverse lookup logic needed or explicit map)
      "about.html": "about-he.html",
      "monir.html": "monir-he.html",
      "events.html": "events-he.html",
      "contact.html": "contact-he.html",
      "privacy.html": "privacy-he.html",
      "terms.html": "terms-he.html",
    };

    if (targetLang === "en") {
      // Switching to English
      // If we are at root /, it's index.html
      let key = fileName;
      if (fileName === "") key = "index.html";

      const targetFile = pageMapping[key] || "index.html"; // Default fallback

      // Determine relative path based on current depth.
      // If we are at root, go to en/
      // If we are deeper, adjustments needed. Assuming flat structure at root.
      // Since current is Hebrew (root), destination is en/
      newUrl = "en/" + targetFile;

      // Edge case: if already in a subdirectory (unlikely for current structure but good practice)
      if (currentPath.includes("/")) {
        // Absolute path construction is safer if hosting structure varies
        // Using relative for now assuming strictly flat root vs /en/
        // Ensure we don't double stack
        const pathParts = currentPath.split("/");
        // Remove filename
        pathParts.pop();
        // Logic: We are at root (Hebrew). We want ./en/targetFile
        // Wait, if we are in local file system, relative paths are tricky.
        // Assuming web server structure or consistent relative placement.
        // index.html -> en/index.html
        // about-he.html -> en/about.html

        newUrl = `en/${targetFile}`;

        // Special check for index: if we are at root named as folder (e.g. ohr/), fileName is empty
        if (fileName === "" || fileName === "/") newUrl = "en/index.html";

        // Correcting relative path issue if user is viewing specific file
        // If opening file directly (file://...), relative path works from current dir.
      }
    } else {
      // Switching to Hebrew
      // We are in /en/ (e.g. /en/about.html)
      // Destination is ../about-he.html

      const targetFile = pageMapping[fileName] || "index.html";
      newUrl = "../" + targetFile;
    }

    window.location.href = newUrl;
  }

  initLanguageSwitcher();

  /* Cookie Consent System */
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
      this.renderModal(); // Always render modal hidden for footer link access
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
      // Logic to enable/disable scripts based on flags
      if (this.consent.analytics) {
        // e.g., loadGoogleAnalytics();
        console.log("Analytics cookies enabled");
      }
      if (this.consent.marketing) {
        // e.g., loadMarketingPixels();
        console.log("Marketing cookies enabled");
      }
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

      document.getElementById("cb-manage").addEventListener("click", () => {
        this.openModal();
      });
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

      // Listeners
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
      if (modal) {
        // Sync state before opening
        document.getElementById("toggle-analytics").checked =
          this.consent.analytics;
        document.getElementById("toggle-marketing").checked =
          this.consent.marketing;

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
      }
    }

    attachGlobalListeners() {
      document.addEventListener("click", (e) => {
        if (e.target.matches("[data-cookie-open]")) {
          e.preventDefault();
          this.openModal();
        }
      });
    }
  }

  // Initialize Cookie Consent
  new CookieConsent();
});
