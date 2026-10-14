/**
 * RICHARD WICLIV ILLU — OFFICIAL PORTFOLIO INTERACTION ENGINE
 * Built with: Vanilla JS, GSAP, ScrollTrigger, Lenis, Web Audio API
 */

document.addEventListener("DOMContentLoaded", () => {
    // Reset scroll position on initial load
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // Media query preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* ==========================================================================
       1. WEB AUDIO API SYNTHESIZER (SUBTLE FUTURISTIC SFX)
       ========================================================================== */
    let audioCtx = null;
    let soundEnabled = localStorage.getItem("richard_sfx") !== "off";

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playTone(freq, type = "sine", duration = 0.05, startGain = 0.04) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.4), ctx.currentTime + duration);

            gain.gain.setValueAtTime(startGain, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch {
            // Audio context safely ignored if blocked by autoplay policy
        }
    }

    function playHoverSound() {
        playTone(720, "sine", 0.03, 0.015);
    }

    function playClickSound() {
        playTone(480, "triangle", 0.06, 0.04);
    }

    function playSuccessSound() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            [523.25, 659.25, 783.99].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + idx * 0.05);
                gain.gain.setValueAtTime(0.03, now + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.12);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.05);
                osc.stop(now + idx * 0.05 + 0.12);
            });
        } catch {}
    }

    function playTerminalKeySound() {
        playTone(320 + Math.random() * 80, "square", 0.02, 0.01);
    }

    // Sound toggle button UI
    const soundToggleBtn = document.getElementById("soundToggleBtn");
    const soundIcon = document.getElementById("soundIcon");

    function updateSoundButtonUI() {
        if (!soundToggleBtn || !soundIcon) return;
        if (soundEnabled) {
            soundIcon.className = "ph ph-speaker-high";
            soundToggleBtn.setAttribute("aria-label", "Matikan Efek Suara");
            soundToggleBtn.setAttribute("title", "Efek Suara: Aktif");
        } else {
            soundIcon.className = "ph ph-speaker-slash";
            soundToggleBtn.setAttribute("aria-label", "Nyalakan Efek Suara");
            soundToggleBtn.setAttribute("title", "Efek Suara: Nonaktif");
        }
    }
    updateSoundButtonUI();

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener("click", () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem("richard_sfx", soundEnabled ? "on" : "off");
            updateSoundButtonUI();
            if (soundEnabled) {
                getAudioContext();
                playSuccessSound();
            }
        });
    }

    // Attach subtle sounds to interactive elements
    document.querySelectorAll("a, button, .skill-card, .project-card, .social-card-btn").forEach((el) => {
        el.addEventListener("mouseenter", () => {
            if (hasFinePointer) playHoverSound();
        });
        el.addEventListener("click", () => {
            playClickSound();
        });
    });

    /* ==========================================================================
       2. THEME SWITCHER (STUDIO LIGHT & OBSIDIAN DARK)
       ========================================================================== */
    const rootHtml = document.documentElement;
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const themeIcon = document.getElementById("themeIcon");
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    // Retrieve saved theme or default to light as selected by user
    let currentTheme = localStorage.getItem("richard_theme") || "light";

    function applyTheme(theme) {
        currentTheme = theme;
        rootHtml.setAttribute("data-theme", theme);
        localStorage.setItem("richard_theme", theme);

        if (themeIcon) {
            themeIcon.className = theme === "dark" ? "ph ph-sun" : "ph ph-moon";
        }
        if (metaThemeColor) {
            metaThemeColor.setAttribute("content", theme === "dark" ? "#090a0f" : "#f6f7f3");
        }
    }

    applyTheme(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const nextTheme = currentTheme === "dark" ? "light" : "dark";
            applyTheme(nextTheme);
            playSuccessSound();
        });
    }

    /* ==========================================================================
       3. DYNAMIC ROLE ROTATOR (HERO)
       ========================================================================== */
    const roleRotatorText = document.getElementById("roleRotatorText");
    const roles = [
        "Siswa RPL · SMK PGRI 3 Malang",
        "Belajar Web Development",
        "Tertarik di Frontend & UI",
        "Suka Nyoba Hal Baru"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeRoles() {
        if (!roleRotatorText || prefersReducedMotion) return;

        const currentRole = roles[roleIndex];
        if (isDeleting) {
            roleRotatorText.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            roleRotatorText.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let typingSpeed = isDeleting ? 30 : 70;

        if (!isDeleting && charIndex === currentRole.length) {
            typingSpeed = 2200; // Pause at full word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 400; // Pause before typing next
        }

        setTimeout(typeRoles, typingSpeed);
    }

    /* ==========================================================================
       4. HERO DUAL AVATAR SWITCHER (SISWA RPL VS SISI KREATIF)
       ========================================================================== */
    const tabStudent = document.getElementById("tabStudentPhoto");
    const tabGuitar = document.getElementById("tabGuitarPhoto");
    const avatarStudent = document.getElementById("avatarStudent");
    const avatarGuitar = document.getElementById("avatarGuitar");
    const avatarCaption = document.getElementById("avatarCaption");

    if (tabStudent && tabGuitar && avatarStudent && avatarGuitar) {
        tabStudent.addEventListener("click", () => {
            tabStudent.classList.add("active");
            tabStudent.setAttribute("aria-selected", "true");
            tabGuitar.classList.remove("active");
            tabGuitar.setAttribute("aria-selected", "false");

            avatarStudent.classList.remove("hidden-photo");
            avatarGuitar.classList.add("hidden-photo");
            if (avatarCaption) avatarCaption.textContent = "Kelas XI RPL · SMK PGRI 3 Malang";
            playClickSound();
        });

        tabGuitar.addEventListener("click", () => {
            tabGuitar.classList.add("active");
            tabGuitar.setAttribute("aria-selected", "true");
            tabStudent.classList.remove("active");
            tabStudent.setAttribute("aria-selected", "false");

            avatarGuitar.classList.remove("hidden-photo");
            avatarStudent.classList.add("hidden-photo");
            if (avatarCaption) avatarCaption.textContent = "Hobi Musik · Bermain Gitar Elektrik";
            playSuccessSound();
        });
    }

    /* ==========================================================================
       5. SKILLS MATRIX FILTERING
       ========================================================================== */
    const skillTabBtns = document.querySelectorAll(".skills-tab-btn");
    const skillCards = document.querySelectorAll(".skill-card");
    const skillsCountLabel = document.getElementById("skillsCountLabel");

    skillTabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            skillTabBtns.forEach((b) => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");

            const filter = btn.dataset.skillFilter;
            let visibleCount = 0;

            skillCards.forEach((card) => {
                const category = card.dataset.category;
                const matches = filter === "all" || category === filter;
                card.style.display = matches ? "flex" : "none";
                if (matches) visibleCount++;
            });

            if (skillsCountLabel) {
                skillsCountLabel.textContent = `${visibleCount} Teknologi Ditampilkan`;
            }
            playClickSound();
            if (window.ScrollTrigger) ScrollTrigger.refresh();
        });
    });

    /* ==========================================================================
       6. PROJECTS FILTERING
       ========================================================================== */
    const projectFilterBtns = document.querySelectorAll(".project-filter-btn");
    const projectCards = document.querySelectorAll(".project-card");
    const projectCountDisplay = document.getElementById("projectCountDisplay");

    projectFilterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            projectFilterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;
            let count = 0;

            projectCards.forEach((card) => {
                const category = card.dataset.category;
                const matches = filter === "all" || category === filter;
                card.style.display = matches ? "flex" : "none";
                if (matches) count++;
            });

            if (projectCountDisplay) {
                projectCountDisplay.textContent = `${count} Proyek Ditampilkan`;
            }
            playClickSound();
            if (window.ScrollTrigger) ScrollTrigger.refresh();
        });
    });

    /* ==========================================================================
       7. FLAPPY BIRD GAME MODAL
       ========================================================================== */
    const gameModal = document.getElementById("gameModal");
    const openGameModalBtn = document.getElementById("openGameModalBtn");
    const btnPlayFlappy = document.getElementById("btnPlayFlappy");
    const closeGameModalBtn = document.getElementById("closeGameModalBtn");
    const gameIframe = document.getElementById("gameIframe");

    function openGame() {
        if (!gameModal) return;
        gameModal.classList.add("is-open");
        // Reload iframe if needed
        if (gameIframe && !gameIframe.src) {
            gameIframe.src = "https://flappybirdrch.vercel.app/";
        }
        playSuccessSound();
    }

    function closeGame() {
        if (!gameModal) return;
        gameModal.classList.remove("is-open");
        playClickSound();
    }

    if (openGameModalBtn) openGameModalBtn.addEventListener("click", openGame);
    if (btnPlayFlappy) btnPlayFlappy.addEventListener("click", openGame);
    if (closeGameModalBtn) closeGameModalBtn.addEventListener("click", closeGame);

    if (gameModal) {
        gameModal.addEventListener("click", (e) => {
            if (e.target === gameModal) closeGame();
        });
    }

    /* ==========================================================================
       8. MINI TERMINAL / CLI INTERACTIVE CONSOLE
       ========================================================================== */
    const terminalModal = document.getElementById("terminalModal");
    const floatingTerminalBtn = document.getElementById("floatingTerminalBtn");
    const heroTerminalTrigger = document.getElementById("heroTerminalTrigger");
    const btnOpenTerminalQuick = document.getElementById("btnOpenTerminalQuick");
    const closeTerminalBtn = document.getElementById("closeTerminalBtn");
    const terminalInput = document.getElementById("terminalInput");
    const terminalOutput = document.getElementById("terminalOutput");
    const terminalBody = document.getElementById("terminalBody");

    function openTerminal() {
        if (!terminalModal) return;
        terminalModal.classList.add("is-open");
        if (terminalInput) {
            setTimeout(() => terminalInput.focus(), 100);
        }
        playSuccessSound();
    }

    function closeTerminal() {
        if (!terminalModal) return;
        terminalModal.classList.remove("is-open");
        playClickSound();
    }

    if (floatingTerminalBtn) floatingTerminalBtn.addEventListener("click", openTerminal);
    if (heroTerminalTrigger) heroTerminalTrigger.addEventListener("click", openTerminal);
    if (btnOpenTerminalQuick) btnOpenTerminalQuick.addEventListener("click", openTerminal);
    if (closeTerminalBtn) closeTerminalBtn.addEventListener("click", closeTerminal);

    if (terminalModal) {
        terminalModal.addEventListener("click", (e) => {
            if (e.target === terminalModal) closeTerminal();
        });
    }

    // Global shortcut to toggle terminal (press `~` key)
    window.addEventListener("keydown", (e) => {
        if (e.key === "`" && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
            e.preventDefault();
            if (terminalModal && terminalModal.classList.contains("is-open")) {
                closeTerminal();
            } else {
                openTerminal();
            }
        } else if (e.key === "Escape") {
            closeTerminal();
            closeGame();
        }
    });

    // Terminal command processor
    const terminalCommands = {
        help: () => `Perintah yang tersedia:
  <span class="cmd-highlight">help</span>      - Menampilkan panduan perintah ini
  <span class="cmd-highlight">about</span>     - Profil singkat Richard Wicliv Illu
  <span class="cmd-highlight">skills</span>    - Ringkasan tech stack & penguasaan
  <span class="cmd-highlight">projects</span>  - Daftar proyek pilihan
  <span class="cmd-highlight">pkl</span>       - Informasi kesiapan & kualifikasi PKL
  <span class="cmd-highlight">contact</span>   - Kontak email, WhatsApp, GitHub
  <span class="cmd-highlight">play</span>      - Buka game Flappy Bird langsung
  <span class="cmd-highlight">theme</span>     - Ganti tema (light / dark)
  <span class="cmd-highlight">guitar</span>    - Cerita di balik hobi musik & gitar
  <span class="cmd-highlight">cv</span>        - Buka / unduh berkas CV resmi
  <span class="cmd-highlight">matrix</span>    - Efek visual Matrix hacker
  <span class="cmd-highlight">clear</span>     - Bersihkan layar terminal`,

        about: () => `Nama: <span class="accent-txt">Richard Wicliv Illu</span>
Status: Siswa kelas XI Rekayasa Perangkat Lunak (RPL) di SMK PGRI 3 Malang.
Masih tahap belajar membuat website dan senang mencoba hal-hal baru.`,

        skills: () => `Teknologi yang sedang dipelajari (tingkat dasar - menengah):
- HTML (~65%): Struktur dasar web & tugas sekolah
- Java (~55%): Logika pemrograman & dasar OOP di sekolah
- CSS (~40%): Penataan layout sederhana
- MySQL (~35%): Tabel dan database dasar
- JavaScript (~30%): Logika interaksi & DOM dasar
- Laravel (~30%): Konsep routing & controller dasar`,

        projects: () => `Beberapa proyek yang pernah dibuat:
1. <span class="cmd-highlight">Orbii (Klub Hobi)</span>: Tugas web komunitas (Laravel & Tailwind)
2. <span class="cmd-highlight">Flappy Bird</span>     : Game sederhana pakai Canvas & JavaScript
3. <span class="cmd-highlight">Portofolio</span>      : Halaman portofolio sederhana ini
Ketik <span class="cmd-highlight">'play'</span> untuk coba game Flappy Bird!`,

        pkl: () => `Status PKL:
Siswa kelas XI RPL SMK PGRI 3 Malang.
Masih tahap belajar, siap menerima arahan, bimbingan, dan masukan dari tim/mentor.
Kontak WhatsApp: <span class="accent-txt">+62 813-1797-7951</span>`,

        contact: () => `Kontak Richard:
- WhatsApp  : +62 813-1797-7951
- Email     : richardillu942@gmail.com
- Instagram : @richardd_cz
- GitHub    : github.com/richardillu942-del`,

        play: () => {
            setTimeout(openGame, 400);
            return `<span class="success-txt">Membuka game Flappy Bird...</span>`;
        },

        flappy: () => {
            setTimeout(openGame, 400);
            return `<span class="success-txt">Membuka game Flappy Bird...</span>`;
        },

        theme: () => {
            const next = currentTheme === "dark" ? "light" : "dark";
            applyTheme(next);
            return `Tema diganti ke: <span class="accent-txt">${next.toUpperCase()}</span>`;
        },

        guitar: () => `Di luar waktu sekolah, saya suka main gitar elektrik buat refreshing.
Sama kayak ngoding, main musik juga butuh latihan pelan-pelan dan sabar!`,

        cv: () => {
            window.open("cv-richard-wicliv-illu.pdf", "_blank");
            return `<span class="success-txt">Membuka berkas CV di tab baru...</span>`;
        },

        matrix: () => `01010010 01001001 01000011 01001000 01000001 01010010 01000100
Halo dari Matrix! Salam kenal :)`,

        clear: () => {
            if (terminalOutput) terminalOutput.innerHTML = "";
            return "";
        }
    };

    if (terminalInput) {
        terminalInput.addEventListener("keydown", (e) => {
            playTerminalKeySound();
            if (e.key === "Enter") {
                const rawCmd = terminalInput.value.trim();
                const cmd = rawCmd.toLowerCase();
                terminalInput.value = "";

                if (!cmd) return;

                const line = document.createElement("div");
                line.style.margin = "8px 0";
                line.innerHTML = `<span class="terminal-prompt">richard@dev:~$</span> ${escapeHtml(rawCmd)}`;
                terminalOutput.appendChild(line);

                const responseLine = document.createElement("div");
                responseLine.style.marginBottom = "14px";

                if (terminalCommands[cmd]) {
                    const result = terminalCommands[cmd]();
                    if (result) responseLine.innerHTML = result;
                } else {
                    responseLine.innerHTML = `Perintah tidak dikenali: <span style="color:#ef4444;">${escapeHtml(rawCmd)}</span>. Ketik <span class="cmd-highlight">'help'</span> untuk bantuan.`;
                }

                terminalOutput.appendChild(responseLine);
                if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
            }
        });
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    /* ==========================================================================
       9. QUICK CONTACT FORM (WHATSAPP REDIRECT) & TOOLS
       ========================================================================== */
    const quickContactForm = document.getElementById("quickContactForm");
    const contactToast = document.getElementById("contactToast");
    const btnCopyEmail = document.getElementById("btnCopyEmail");
    const btnSaveVcard = document.getElementById("btnSaveVcard");

    if (quickContactForm) {
        quickContactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const senderName = document.getElementById("senderName").value.trim();
            const contactTopic = document.getElementById("contactTopic").value;
            const senderMessage = document.getElementById("senderMessage").value.trim();

            const messageText = `Halo Richard, saya ${senderName}.\n\n*Topik:* ${contactTopic}\n*Pesan:* ${senderMessage}`;
            const encodedText = encodeURIComponent(messageText);
            const waUrl = `https://wa.me/6281317977951?text=${encodedText}`;

            playSuccessSound();
            if (contactToast) {
                contactToast.textContent = "Mengarahkan ke WhatsApp...";
            }
            window.open(waUrl, "_blank");
        });
    }

    // Copy Email button
    if (btnCopyEmail) {
        btnCopyEmail.addEventListener("click", async () => {
            const email = btnCopyEmail.dataset.email || "richardillu942@gmail.com";
            try {
                await navigator.clipboard.writeText(email);
                if (contactToast) {
                    contactToast.textContent = "Alamat email berhasil disalin ke clipboard!";
                    setTimeout(() => { if (contactToast) contactToast.textContent = ""; }, 4000);
                }
                playSuccessSound();
            } catch {
                if (contactToast) contactToast.textContent = `Salin manual: ${email}`;
            }
        });
    }

    // Download vCard
    if (btnSaveVcard) {
        btnSaveVcard.addEventListener("click", () => {
            const vCard = [
                "BEGIN:VCARD",
                "VERSION:3.0",
                "FN:Richard Wicliv Illu",
                "TITLE:Siswa RPL / Web Developer",
                "ORG:SMK PGRI 3 Malang",
                "TEL;TYPE=CELL:+6281317977951",
                "EMAIL;TYPE=INTERNET:richardillu942@gmail.com",
                "URL:https://github.com/richardillu942-del",
                "ADR;TYPE=HOME:;;;;Malang;Jawa Timur;Indonesia",
                "END:VCARD"
            ].join("\r\n");

            const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Richard-Wicliv-Illu-SMKPGRI3.vcf";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);

            if (contactToast) {
                contactToast.textContent = "Kartu kontak (vCard) siap diunduh.";
                setTimeout(() => { if (contactToast) contactToast.textContent = ""; }, 4000);
            }
            playSuccessSound();
        });
    }

    /* ==========================================================================
       10. LENIS SMOOTH SCROLLING & SCROLL PROGRESS
       ========================================================================== */
    let lenis = null;
    if (!prefersReducedMotion && window.Lenis) {
        lenis = new Lenis({
            duration: 1.35,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });

        lenis.on("scroll", () => {
            if (window.ScrollTrigger) ScrollTrigger.update();
        });

        if (window.gsap) {
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        }
    }

    // Anchor links smooth navigation
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
            const href = anchor.getAttribute("href");
            if (href === "#" || !href) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                if (lenis) {
                    lenis.scrollTo(target, { offset: -60 });
                } else {
                    target.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    });

    // Scroll progress bar and back to top
    const scrollProgress = document.getElementById("scrollProgress");
    const backToTopBtn = document.getElementById("backToTopBtn");
    const navbar = document.getElementById("navbar");

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (scrollProgress) {
            scrollProgress.style.width = `${progress}%`;
        }

        if (backToTopBtn) {
            backToTopBtn.classList.toggle("is-visible", scrollTop > 350);
        }

        if (navbar) {
            navbar.classList.toggle("scrolled", scrollTop > 40);
        }
    });

    /* ==========================================================================
       11. CUSTOM CURSOR
       ========================================================================== */
    if (hasFinePointer) {
        const cursor = document.getElementById("customCursor");
        const cursorText = document.getElementById("cursorText");

        window.addEventListener("mousemove", (e) => {
            if (!cursor) return;
            cursor.classList.add("is-visible");
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });

        document.addEventListener("mouseleave", () => {
            if (cursor) cursor.classList.remove("is-visible");
        });

        document.querySelectorAll("a, button, .photo-tab-btn, .skills-tab-btn, .project-filter-btn").forEach((el) => {
            el.addEventListener("mouseenter", () => cursor?.classList.add("hover-active"));
            el.addEventListener("mouseleave", () => cursor?.classList.remove("hover-active"));
        });

        document.querySelectorAll("[data-cursor-text]").forEach((el) => {
            el.addEventListener("mouseenter", () => {
                if (!cursor || !cursorText) return;
                cursor.classList.add("view-active");
                cursorText.textContent = el.dataset.cursorText;
            });
            el.addEventListener("mouseleave", () => {
                if (!cursor || !cursorText) return;
                cursor.classList.remove("view-active");
                cursorText.textContent = "";
            });
        });
    }

    /* ==========================================================================
       12. PRELOADER & INITIAL ANIMATION (CINEMATIC OPENING ENGINE)
       ========================================================================== */
    const preloader = document.getElementById("preloader");
    const loaderContent = document.querySelector(".loader-content");
    const loaderPercentage = document.getElementById("loaderPercentage");
    const loaderFill = document.getElementById("loaderFill");
    const loaderFlare = document.getElementById("loaderFlare");
    const loaderStepText = document.getElementById("loaderStepText");
    const loaderStatus = document.getElementById("loaderStatus");

    let isSiteRevealed = false;

    function revealSite() {
        if (isSiteRevealed) return;
        isSiteRevealed = true;

        if (!preloader) {
            typeRoles();
            return;
        }

        if (prefersReducedMotion || !window.gsap) {
            preloader.style.display = "none";
            typeRoles();
            return;
        }

        const masterTL = gsap.timeline();

        // 1. Fade out the loader content gently with upward float
        if (loaderContent) {
            masterTL.to(loaderContent, {
                y: -30,
                opacity: 0,
                scale: 0.98,
                duration: 0.45,
                ease: "power3.in"
            });
        }

        // 2. Preloader curtain sweeps upward with laser scanner border
        masterTL.to(preloader, {
            yPercent: -100,
            duration: 0.95,
            ease: "power4.inOut",
            onComplete: () => {
                preloader.style.display = "none";
            }
        }, "-=0.15");

        // 3. Staggered, cinematic Hero entrance beneath the sweeping curtain
        const navbar = document.getElementById("navbar");
        if (navbar) {
            masterTL.fromTo(navbar,
                { y: -35, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
                "-=0.65"
            );
        }

        const badgeWrap = document.querySelector(".hero-badge-wrap");
        if (badgeWrap) {
            masterTL.fromTo(badgeWrap,
                { y: 22, opacity: 0, scale: 0.94 },
                { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.4)" },
                "-=0.55"
            );
        }

        const greeting = document.querySelector(".greeting");
        if (greeting) {
            masterTL.fromTo(greeting,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
                "-=0.5"
            );
        }

        const heroTitle = document.querySelector(".hero-title");
        if (heroTitle) {
            masterTL.fromTo(heroTitle,
                { y: 35, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
                "-=0.45"
            );
        }

        const roleRotator = document.querySelector(".hero-role-rotator");
        if (roleRotator) {
            masterTL.fromTo(roleRotator,
                { y: 20, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.5, 
                    ease: "power3.out",
                    onComplete: () => {
                        typeRoles();
                    }
                },
                "-=0.4"
            );
        } else {
            typeRoles();
        }

        const cardContainer = document.querySelector(".hero-card-container");
        if (cardContainer) {
            masterTL.fromTo(cardContainer,
                { y: 45, opacity: 0, scale: 0.93, rotateX: 6 },
                { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.85, ease: "power3.out" },
                "-=0.55"
            );
        }

        const heroTerminal = document.getElementById("heroTerminalTrigger");
        if (heroTerminal) {
            masterTL.fromTo(heroTerminal,
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.8)" },
                "-=0.35"
            );
        }

        const heroCopy = document.querySelector(".hero-copy");
        if (heroCopy) {
            masterTL.fromTo(heroCopy,
                { y: 25, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
                "-=0.4"
            );
        }

        const heroBtns = document.querySelectorAll(".hero-cta .btn");
        if (heroBtns.length) {
            masterTL.fromTo(heroBtns,
                { y: 22, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: "back.out(1.3)" },
                "-=0.35"
            );
        }

        const statsRow = document.querySelector(".hero-stats-row");
        if (statsRow) {
            masterTL.fromTo(statsRow,
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.out",
                    onStart: () => {
                        const statNumEl = document.querySelector(".hero-stat-item strong");
                        if (statNumEl && !isNaN(parseInt(statNumEl.textContent))) {
                            const target = parseInt(statNumEl.textContent);
                            const counter = { val: 0 };
                            gsap.to(counter, {
                                val: target,
                                duration: 1.1,
                                ease: "power2.out",
                                onUpdate: () => {
                                    statNumEl.textContent = Math.round(counter.val);
                                }
                            });
                        }
                    }
                },
                "-=0.3"
            );
        }
    }

    // Run Preloader Sequence
    if (preloader && !prefersReducedMotion && window.gsap) {
        const loaderProgressObj = { val: 0 };

        gsap.to(loaderProgressObj, {
            val: 100,
            duration: 1.35,
            ease: "power2.inOut",
            onUpdate: () => {
                const current = Math.round(loaderProgressObj.val);
                if (loaderPercentage) loaderPercentage.textContent = `${current}%`;
                if (loaderFill) loaderFill.style.width = `${current}%`;
                if (loaderFlare) {
                    loaderFlare.style.left = `${current}%`;
                    if (current >= 100) loaderFlare.style.opacity = "0";
                }

                if (loaderStepText) {
                    if (current < 25) {
                        loaderStepText.textContent = "Menghubungkan ke portofolio...";
                    } else if (current < 55) {
                        loaderStepText.textContent = "Menata tata letak & tema visual...";
                    } else if (current < 85) {
                        loaderStepText.textContent = "Memuat proyek & interaksi...";
                    } else if (current < 100) {
                        loaderStepText.textContent = "Finishing touch...";
                    } else {
                        loaderStepText.textContent = "Selamat datang!";
                    }
                }
            },
            onComplete: () => {
                if (loaderStatus) {
                    loaderStatus.classList.add("is-ready");
                    loaderStatus.innerHTML = "<i></i> SIAP";
                }
                playSuccessSound();
                setTimeout(revealSite, 240);
            }
        });
    } else {
        revealSite();
    }

    // Safety fallback timeout to prevent ever getting stuck
    setTimeout(() => {
        if (!isSiteRevealed) {
            revealSite();
        }
    }, 2800);

    /* ==========================================================================
       13. GSAP SCROLL REVEALS
       ========================================================================== */
    if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
        gsap.registerPlugin(ScrollTrigger);

        const revealSections = [
            ".about-layout",
            ".skills-grid",
            ".project-grid",
            ".timeline",
            ".workflow-grid",
            ".contact-layout"
        ];

        revealSections.forEach((selector) => {
            const el = document.querySelector(selector);
            if (!el) return;

            gsap.from(el, {
                opacity: 0,
                y: 35,
                duration: 0.9,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    once: true
                }
            });
        });
    }
});