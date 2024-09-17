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


        // gsap.fromTo("textPath", 
        //     {
        //         opacity: 0, // Start fully outside the view
        //     },
        //     {
        //         opacity: 1,  // End fully inside the view
        //         scrollTrigger: {
        //         trigger: ".halo-experience-img",
        //         start: "top top", // Start animation when .halo-experience-img reaches the top of the viewport
        //         endTrigger: ".halo-atmosphere-img",
        //         end: "top top", // End animation when .halo-atmosphere-img reaches the top of the center of the viewport
        //         scrub: true, // Smoothly syncs the animation progress with the scrollbar
        //     }
        //     }
        //   );
          // GSAP animation setup
          gsap.utils.toArray('.letter').forEach((letter, index) => {
            // Calculate stagger delay based on index
            const staggerDelay = (index/2) * 0.16; 
          
            gsap.fromTo(letter,
                            {
                opacity: 0, // Start fully outside the view
            },
                 {
            pacity:1,
              scrollTrigger: {
                trigger: '.halo-experience-img',
                start: 'center top',
                endTrigger: ".halo-journey-img",
                end: "center top",// Adjust the end point based on when you want the animation to end
                scrub: true, // Link animation progress to scroll position
                onUpdate: self => {
                  // Calculate opacity based on scroll progress
                  const scrollProgress = (self.progress - staggerDelay) / (1 - staggerDelay);
                  const clampedProgress = Math.min(1, Math.max(0, scrollProgress));
                  gsap.set(letter, { opacity: clampedProgress });     },
              },
            });
          });
          
          
          
          