document.addEventListener("DOMContentLoaded", function() {
    const portfolioText = document.querySelector(".portfolioText");
    if (portfolioText) {
        gsap.to(portfolioText, { duration: 2, opacity: 1 });
    }
});
