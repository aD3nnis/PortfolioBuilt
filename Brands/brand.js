document.addEventListener("DOMContentLoaded", function() {
    let gsapBigImage = document.querySelector("h1");
    gsap.to(gsapBigImage, { duration: 2, opacity: 1 });
});

function flickerLogo() {
    const opacity1 = Math.random();
    const opacity2 = 0;

    const duration = gsap.utils.random(0.6, 3);

    gsap.to("#overMainLogo", { opacity: opacity1, duration: duration, yoyo: true, repeat: 1, onComplete: flickerLogo });
    gsap.to("#overMainLogo", { opacity: opacity2, duration: duration, yoyo: true, repeat: 1 });
}

flickerLogo();
