document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);
    const cursor = document.querySelector('.cursor');
    const hoverImageReveal = document.querySelector('.hover-image-reveal');
    const hoverImage = hoverImageReveal.querySelector('img');
    const ctaTrigger = document.querySelector('.hover-reveal-trigger');
    const profilePic = document.querySelector('.profile-container');
    const magnets = document.querySelectorAll('.magnetic');

    let xTo = gsap.quickTo(hoverImageReveal, "left", {duration: 0.4, ease: "power3"}),
        yTo = gsap.quickTo(hoverImageReveal, "top", {duration: 0.4, ease: "power3"});
    
    let cursorX = 0, cursorY = 0;
    let mouseX = 0, mouseY = 0;

    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            xTo(mouseX);
            yTo(mouseY);

            if(profilePic) {
                const speed = profilePic.getAttribute('data-speed');
                const x = (window.innerWidth - mouseX * 2) * speed;
                const y = (window.innerHeight - mouseY * 2) * speed;
                gsap.to(profilePic, { x: x, y: y, duration: 1, ease: "power2.out" });
            }
        });

        // Magnetic Effect Logic
        magnets.forEach((magnet) => {
            magnet.addEventListener('mousemove', function(e) {
                const position = magnet.getBoundingClientRect();
                const x = e.pageX - position.left - position.width / 2;
                const y = e.pageY - position.top - position.height / 2;
                gsap.to(magnet, { x: x * 0.3, y: y * 0.3, duration: 1, ease: "power4.out" });
            });
            magnet.addEventListener('mouseleave', function() {
                gsap.to(magnet, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
            });
        });

        const updateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            requestAnimationFrame(updateCursor);
        };
        requestAnimationFrame(updateCursor);

        document.querySelectorAll('a, button, .profile-container, .magnetic').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover-active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover-active'));
        });

        if(ctaTrigger) {
            ctaTrigger.addEventListener('mouseenter', () => {
                const imgSrc = ctaTrigger.getAttribute('data-img');
                hoverImage.src = imgSrc;
                gsap.to(hoverImageReveal, { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.5)" });
            });

            ctaTrigger.addEventListener('mouseleave', () => {
                gsap.to(hoverImageReveal, { opacity: 0, scale: 0.5, rotation: 10, duration: 0.3, ease: "power2.out" });
            });
        }
    }

    // Smoother Entry Animations
    const tl = gsap.timeline({ delay: 0.2 });
    tl.from('.profile-container', { scale: 0, opacity: 0, duration: 1.2, ease: "elastic.out(1, 0.5)" })
      .from('.hero-title .line', { y: 150, opacity: 0, duration: 1, stagger: 0.15, ease: "power4.out" }, "-=0.8")
      .from('.bio-text p', { y: 20, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }, "-=0.6")
      .from('.nav-status, .logo', { opacity: 0, y: -20, duration: 0.8, stagger: 0.1 }, "-=0.5");

    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach(el => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
            y: 50, opacity: 0, duration: 1, ease: "power3.out"
        });
    });
});