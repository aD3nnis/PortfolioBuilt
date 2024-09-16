        gsap.registerPlugin(ScrollTrigger);

        gsap.fromTo(".journey-text", 
            {
                y: 200,
                opacity: 0
            }, 
            {
                y: 0,
                opacity: 1,
                scrollTrigger: {
                    trigger: ".halo-text",
                    start: "top top",
                    endTrigger: ".halo-journey-img",
                    end: "top top",
                    scrub: true, // Adjust animation based on scroll position
                    // markers: true // Remove this line in production
                }
            }
        );