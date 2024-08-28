gsap.registerPlugin(ScrollTrigger);
let sections = gsap.utils.toArray(".slide");
const totalWidth = sections.reduce((acc, section) => {
    return acc + section.getBoundingClientRect().width;
  }, 0);
    
gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: "#iframeId",
    pin: ".pinned-elements",
    start: 'top top',
    pinSpacing: false,
    scrub: 1,
    end: `+=${totalWidth} bottom-=100px`,
    markers: {
        startColor: "transparent",
        endColor: "transparent",
    },
    onUpdate: (self) => {
        // Remove any unexpected top adjustments
        if (self.pin) {
          self.pin.style.top = "0px";
        }
      }
  }
});