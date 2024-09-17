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
        gsap.fromTo(".experience-text", 
            {
                x: -100,
                opacity: 0
            }, 
            {
                x: 0,
                opacity: 1,
                scrollTrigger: {
                    trigger: ".halo-text",
                    start: "top-=100px top",
                    endTrigger: ".halo-experience-img",
                    end: "top top",
                    scrub: true, // Adjust animation based on scroll position
                    // markers: true // Remove this line in production
                }
            }
        );


        gsap.fromTo(".testing-container", 
            {
                opacity: 0, // Start fully outside the view
            },
            {
                opacity: 1,  // End fully inside the view
                scrollTrigger: {
                trigger: ".halo-experience-img",
                start: "top top", // Start animation when .halo-experience-img reaches the top of the viewport
                endTrigger: ".halo-atmosphere-img",
                end: "top top", // End animation when .halo-atmosphere-img reaches the top of the center of the viewport
                scrub: true, // Smoothly syncs the animation progress with the scrollbar
            }
            }
          );