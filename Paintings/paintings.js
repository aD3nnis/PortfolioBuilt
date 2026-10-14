gsap.registerPlugin(ScrollTrigger);
let sections = gsap.utils.toArray(".slide");
let viewportWidth = window.innerWidth;
gsap.to(sections, {
  xPercent: -100 * (sections.length) + ((viewportWidth/1000) * 100),
  ease: "none",
  scrollTrigger: {
    trigger: "#site-menu",
    pin: ".pinned-elements",
    start: 'top top',
    pinSpacing: false,
    scrub: 1,
    end: `+=3000px bottom`,
    markers: false,
    onUpdate: (self) => {
        if (self.pin) {
          self.pin.style.top = "0px";
        }
      }
  }
});
