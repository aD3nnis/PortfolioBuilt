

// Wait for the DOM to be fully loaded before executing JavaScript
document.addEventListener("DOMContentLoaded", function() {
    // Your JavaScript code goes here
    let gsapBigImage = document.querySelector("h1");
    gsap.to(gsapBigImage, { duration: 2, opacity: 1 });
    // gsap.to(gsapBigImage, { duration: 1, scaleX: 1.2, scaleY: 1.2 });
});




// Register ScrollTrigger with GSAP

// gsap.registerPlugin(ScrollTrigger);

// // ScrollTrigger based animation
// document.addEventListener("DOMContentLoaded", function() {
//     // Select the element to animate
//     const gsapBigImage = document.querySelector(".gsapBigImage");

//     // Create the ScrollTrigger
//     ScrollTrigger.create({
//         trigger: gsapBigImage,
//         start: "top top", // Trigger animation when the top of the element hits the top of the viewport
//         end: "bottom bottom", // End animation when the bottom of the element hits the bottom of the viewport
//         onUpdate: self => {
//             // Update scale based on the scroll position
//             const scale = self.progress * 2 + 1; // Scale factor increases gradually from 1 to 3 as the user scrolls
//             // Apply GSAP animation
//             gsap.to(gsapBigImage, { duration: 0.5, scale: scale });
//         }
//     });
// });