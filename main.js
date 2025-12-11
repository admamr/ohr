document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const body = document.body;

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";

      mobileToggle.setAttribute("aria-expanded", !isExpanded);
      mainNav.classList.toggle("active");

      // Optional: Prevent scrolling when menu is open
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

    // ... existing code ...
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
          this.color = "rgba(199, 168, 109, "; // Gold base
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          if (this.x < 0 || this.x > width) this.vx *= -1;
          if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color + "0.5)";
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
        particles.forEach((p, index) => {
          p.update();
          p.draw();
          // Connect
          for (let j = index; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < connectionDistance) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(199, 168, 109, ${
                0.2 * (1 - dist / connectionDistance)
              })`;
              ctx.lineWidth = 1;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
          // Mouse
          if (mouse.x != null) {
            const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (dist < mouseDistance) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(31, 51, 40, ${
                0.4 * (1 - dist / mouseDistance)
              })`;
              ctx.lineWidth = 1;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }
          }
        });
        animationFrameId = requestAnimationFrame(animate);
      }

      window.addEventListener("resize", resize);
      section.addEventListener("mousemove", (e) => {
        const rect = section.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      section.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
      });

      resize();
      animate();
    });
  }

  initInteractiveBackgrounds();

  /* Timeline Carousel */
  function initTimelineCarousel() {
    const track = document.querySelector(".timeline-track");
    const viewport = document.querySelector(".timeline-viewport");
    if (!track || !viewport) return;

    const slides = Array.from(track.children);
    const nextButton = document.querySelector(".timeline-next");
    const prevButton = document.querySelector(".timeline-prev");
    let currentIndex = 0;

    function updateCarousel() {
      // In RTL Flexbox: Item 0 is Rightmost. Item 1 is Left of 0.
      // To see Item 1 (Move view Left), we actually need to move Track Right.
      // transform: translateX(100%) moves element Right.
      // So Index * 100% works.
      const slideWidth = 100;
      track.style.transform = `translateX(${currentIndex * slideWidth}%)`;

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

  /* Event Modal Logic */
  function initEventModal() {
    const modal = document.getElementById("event-modal");
    if (!modal) return;

    const triggers = document.querySelectorAll(".event-trigger");
    const closeButtons = document.querySelectorAll("[data-close]");

    // Elements to fill
    const modalTitle = modal.querySelector(".modal-title");
    const modalDate = modal.querySelector(".modal-date-tag");
    const modalDesc = modal.querySelector(".modal-desc");
    const track = modal.querySelector(".modal-gallery-track");
    const btnPrev = modal.querySelector(".modal-nav.prev");
    const btnNext = modal.querySelector(".modal-nav.next");

    let currentSlide = 0;
    let totalSlides = 0;

    function openModal(data) {
      modalTitle.textContent = data.title;
      modalDate.textContent = data.date;
      modalDesc.textContent = data.description;

      // Build Carousel Slides
      track.innerHTML = "";
      // Handle potential single quotes in JSON by trying to be safe or assuming valid JSON string
      let images = [];
      try {
        images = JSON.parse(data.images || "[]");
      } catch (e) {
        console.error("Error parsing images", e);
      }

      totalSlides = images.length;
      currentSlide = 0;

      images.forEach((src) => {
        const slide = document.createElement("div");
        slide.className = "modal-slide";
        const img = document.createElement("img");
        img.src = src;
        slide.appendChild(img);
        track.appendChild(slide);
      });

      updateModalCarousel();
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; // Lock Body Scroll
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    function updateModalCarousel() {
      // For RTL, positive translateX moves right, revealing items on the left side (stack 1, 2, 3 R->L)
      track.style.transform = `translateX(${currentSlide * 100}%)`;
    }

    // Triggers
    triggers.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const data = {
          title: btn.getAttribute("data-title"),
          date: btn.getAttribute("data-date"),
          description: btn.getAttribute("data-description"),
          images: btn.getAttribute("data-images"),
        };
        openModal(data);
      });
    });

    // Close
    closeButtons.forEach((btn) => btn.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open"))
        closeModal();
    });

    // Carousel Nav
    if (btnPrev && btnNext) {
      btnPrev.addEventListener("click", () => {
        // Prev in RTL (Right Arrow visually, logic depends if we are at 0)
        // If we are at 0, moving "Prev" (Nav Right) goes to -1?
        // Wait, "Prev" button icon is Right Arrow?
        // In my HTML: prev is <polyline points="15 18 9 12 15 6"></polyline> (Left pointing chevron)
        // next is <polyline points="9 18 15 12 9 6"></polyline> (Right pointing chevron)
        // In RTL: Prev should go to "Newer/Right" item? Or "Previous index"?
        // Usually Next -> Index + 1. Prev -> Index - 1.

        if (currentSlide > 0) {
          currentSlide--;
          updateModalCarousel();
        } else {
          currentSlide = totalSlides - 1;
          updateModalCarousel();
        }
      });

      btnNext.addEventListener("click", () => {
        if (currentSlide < totalSlides - 1) {
          currentSlide++;
          updateModalCarousel();
        } else {
          currentSlide = 0;
          updateModalCarousel();
        }
      });
    }
  }

  initEventModal();

  /* CTA Interactive Background */
  (function initCTACanvas() {
    const canvas = document.getElementById("cta-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width, height;
    let particles = [];

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      createParticles();
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        else if (this.x > width) this.x = 0;

        if (this.y < 0) this.y = height;
        else if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.fillStyle = `rgba(199, 168, 109, ${this.alpha})`; // Accent color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function createParticles() {
      particles = [];
      const count = Math.floor((width * height) / 10000); // Density based on area
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    resize(); // Init
    animate();
  })();
});
