        gsap.registerPlugin(ScrollTrigger);
        gsap.fromTo(".experience-text", 
            {
                x: -100,
                opacity: 0,
            }, 
            {
                x: 0,
                opacity: 1,
                scrollTrigger: {
                    trigger: ".halo-text",
                    start: "top-=200px top",
                    endTrigger: ".halo-experience-img",
                    end: "top top",
                    scrub: true, // Adjust animation based on scroll position
                    // markers: true // Remove this line in production
                }
            }
        );
        //halo-experience-img
        gsap.fromTo(".halo-experience-img", 
            {
                opacity: 0,
            }, 
            {
                y: -30,
                opacity: 1,
                scrollTrigger: {
                    trigger: ".halo-text",
                    start: "top-=400px top",
                    endTrigger: ".halo-text",
                    end: "top top",
                    scrub: true, // Adjust animation based on scroll position
                    // markers: true // Remove this line in production
                }
            }
        );
        gsap.fromTo(".halo-text",
            {
                opacity: 0
                
            }, 
            {
                opacity: 1,
                scale:1.2,
                scrollTrigger: {
                    trigger: ".halo-text",
                    start: "top-=600px top",
                    endTrigger: ".halo-text",
                    end: "center top",
                    scrub: true, // Adjust animation based on scroll position
                    // markers: true // Remove this line in production
                }
            }
        );
        gsap.fromTo(".answering-questions",
            {
                opacity: 0
                
            }, 
            {
                opacity: 1,
                scrollTrigger: {
                    trigger: ".halo-text",
                    start: "top-=600px top",
                    endTrigger: ".halo-text",
                    end: "bottom top",
                    scrub: true, // Adjust animation based on scroll position
                    // markers: true // Remove this line in production
                }
            }
        );
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
                    end: "top-=100px top",
                    scrub: true, // Adjust animation based on scroll position
                    // markers: true // Remove this line in production
                }
            }
            
        );
        gsap.fromTo(".halo-journey-img", 
            {
                opacity: 0.3,
                
            }, 
            {
                y: -20,
                opacity: 1,
                scrollTrigger: {
                    trigger: ".halo-text",
                    start: "top-=100px top",
                    endTrigger: ".halo-text",
                    end: "center top",
                    scrub: true, // Adjust animation based on scroll position
                    // markers: true // Remove this line in production
                }
            }
        );


          // GSAP animation setup
          gsap.utils.toArray('.letter').forEach((letter, index) => {
            // Calculate stagger delay based on index
            const staggerDelay = (index/2) * 0.16; 
          
            gsap.fromTo(letter,
                            {
                opacity: 0, // Start fully outside the view
            },
                 {
            opacity:1,
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
          gsap.fromTo(".halo-atmosphere-img", 
            {
                opacity: 0.5,
                y: 20,
            }, 
            {
                y: 0,
                opacity: 1,
                scrollTrigger: {
                    trigger: '.halo-experience-img',
                    start: 'center top',
                    endTrigger: ".halo-journey-img",
                    end: "center top",
                    scrub: true, // Adjust animation based on scroll position
                    // markers: true // Remove this line in production
                }
            }
        );
          
          
          
          