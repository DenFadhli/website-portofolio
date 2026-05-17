(function () {
  const data = window.portfolioData || {};
  const translations = data.uiTranslations || {};
  const projects = Array.isArray(data.projects) ? data.projects : [];

  let currentLang = "en";
  let currentTheme = "dark";
  let lastFocusedElement = null;

  const body = document.body;
  const siteNav = document.getElementById("siteNav");
  const menuBtn = document.getElementById("menuBtn");
  const themeBtn = document.getElementById("themeBtn");
  const langBtn = document.getElementById("langBtn");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const imageModal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const modalClose = document.getElementById("modalClose");
  const modalTitle = document.getElementById("modalTitle");

  function t(key) {
    return (
      (translations[currentLang] && translations[currentLang][key]) ||
      (translations.en && translations.en[key]) ||
      key
    );
  }

  function projectText(project, key) {
    if (!project || !project[key]) {
      return "";
    }
    return project[key][currentLang] || project[key].en || "";
  }

  function countProjects(mode) {
    if (mode === "complete") {
      return projects.filter((project) => !project.isPlaceholder).length;
    }
    if (mode === "placeholder") {
      return projects.filter((project) => project.isPlaceholder).length;
    }
    return projects.length;
  }

  function applyTheme(theme) {
    currentTheme = theme;
    body.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
    if (themeBtn) {
      themeBtn.setAttribute(
        "aria-label",
        currentTheme === "dark" ? t("theme_to_light") : t("theme_to_dark"),
      );
    }
  }

  function updateMenuButton() {
    if (!menuBtn) {
      return;
    }
    const expanded = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-label", expanded ? t("menu_close") : t("menu_open"));
  }

  function openMenu() {
    if (!siteNav || !menuBtn) {
      return;
    }
    siteNav.classList.add("is-open");
    body.classList.add("menu-open");
    menuBtn.setAttribute("aria-expanded", "true");
    updateMenuButton();
  }

  function closeMenu() {
    if (!siteNav || !menuBtn) {
      return;
    }
    siteNav.classList.remove("is-open");
    body.classList.remove("menu-open");
    menuBtn.setAttribute("aria-expanded", "false");
    updateMenuButton();
  }

  function toggleMenu() {
    if (!siteNav) {
      return;
    }
    if (siteNav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function showFormStatus(message, type) {
    if (!formStatus) {
      return;
    }
    formStatus.textContent = message;
    formStatus.hidden = false;
    formStatus.classList.toggle("is-success", type === "success");
    formStatus.classList.toggle("is-error", type === "error");
  }

  function clearFormStatus() {
    if (!formStatus) {
      return;
    }
    formStatus.textContent = "";
    formStatus.hidden = true;
    formStatus.classList.remove("is-success", "is-error");
  }

  function openModal(src, alt) {
    if (!imageModal || !modalImg || !modalClose || !modalTitle) {
      return;
    }
    lastFocusedElement = document.activeElement;
    modalImg.src = src;
    modalImg.alt = alt;
    modalTitle.textContent = alt || t("modal_title");
    imageModal.classList.add("is-open");
    imageModal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
    modalClose.focus();
  }

  function closeModal() {
    if (!imageModal || !modalImg) {
      return;
    }
    imageModal.classList.remove("is-open");
    imageModal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
    modalImg.removeAttribute("src");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function createProjectCard(project) {
    const tagsMarkup = (project.tags || [])
      .map((tag) => `<span class="tag">${tag}</span>`)
      .join("");
    const badgesMarkup = (project.badges || [])
      .map(createProjectBadge)
      .join("");
    const projectMetaMarkup = badgesMarkup
      ? `<div class="project-meta">${badgesMarkup}</div>`
      : "";
    const noteMarkup = project.isPlaceholder
      ? `<p class="project-note">${projectText(project, "note")}</p>`
      : "";
    const placeholderClass = project.isPlaceholder ? " placeholder" : "";
    const statusClass = project.isPlaceholder ? " is-placeholder" : "";

    return `
      <article class="project-card reveal${placeholderClass}">
        <button
          class="project-preview"
          type="button"
          data-preview-src="${project.image}"
          data-preview-alt="${projectText(project, "alt")}"
        >
          <img src="${project.image}" alt="${projectText(project, "alt")}" />
          <span class="preview-overlay">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <span>${t("preview_label")}</span>
          </span>
        </button>
        <div class="project-content">
          <div class="project-topline">
            <p class="project-kicker">${projectText(project, "highlight")}</p>
            <span class="project-status${statusClass}">${projectText(
              project,
              "status",
            )}</span>
          </div>
          <h3 class="project-title">${project.title}</h3>
          ${projectMetaMarkup}
          <p class="project-desc">${projectText(project, "description")}</p>
          <div class="tag-list">${tagsMarkup}</div>
          <p class="project-role">
            <strong>${t("project_role")}</strong>
            ${projectText(project, "role")}
          </p>
          ${noteMarkup}
        </div>
      </article>
    `;
  }

  function createProjectBadge(badgeConfig) {
    const type =
      typeof badgeConfig === "string" ? badgeConfig : badgeConfig.type;
    const href =
      typeof badgeConfig === "string" ? "" : badgeConfig.href || "";
    const badgeMap = {
      github: {
        label: "GitHub",
        svg: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"></path></svg>`,
      },
      android: {
        label: "Android",
        svg: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.48 19.2 6.7a.75.75 0 0 0-1.3-.75l-1.65 2.86A9.34 9.34 0 0 0 12 7.8c-1.53 0-2.98.36-4.25 1.01L6.1 5.95a.75.75 0 0 0-1.3.75l1.6 2.78A7.07 7.07 0 0 0 3.75 15v.75h16.5V15a7.07 7.07 0 0 0-2.65-5.52ZM8.25 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm7.5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM5 17h14v1.75A2.25 2.25 0 0 1 16.75 21h-9.5A2.25 2.25 0 0 1 5 18.75V17Z"></path></svg>`,
      },
      apple: {
        label: "Apple",
        svg: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M16.37 1.6c.04.45-.1 1.28-.62 2.02-.5.72-1.33 1.37-2.14 1.32-.1-.77.29-1.55.76-2.12.52-.63 1.42-1.11 2-1.22ZM20.1 17.35c-.43.98-.64 1.42-1.2 2.28-.78 1.2-1.88 2.7-3.25 2.72-1.22.02-1.54-.8-3.2-.79-1.66.01-2.02.81-3.24.79-1.38-.02-2.43-1.36-3.22-2.56-2.2-3.36-2.43-7.3-1.08-9.4.96-1.49 2.47-2.36 3.9-2.36 1.45 0 2.36.8 3.56.8 1.16 0 1.87-.8 3.55-.8 1.27 0 2.62.69 3.57 1.89-3.14 1.72-2.63 6.2.61 7.43Z"></path></svg>`,
      },
    };
    const badge = badgeMap[type];
    if (!badge) {
      return "";
    }
    const badgeContent = `${badge.svg}<span>${badge.label}</span>`;
    if (href) {
      return `<a class="project-badge" href="${href}" target="_blank" rel="noopener noreferrer" title="${badge.label}" aria-label="${badge.label}">${badgeContent}</a>`;
    }
    return `<span class="project-badge" title="${badge.label}" aria-label="${badge.label}">${badgeContent}</span>`;
  }

  function renderProjectLists() {
    document.querySelectorAll("[data-project-list]").forEach((container) => {
      const mode = container.getAttribute("data-project-list");
      const limitValue = Number(container.getAttribute("data-project-limit"));
      let selected = projects.slice();

      if (mode === "featured") {
        selected = projects.filter((project) => !project.isPlaceholder);
      }

      if (limitValue > 0) {
        selected = selected.slice(0, limitValue);
      }

      container.innerHTML = selected.map(createProjectCard).join("");
    });

    document.querySelectorAll("[data-project-count]").forEach((counter) => {
      counter.textContent = String(countProjects(counter.getAttribute("data-project-count")));
    });
  }

  function setupRevealAnimation() {
    const revealItems = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  function setupActiveNavigation() {
    if (!siteNav) {
      return;
    }

    const sectionLinks = Array.from(siteNav.querySelectorAll('a[href^="#"]'));
    const sections = sectionLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) {
      return;
    }

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const activeLink = siteNav.querySelector(
            `a[href="#${entry.target.id}"]`,
          );
          if (entry.isIntersecting && activeLink) {
            sectionLinks.forEach((link) => link.classList.remove("active"));
            activeLink.classList.add("active");
          }
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0.01 },
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  function updateLanguage() {
    document.documentElement.lang = currentLang;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      element.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      element.setAttribute("placeholder", t(key));
    });

    if (langBtn) {
      langBtn.textContent = currentLang === "en" ? "ID" : "EN";
      langBtn.setAttribute(
        "aria-label",
        currentLang === "en" ? t("language_to_id") : t("language_to_en"),
      );
    }

    if (modalClose) {
      modalClose.setAttribute("aria-label", t("modal_close"));
    }

    updateMenuButton();
    renderProjectLists();
    applyTheme(currentTheme);
    setupRevealAnimation();
  }

  function handleSubmit(event) {
    if (!contactForm) {
      return;
    }

    event.preventDefault();
    clearFormStatus();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      showFormStatus(t("form_invalid"), "error");
      return;
    }

    if (!window.emailjs) {
      showFormStatus(t("email_unavailable"), "error");
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitText = submitBtn.querySelector("[data-i18n]");
    submitBtn.disabled = true;
    submitText.textContent = t("form_sending");

    const formData = new FormData(contactForm);
    const templateParams = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    emailjs
      .send("service_denfdhl5702", "template_ys8sncp", templateParams)
      .then(() => {
        showFormStatus(t("form_success"), "success");
        contactForm.reset();
      })
      .catch((error) => {
        console.error("EmailJS error:", error);
        showFormStatus(t("form_error"), "error");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitText.textContent = t("form_submit");
      });
  }

  function loadPreferences() {
    const savedTheme = localStorage.getItem("theme");
    const savedLang = localStorage.getItem("language");
    currentTheme = savedTheme === "light" ? "light" : "dark";
    currentLang = savedLang === "id" ? "id" : "en";
    updateLanguage();
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", toggleMenu);
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      applyTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  if (langBtn) {
    langBtn.addEventListener("click", () => {
      currentLang = currentLang === "en" ? "id" : "en";
      localStorage.setItem("language", currentLang);
      updateLanguage();
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) {
        return;
      }
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    const previewButton = event.target.closest(".project-preview");
    if (previewButton) {
      openModal(
        previewButton.getAttribute("data-preview-src"),
        previewButton.getAttribute("data-preview-alt"),
      );
      return;
    }

    if (imageModal && event.target === imageModal) {
      closeModal();
    }
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (imageModal && imageModal.classList.contains("is-open")) {
        closeModal();
      }
      closeMenu();
    }
  });

  if (contactForm) {
    contactForm.addEventListener("submit", handleSubmit);
  }

  if (window.emailjs) {
    emailjs.init("LBbxezafTLLXm8aGb");
  }

  loadPreferences();
  setupActiveNavigation();
})();
