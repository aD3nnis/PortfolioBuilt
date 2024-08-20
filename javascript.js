
console.log("in it ")
document.addEventListener("DOMContentLoaded", function() {
    // Your JavaScript code goes here
    // let idPortfolio = document.querySelector(".portfolioText");
    // gsap.to(idPortfolio, { duration: 2, opacity: 1 });
});
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the default form submission

            fetch('http://localhost:5000/run_script', {
                method: 'POST'
            })
            .then(response => response.text()) // Read response text
            .then(data => {
                console.log('Success:', data); // Log the response data
            })
            .catch(error => {
                console.error('Error:', error); // Log any errors
            });
        });
    } else {
        console.error('Form element not found');
    }
});
