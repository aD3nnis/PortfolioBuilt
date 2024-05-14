

document.addEventListener("DOMContentLoaded", function() {
    // Your JavaScript code goes here
    let gsapBigImage = document.querySelector("h1");
    gsap.to(gsapBigImage, { duration: 2, opacity: 1 });
    // gsap.to(gsapBigImage, { duration: 1, scaleX: 1.2, scaleY: 1.2 });
});
function flickerLogo() {
    // Randomly generate the opacity values
    const opacity1 = Math.random();
    const opacity2 = Math.random();

    // Duration of the flicker animation
    const duration = gsap.utils.random(0.2, 0.6); // Random duration between 0.1 and 0.5 seconds

    // Animate the opacity back and forth
    gsap.to("#overMainLogo", { opacity: opacity1, duration: duration, yoyo: true, repeat: 1, onComplete: flickerLogo });
    gsap.to("#overMainLogo", { opacity: opacity2, duration: duration, yoyo: true, repeat: 1 });
  }

  // Start the flickering effect
  flickerLogo();