
console.log("in it ")
document.addEventListener("DOMContentLoaded", function() {
    // Your JavaScript code goes here
    let idPortfolio = document.querySelector(".portfolioText");
    gsap.to(idPortfolio, { duration: 2, opacity: 1 });
    // gsap.to(gsapBigImage, { duration: 1, scaleX: 1.2, scaleY: 1.2 });
});