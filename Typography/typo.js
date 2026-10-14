document.addEventListener("DOMContentLoaded", function() {
    let gsapBigImage = document.querySelector("h1");
    gsap.to(gsapBigImage, { duration: 2, opacity: 1 });
    let moveImage = document.querySelector(".cover_evo");
    gsap.to(moveImage, { x: "100vw", duration: 3 });
    gsap.to(moveImage, { opacity: 0, duration: 0, delay: 3, onComplete: hideImage });
    gsap.to(moveImage, { x: "-100vw", duration: 0, delay: 3});
    function hideImage() {
      moveImage.style.display = "none";
    }
});
