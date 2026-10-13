document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    gsap.registerPlugin(ScrollTrigger);

    /* ---------- Smooth scroll (Lenis) tersinkron dengan ScrollTrigger ---------- */
    let lenis = null;
    if (!reduceMotion && window.Lenis) {
        lenis = new Lenis({ duration: 1.55, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
        document.documentElement.style.scrollBehavior = "auto";
    }

    // Link anchor (#karya, #kontak, dst.) ikut scroll halus
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            const target = document.querySelector(a.getAttribute("href"));
            if (!target || !lenis) return;
            e.preventDefault();
            lenis.scrollTo(target, { offset: -20 });
        });
    });

    /* ---------- Progress bar scroll ---------- */
    const bar = document.querySelector(".scroll-progress");
    ScrollTrigger.create({
        start: 0, end: "max",
        onUpdate: (self) => { bar.style.width = self.progress * 100 + "%"; }
    });

    /* ---------- Preloader ---------- */
    const preloader = document.querySelector(".preloader");
    const loaderPercentage = document.querySelector(".loader-percentage");
    let progress = 0, started = false;

    const heroTargets = [".hero-photo", ".hero-title .line", ".hero-copy", ".hero-cta", ".nav-status", ".logo", ".nav-links", ".scroll-indicator"];
    let heroDone = false;

    // Jaring pengaman: kalau animasi gagal, semua konten dipaksa tampil
    function showAll() {
        preloader.style.display = "none";
        heroTargets.forEach((t) => document.querySelectorAll(t).forEach((el) => { el.style.opacity = ""; el.style.transform = ""; }));
        gsap.set(heroTargets, { clearProps: "opacity,visibility,transform" });
        gsap.set(".scroll-reveal", { clearProps: "opacity,visibility,transform" });
    }

    function startWebsite() {
        if (started) return;
        started = true;
        try {
            const startHeroTyping = () => {
                if (reduceMotion) return;

                const lines = Array.from(document.querySelectorAll(".hero-title .typing-text"));
                lines.forEach((line) => { line.parentElement.dataset.fullText = line.textContent; });
                lines.forEach((line) => { line.textContent = ""; });

                const typeLine = (lineIndex) => {
                    const line = lines[lineIndex];
                    if (!line) return;

                    const text = line.parentElement.dataset.fullText;
                    let characterIndex = 0;
                    const typeNextCharacter = () => {
                        line.textContent = text.slice(0, ++characterIndex);
                        if (characterIndex < text.length) {
                            setTimeout(typeNextCharacter, 55);
                        } else {
                            setTimeout(() => typeLine(lineIndex + 1), 220);
                        }
                    };
                    typeNextCharacter();
                };

                typeLine(0);
            };

            gsap.to(preloader, {
                yPercent: -100, duration: 1, ease: "power4.inOut", delay: 0.2,
                onComplete: () => { preloader.style.display = "none"; }
            });
            const tl = gsap.timeline({ delay: 0.6, onComplete: () => { heroDone = true; } });
                        tl.fromTo(".hero-photo", { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out" })
                            .fromTo(".hero-title .line", { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.15, ease: "power4.out" }, "-=0.45")
                            .fromTo(".hero-copy, .hero-cta", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }, "-=0.45")
              .fromTo(".nav-status, .logo, .nav-links", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, "-=0.5")
              .fromTo(".scroll-indicator", { opacity: 0 }, { opacity: 0.7, duration: 1 }, "-=0.5")
              .call(startHeroTyping);
        } catch (err) {
            console.error(err);
            showAll();
        }
    }
    setTimeout(() => { if (!heroDone) showAll(); }, 7000);
    window.addEventListener("load", () => ScrollTrigger.refresh());

    const interval = setInterval(() => {
        progress = Math.min(100, progress + Math.floor(Math.random() * 15) + 5);
        loaderPercentage.textContent = progress + "%";
        if (progress === 100) { clearInterval(interval); startWebsite(); }
    }, 100);
    setTimeout(startWebsite, 3000); // jaga-jaga supaya preloader tidak pernah menggantung

    /* ---------- Parallax gambar proyek ---------- */
    if (!reduceMotion) {
        gsap.utils.toArray(".project-image-container").forEach((container) => {
            const img = container.querySelector(".parallax-img");
            if (!img) return;
            gsap.fromTo(img, { yPercent: -10 }, {
                yPercent: 10, ease: "none",
                scrollTrigger: { trigger: container, start: "top bottom", end: "bottom top", scrub: true }
            });
        });
    }

    /* ---------- Interaksi mouse (hanya perangkat dengan mouse) ---------- */
    if (finePointer) {
        const cursor = document.querySelector(".cursor");
        const cursorText = cursor.querySelector(".cursor-text");
        window.addEventListener("mousemove", (e) => {
            cursor.classList.add("is-visible");
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });

        if (!reduceMotion) {
            document.querySelectorAll(".magnetic").forEach((magnet) => {
                magnet.addEventListener("mousemove", (e) => {
                    const r = magnet.getBoundingClientRect();
                    gsap.to(magnet, {
                        x: (e.clientX - r.left - r.width / 2) * 0.3,
                        y: (e.clientY - r.top - r.height / 2) * 0.3,
                        duration: 1, ease: "power4.out"
                    });
                });
                magnet.addEventListener("mouseleave", () => {
                    gsap.to(magnet, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
                });
            });
        }

        document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));

        document.querySelectorAll("a:not(.project-image-container), button, .skill-item").forEach((el) => {
            el.addEventListener("mouseenter", () => cursor.classList.add("hover-active"));
            el.addEventListener("mouseleave", () => cursor.classList.remove("hover-active"));
        });

        document.querySelectorAll("[data-cursor-text]").forEach((el) => {
            el.addEventListener("mouseenter", () => {
                cursor.classList.add("view-active");
                cursorText.textContent = el.dataset.cursorText;
            });
            el.addEventListener("mouseleave", () => {
                cursor.classList.remove("view-active");
                cursorText.textContent = "";
            });
        });

    }

    /* ---------- Reveal saat scroll (sekali saja) ---------- */
    const revealGroups = [
        [".marquee-section", ""],
        [".about-section", ".about-heading, .about-portrait, .about-content > *"],
        [".skills-section", ".section-label, .skill-item"],
        [".journey-section", ".section-label, .timeline li"],
        [".project-section", ".section-label, .project-media, .project-info > *"],
        [".github-cta-section", ".cta-subtitle, .giant-cta"],
        [".contact-section", ".contact-title, .social-btn"]
    ];

    revealGroups.forEach(([section, selector]) => {
        const elements = selector
            ? gsap.utils.toArray(`${section} ${selector}`)
            : gsap.utils.toArray(section);
        if (!elements.length) return;

        elements.forEach((el) => el.classList.add("scroll-reveal"));
        gsap.set(elements, { autoAlpha: 0, y: reduceMotion ? 0 : 36 });
        ScrollTrigger.batch(elements, {
            start: "top 88%",
            once: true,
            onEnter: (batch) => gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: reduceMotion ? 0.55 : 1.35,
                stagger: reduceMotion ? 0.05 : 0.16,
                ease: "power2.out",
                overwrite: true
            })
        });
    });

    if (!reduceMotion) {
        // Angka statistik menghitung naik
        document.querySelectorAll(".stats strong").forEach((el) => {
            const target = parseInt(el.textContent, 10);
            if (isNaN(target) || /[IVX]/.test(el.textContent)) return;
            const suffix = el.textContent.replace(/[0-9]/g, "");
            const obj = { v: 0 };
            gsap.to(obj, {
                v: target, duration: 1.5, ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 90%", once: true },
                onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
            });
        });
    }
});