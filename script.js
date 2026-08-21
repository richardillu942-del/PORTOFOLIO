document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);
    const cursor = document.querySelector('.cursor');
    const hoverImageReveal = document.querySelector('.hover-image-reveal');
    const hoverImage = hoverImageReveal.querySelector('img');
    const ctaTrigger = document.querySelector('.hover-reveal-trigger');
    const profilePic = document.querySelector('.profile-container');

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

        const updateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            requestAnimationFrame(updateCursor);
        };
        requestAnimationFrame(updateCursor);

        document.querySelectorAll('a, button, .profile-container').forEach(el => {
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

    const tl = gsap.timeline({ delay: 0.2 });

    tl.from('.profile-container', { scale: 0, opacity: 0, duration: 1, ease: "back.out(1.5)" })
      .from('.hero-title .line', { y: 150, opacity: 0, duration: 1, stagger: 0.15, ease: "power4.out" }, "-=0.5")
      .from('.bio-text p', { y: 20, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }, "-=0.6")
      .from('.nav-status', { opacity: 0, x: -20, duration: 0.8 }, "-=0.5");

    const revealElements = document.querySelectorAll('.reveal-up');
    
    revealElements.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%", 
                toggleActions: "play none none reverse"
            },
            y: 80,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });
});